"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function RegisterProfilePage() {
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
         // Upload to Supabase Storage
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

      // We need to call a Server Action or API to save to Prisma
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
          fotoProfil: fotoProfilUrl
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
        <p className="mt-2 text-center text-sm text-gray-600">
          Data pribadi (No HP & IG) akan dijaga kerahasiaannya.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <div className="mt-1"><Input name="namaLengkap" required /></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <div className="mt-1"><Input name="tanggalLahir" type="date" required /></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
              <div className="mt-1">
                <select name="jenisKelamin" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Pilih...</option>
                  <option value="IKHWAN">Laki-Laki</option>
                  <option value="AKHWAT">Perempuan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Asal Daerah / Kota</label>
              <div className="mt-1"><Input name="asalDaerah" required placeholder="Contoh: Jakarta Selatan" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700">Asal Kelompok</label>
                 <div className="mt-1"><Input name="asalKelompok" required /></div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700">Asal Desa</label>
                 <div className="mt-1"><Input name="asalDesa" required /></div>
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">No. HP (WhatsApp)</label>
              <div className="mt-1"><Input name="nomorHp" type="tel" required placeholder="081234567890" /></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Username Instagram</label>
              <div className="mt-1"><Input name="instagram" required placeholder="tanpa @" /></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Foto Profil (Bisa diedit oleh Fotografer Event)</label>
              <div className="mt-1"><Input name="fotoProfil" type="file" accept="image/*" /></div>
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
