"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/action-result";

export async function updateProfile(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Unauthorized" };

  const namaLengkap = (formData.get("namaLengkap") as string)?.trim();
  const tanggalLahir = formData.get("tanggalLahir") as string;
  const asalDaerah = (formData.get("asalDaerah") as string)?.trim();
  const asalKelompok = (formData.get("asalKelompok") as string)?.trim();
  const asalDesa = (formData.get("asalDesa") as string)?.trim();
  const nomorHp = (formData.get("nomorHp") as string)?.trim();
  const instagram = (formData.get("instagram") as string)?.trim();

  // New fields
  const statusMubaligh = formData.get("statusMubaligh") as string;
  const pendidikanTerakhir = formData.get("pendidikanTerakhir") as string;
  const statusPernikahan = formData.get("statusPernikahan") as string;
  const pekerjaan = formData.get("pekerjaan") as string;
  const anakKe = formData.get("anakKe") as string;
  const jumlahSaudara = formData.get("jumlahSaudara") as string;
  const dapukanKelompok = formData.get("dapukanKelompok") as string;
  const dapukanDesa = formData.get("dapukanDesa") as string;
  const dapukanDaerah = formData.get("dapukanDaerah") as string;
  const kondisiIbu = formData.get("kondisiIbu") as string;
  const kondisiAyah = formData.get("kondisiAyah") as string;
  const statusJamaahIbu = formData.get("statusJamaahIbu") as string;

  if (!namaLengkap || !tanggalLahir || !nomorHp) {
    return { ok: false, message: "Nama, Tanggal Lahir, dan No. HP wajib diisi." };
  }

  const { error } = await supabase
    .from("Profile")
    .update({
      namaLengkap,
      tanggalLahir: new Date(tanggalLahir).toISOString(),
      asalDaerah,
      asalKelompok,
      asalDesa,
      nomorHp,
      instagram,
      statusMubaligh,
      pendidikanTerakhir,
      statusPernikahan,
      pekerjaan,
      anakKe: anakKe ? parseInt(anakKe) : null,
      jumlahSaudara: jumlahSaudara ? parseInt(jumlahSaudara) : null,
      dapukanKelompok,
      dapukanDesa,
      dapukanDaerah,
      kondisiIbu,
      kondisiAyah,
      statusJamaahIbu
    })
    .eq("userId", user.id);

  if (error) return { ok: false, message: `Gagal simpan: ${error.message}` };

  revalidatePath("/profil");
  return { ok: true, message: "Profil berhasil diperbarui!" };
}
