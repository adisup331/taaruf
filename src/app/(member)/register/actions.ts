"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { type ActionResult } from "@/lib/action-result";

// Email sintetik untuk Supabase Auth (member tanpa Gmail).
// Member cukup tahu username + password; email ini disembunyikan.
// Bukan export: file "use server" mewajibkan semua export berupa async function.
function usernameToEmail(username: string) {
  return `${username.toLowerCase().trim()}@member.local`;
}

export async function registerManualMember(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const admin = createAdminClient();

  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();
  const namaLengkap = (formData.get("namaLengkap") as string)?.trim();

  if (!username || !password || !namaLengkap) {
    return { ok: false, message: "Username, password, dan nama wajib diisi." };
  }
  if (username.length < 3 || username.length > 30) {
    return { ok: false, message: "Username minimal 3 karakter, maksimal 30 karakter." };
  }
  if (password.length < 6) {
    return { ok: false, message: "Password minimal 6 karakter." };
  }

  const email = usernameToEmail(username);

  // Cek username sudah dipakai
  const { data: existing } = await admin
    .from("User")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return { ok: false, message: "Username sudah dipakai. Pilih yang lain." };
  }

  // 1. Buat akun di Supabase Auth (email sintetik, langsung confirmed)
  const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, name: namaLengkap, manual: true },
  });

  if (authErr || !authUser.user) {
    return { ok: false, message: `Gagal daftar: ${authErr?.message}` };
  }

  // 2. Insert ke tabel User (role MEMBER)
  const { error: userErr } = await admin.from("User").insert({
    id: authUser.user.id,
    email,
    name: namaLengkap,
    role: "MEMBER",
  });

  if (userErr) {
    await admin.auth.admin.deleteUser(authUser.user.id);
    return { ok: false, message: `Gagal buat user: ${userErr.message}` };
  }

  // 3. Buat Profil Dasar otomatis (agar admin bisa langsung daftarkan ke event)
  const { error: profileErr } = await admin.from("Profile").insert({
    userId: authUser.user.id,
    namaLengkap,
    jenisKelamin: "IKHWAN", // Default, nanti diubah saat member lengkapi profil
    tanggalLahir: new Date().toISOString(),
    asalDaerah: "-",
    asalKelompok: "-",
    asalDesa: "-",
    nomorHp: "-",
  });

  if (profileErr) {
    console.error("Gagal buat profil dasar:", profileErr);
    // Tidak rollback user karena akun auth sudah jadi, profil bisa dilengkapi nanti
  }

  return { ok: true, message: "Akun berhasil dibuat! Silakan login dengan username & password." };
}
