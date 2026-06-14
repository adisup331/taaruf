"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export const dynamic = "force-dynamic";

function RegisterProfileForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/dashboard"
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      const file = formData.get("fotoProfil") as File

      let fotoProfilUrl = null
      if (file && file.size > 0) {
         const { data: { user } } = await supabase.auth.getUser()
         if (!user) throw new Error("Not authenticated")
         const namaLengkap = formData.get("namaLengkap") as string;
         const safeName = namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, "-");
         const fileExt = file.name.split('.').pop();
         const fileName = `${safeName}-${Date.now()}.${fileExt}`;
         const { data: uploadData, error: uploadError } = await supabase.storage
           .from('pnkb')
           .upload(fileName, file)
         if (uploadError) throw uploadError
         const { data: publicUrlData } = supabase.storage
           .from('pnkb')
           .getPublicUrl(fileName)
         fotoProfilUrl = publicUrlData.publicUrl
      }

      const response = await fetch("/api/profile/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLengkap: formData.get("namaLengkap"),
          tanggalLahir: formData.get("tanggalLahir"),
          jenisKelamin: formData.get("jenisKelamin"),
          asalDaerah: formData.get("asalDaerah"),
          asalKelompok: formData.get("asalKelompok"),
          asalDesa: formData.get("asalDesa"),
          nomorHp: formData.get("nomorHp"),
          instagram: formData.get("instagram"),
          fotoProfil: fotoProfilUrl,
          // New fields
          statusMubaligh: formData.get("statusMubaligh"),
          pendidikanTerakhir: formData.get("pendidikanTerakhir"),
          statusPernikahan: formData.get("statusPernikahan"),
          pekerjaan: formData.get("pekerjaan"),
          anakKe: formData.get("anakKe"),
          jumlahSaudara: formData.get("jumlahSaudara"),
          dapukanKelompok: formData.get("dapukanKelompok"),
          dapukanDesa: formData.get("dapukanDesa"),
          dapukanDaerah: formData.get("dapukanDaerah"),
          kondisiIbu: formData.get("kondisiIbu"),
          kondisiAyah: formData.get("kondisiAyah"),
          statusJamaahIbu: formData.get("statusJamaahIbu"),
        }),
      })

      if (!response.ok) throw new Error("Failed to save profile")
      router.push(next)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan. Pastikan semua data terisi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Lengkapi Biodata Taaruf
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <Input name="namaLengkap" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                  <Input name="tanggalLahir" type="date" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                  <select name="jenisKelamin" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Pilih...</option>
                    <option value="IKHWAN">Laki-Laki</option>
                    <option value="AKHWAT">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status Mubaligh</label>
                  <select name="statusMubaligh" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="Non Mubaligh">Non Mubaligh</option>
                    <option value="Mubaligh">Mubaligh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
                  <Input name="pendidikanTerakhir" placeholder="SD/SMP/SMA/S1..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status Pernikahan</label>
                  <select name="statusPernikahan" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="Lajang">Lajang</option>
                    <option value="Duda/Janda">Duda/Janda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pekerjaan</label>
                  <Input name="pekerjaan" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Anak Ke</label>
                  <Input name="anakKe" type="number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jumlah Saudara</label>
                  <Input name="jumlahSaudara" type="number" />
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest">Dapukan Saat Ini</p>
                <div className="grid grid-cols-1 gap-4">
                  <Input name="dapukanKelompok" placeholder="Kelompok" />
                  <Input name="dapukanDesa" placeholder="Desa" />
                  <Input name="dapukanDaerah" placeholder="Daerah" />
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest">Kondisi Orang Tua</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ibu</label>
                    <select name="kondisiIbu" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Masih Hidup">Masih Hidup</option>
                      <option value="Almarhum">Almarhum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bapak</label>
                    <select name="kondisiAyah" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Masih Hidup">Masih Hidup</option>
                      <option value="Almarhum">Almarhum</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Status Ibu</label>
                  <select name="statusJamaahIbu" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="Sudah Jamaah">Sudah Jamaah</option>
                    <option value="Belum Jamaah">Belum Jamaah</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                 <label className="block text-sm font-medium text-gray-700">Asal Daerah (Biodata)</label>
                 <Input name="asalDaerah" required placeholder="Kota asal" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Asal Kelompok</label>
                   <Input name="asalKelompok" required />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Asal Desa</label>
                   <Input name="asalDesa" required />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">No. HP (WhatsApp)</label>
                <Input name="nomorHp" type="tel" required placeholder="081234567890" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Username Instagram</label>
                <Input name="instagram" placeholder="tanpa @" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Foto Profil</label>
                <Input name="fotoProfil" type="file" accept="image/*" />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Profil & Lanjutkan"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function RegisterProfilePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">Memuat form...</div>}>
      <RegisterProfileForm />
    </Suspense>
  )
}
