"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/action-result";

export async function createStaff(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = createClient();
  const admin = createAdminClient();

  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const role = formData.get("role") as "ADMIN" | "PHOTOGRAPHER";
  const jenisKelamin = formData.get("jenisKelamin") as string;
  const nomorHp = (formData.get("nomorHp") as string)?.trim();

  if (!email || !password || !name || !role || !jenisKelamin || !nomorHp) {
    return { ok: false, message: "Semua field wajib diisi." };
  }

  // 1. Create user in Supabase Auth via Admin API
  const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role }
  });

  if (authErr || !authUser.user) {
    return { ok: false, message: `Gagal buat Auth: ${authErr?.message}` };
  }

  const userId = authUser.user.id;

  // 2. Insert into public.User table
  const { error: userErr } = await supabase.from("User").insert({
    id: userId,
    email,
    name,
    role
  });

  if (userErr) {
    // Cleanup auth user if DB insert fails
    await admin.auth.admin.deleteUser(userId);
    return { ok: false, message: `Gagal buat User: ${userErr.message}` };
  }

  // 3. Insert into public.Profile table
  const { error: profileErr } = await supabase.from("Profile").insert({
    userId,
    namaLengkap: name,
    jenisKelamin,
    tanggalLahir: new Date().toISOString(), // Default for staff
    asalDaerah: "-",
    asalKelompok: "-",
    asalDesa: "-",
    nomorHp,
    instagram: "-",
  });

  if (profileErr) {
    return { ok: false, message: `Gagal buat Profil: ${profileErr.message}` };
  }

  revalidatePath("/admin/staff");
  return { ok: true, message: `Staff "${name}" berhasil didaftarkan.` };
}

export async function deleteStaff(userId: string): Promise<ActionResult> {
  const supabase = createClient();
  const admin = createAdminClient();

  // 1. Delete from Auth
  const { error: authErr } = await admin.auth.admin.deleteUser(userId);
  if (authErr) return { ok: false, message: `Gagal hapus Auth: ${authErr.message}` };

  // 2. Delete from Profile (Cascade should handle this if defined, but doing manually to be safe)
  await supabase.from("Profile").delete().eq("userId", userId);

  // 3. Delete from User
  const { error: userErr } = await supabase.from("User").delete().eq("id", userId);
  if (userErr) return { ok: false, message: `Gagal hapus User: ${userErr.message}` };

  revalidatePath("/admin/staff");
  return { ok: true, message: "Staff berhasil dihapus." };
}

export async function updateStaffRole(userId: string, role: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("User").update({ role }).eq("id", userId);

  if (error) return { ok: false, message: `Gagal update role: ${error.message}` };

  revalidatePath("/admin/staff");
  return { ok: true, message: "Role staff diperbarui." };
}
