"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/action-result";

export async function createEventStaff(
  eventId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const admin = createAdminClient();

  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();
  const label = (formData.get("label") as string)?.trim() || "Pengurus";

  if (!username || !password) {
    return { ok: false, message: "Username dan password wajib diisi." };
  }

  if (username.length < 3) {
    return { ok: false, message: "Username minimal 3 karakter." };
  }

  if (password.length < 6) {
    return { ok: false, message: "Password minimal 6 karakter." };
  }

  // Check username uniqueness
  const { data: existing } = await supabase
    .from("EventStaff")
    .select("id")
    .eq("username", username)
    .single();

  if (existing) {
    return { ok: false, message: `Username "${username}" sudah digunakan.` };
  }

  // Synthetic email for this staff account
  const email = `${username}@event-staff.local`;

  // 1. Create Supabase Auth user
  const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: label, role: "EVENT_STAFF" },
  });

  if (authErr || !authUser.user) {
    return { ok: false, message: `Gagal buat akun: ${authErr?.message}` };
  }

  const userId = authUser.user.id;

  // 2. Insert into User table
  const { error: userErr } = await supabase.from("User").insert({
    id: userId,
    email,
    name: label,
    role: "EVENT_STAFF",
  });

  if (userErr) {
    await admin.auth.admin.deleteUser(userId);
    return { ok: false, message: `Gagal buat User: ${userErr.message}` };
  }

  // 3. Insert into EventStaff table
  const { error: staffErr } = await supabase.from("EventStaff").insert({
    eventId,
    userId,
    username,
    label,
  });

  if (staffErr) {
    await admin.auth.admin.deleteUser(userId);
    await supabase.from("User").delete().eq("id", userId);
    return { ok: false, message: `Gagal buat EventStaff: ${staffErr.message}` };
  }

  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true, message: `Akun pengurus "${username}" berhasil dibuat.` };
}

export async function deleteEventStaff(
  eventStaffId: string,
  eventId: string
): Promise<ActionResult> {
  const supabase = createClient();
  const admin = createAdminClient();

  // Get the staff record first
  const { data: staff } = await supabase
    .from("EventStaff")
    .select("userId")
    .eq("id", eventStaffId)
    .single();

  if (!staff) {
    return { ok: false, message: "Data pengurus tidak ditemukan." };
  }

  // Delete Auth user
  await admin.auth.admin.deleteUser(staff.userId);

  // Delete User record (cascade will handle EventStaff)
  await supabase.from("User").delete().eq("id", staff.userId);

  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true, message: "Akun pengurus berhasil dihapus." };
}

export async function resetEventStaffPassword(
  eventStaffId: string,
  eventId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const admin = createAdminClient();

  const newPassword = (formData.get("password") as string)?.trim();

  if (!newPassword || newPassword.length < 6) {
    return { ok: false, message: "Password minimal 6 karakter." };
  }

  const { data: staff } = await supabase
    .from("EventStaff")
    .select("userId")
    .eq("id", eventStaffId)
    .single();

  if (!staff) {
    return { ok: false, message: "Data pengurus tidak ditemukan." };
  }

  const { error } = await admin.auth.admin.updateUserById(staff.userId, {
    password: newPassword,
  });

  if (error) {
    return { ok: false, message: `Gagal reset password: ${error.message}` };
  }

  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true, message: "Password berhasil direset." };
}
