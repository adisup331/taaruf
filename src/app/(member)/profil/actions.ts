"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/action-result";

export async function updateProfile(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Unauthorized" };

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
  const daerahSambung = formData.get("daerahSambung") as string;
  const desaSambung = formData.get("desaSambung") as string;
  const kelompokSambung = formData.get("kelompokSambung") as string;
  const kondisiIbu = formData.get("kondisiIbu") as string;
  const kondisiAyah = formData.get("kondisiAyah") as string;
  const statusJamaahIbu = formData.get("statusJamaahIbu") as string;
  const statusJamaahAyah = formData.get("statusJamaahAyah") as string;
  const fotoProfilFile = formData.get("fotoProfil") as File;

  if (!namaLengkap || !tanggalLahir || !nomorHp) {
    return { ok: false, message: "Nama, Tanggal Lahir, dan No. HP wajib diisi." };
  }

  let fotoProfilUrl = undefined;
  if (fotoProfilFile && fotoProfilFile.size > 0) {
    const fileExt = fotoProfilFile.name.split('.').pop();
    const fileName = `member-${user.id}-${Date.now()}.${fileExt}`;
    const path = `profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("pnkb")
      .upload(path, fotoProfilFile, { upsert: true, contentType: fotoProfilFile.type });

    if (uploadError) {
      return { ok: false, message: `Gagal upload foto: ${uploadError.message}` };
    }

    const { data: pub } = supabase.storage.from("pnkb").getPublicUrl(path);
    fotoProfilUrl = `${pub.publicUrl}?v=${Date.now()}`;
  }

  const { error } = await supabase
    .from("Profile")
    .update({
      namaLengkap,
      jenisKelamin: jenisKelamin as any,
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
      daerahSambung,
      desaSambung,
      kelompokSambung,
      kondisiIbu,
      kondisiAyah,
      statusJamaahIbu,
      statusJamaahAyah,
      ...(fotoProfilUrl && { fotoProfil: fotoProfilUrl })
    })
    .eq("userId", user.id);

  if (error) return { ok: false, message: `Gagal simpan: ${error.message}` };

  revalidatePath("/profil");
  return { ok: true, message: "Profil berhasil diperbarui!" };
}
