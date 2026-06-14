"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/action-result";

export async function adminUpdateMember(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = createClient();

  const userId = formData.get("userId") as string;
  const namaLengkap = (formData.get("namaLengkap") as string)?.trim();
  const jenisKelamin = formData.get("jenisKelamin") as string;
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
  const statusJamaahAyah = formData.get("statusJamaahAyah") as string;

  if (!userId || !namaLengkap || !jenisKelamin || !tanggalLahir) {
    return { ok: false, message: "Field wajib belum terisi." };
  }

  const { error } = await supabase
    .from("Profile")
    .update({
      namaLengkap,
      jenisKelamin,
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
      statusJamaahIbu,
      statusJamaahAyah
    })
    .eq("userId", userId);

  if (error) return { ok: false, message: `Gagal update: ${error.message}` };

  revalidatePath("/admin/members");
  return { ok: true, message: `Data "${namaLengkap}" berhasil diperbarui.` };
}
