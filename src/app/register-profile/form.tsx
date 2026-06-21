"use client"

import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, Calendar, MapPin, Loader2 } from "lucide-react"

type ActiveEvent = {
  id: string
  title: string
  date: string
  location: string
}

interface Props {
  activeEvents: ActiveEvent[]
}

const STEPS = [
  { title: "Data Pribadi", desc: "Nama, tanggal lahir, gender" },
  { title: "Asal & Wilayah", desc: "Daerah, kontak" },
  { title: "Keluarga", desc: "Orang tua, saudara" },
  { title: "Foto Profil", desc: "Upload foto wajib" },
  { title: "Daftar Event", desc: "Pilih event (opsional)" },
]

const Sel = ({ name, children, ...props }: any) => (
  <select name={name} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...props}>
    {children}
  </select>
)

export default function RegisterProfileForm({ activeEvents }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/dashboard"
  const supabase = createClient()
  const formRef = useRef<HTMLFormElement>(null)

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFotoFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  function goNext() {
    if (step === 3 && !fotoFile && !fotoPreview) {
      alert("Foto profil wajib diupload.")
      return
    }
    if (step < STEPS.length - 1) setStep(step + 1)
  }

  function goBack() {
    if (step > 0) setStep(step - 1)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (step < STEPS.length - 1) { goNext(); return }

    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)

      let fotoProfilUrl = null
      if (fotoFile) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")
        const namaLengkap = formData.get("namaLengkap") as string
        const safeName = namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, "-")
        const fileExt = fotoFile.name.split(".").pop()
        const fileName = `${safeName}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from("pnkb").upload(fileName, fotoFile)
        if (uploadError) throw uploadError
        const { data: publicUrlData } = supabase.storage.from("pnkb").getPublicUrl(fileName)
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
          statusJamaahAyah: formData.get("statusJamaahAyah"),
          eventId: selectedEventId || null,
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

  const isLast = step === STEPS.length - 1

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col justify-center py-8 px-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <button type="button" onClick={() => setStep(i)} className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer hover:scale-110 ${
                  i < step ? "bg-emerald-600 text-white" : i === step ? "bg-emerald-600 text-white ring-4 ring-emerald-100" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                }`}>
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </button>
                <p className={`text-[10px] font-bold mt-1 text-center leading-tight ${i <= step ? "text-emerald-700" : "text-gray-400"}`}>
                  {s.title}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-emerald-500" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-black text-gray-900">{STEPS[step].title}</h2>
            <p className="text-sm text-gray-500">{STEPS[step].desc}</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit}>
            {/* All fields rendered but only current step visible */}
            {/* Step 1: Data Pribadi */}
            <div className={step === 0 ? "space-y-4" : "hidden"}>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label>
                <Input name="namaLengkap" required placeholder="Nama sesuai biodata" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Tanggal Lahir</label>
                  <Input name="tanggalLahir" type="date" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Jenis Kelamin</label>
                  <Sel name="jenisKelamin" required>
                    <option value="">Pilih...</option>
                    <option value="IKHWAN">Laki-Laki</option>
                    <option value="AKHWAT">Perempuan</option>
                  </Sel>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Status Pernikahan</label>
                  <Sel name="statusPernikahan">
                    <option value="Lajang">Lajang</option>
                    <option value="Duda/Janda">Duda/Janda</option>
                  </Sel>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Pendidikan</label>
                  <Input name="pendidikanTerakhir" placeholder="SMA / S1 / dll" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Pekerjaan</label>
                <Input name="pekerjaan" placeholder="Wiraswasta, PNS, dll" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Status Mubaligh</label>
                <Sel name="statusMubaligh">
                  <option value="">&#8212;</option>
                  <option value="Non Mubaligh">Non Mubaligh</option>
                  <option value="Mubaligh">Mubaligh</option>
                </Sel>
              </div>
            </div>

            {/* Step 2: Asal & Wilayah */}
            <div className={step === 1 ? "space-y-4" : "hidden"}>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Asal Daerah</label>
                <Input name="asalDaerah" required placeholder="Kota asal" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Asal Desa</label>
                  <Input name="asalDesa" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Asal Kelompok</label>
                  <Input name="asalKelompok" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Dapukan Daerah</label>
                  <Input name="dapukanDaerah" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Dapukan Desa</label>
                  <Input name="dapukanDesa" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Dapukan Kelompok</label>
                  <Input name="dapukanKelompok" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">No. HP (WhatsApp)</label>
                <Input name="nomorHp" type="tel" required placeholder="081234567890" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Username Instagram</label>
                <Input name="instagram" placeholder="tanpa @" />
              </div>
            </div>

            {/* Step 3: Keluarga */}
            <div className={step === 2 ? "space-y-4" : "hidden"}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Anak Ke</label>
                  <Input name="anakKe" type="number" min="1" placeholder="1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Jumlah Saudara</label>
                  <Input name="jumlahSaudara" type="number" min="0" placeholder="3" />
                </div>
              </div>
              <div className="border rounded-xl p-4 space-y-3">
                <p className="text-xs font-black text-gray-400 uppercase">Kondisi Ibu</p>
                <Sel name="kondisiIbu">
                  <option value="">&#8212;</option>
                  <option value="Masih Hidup">Masih Hidup</option>
                  <option value="Almarhum">Almarhum</option>
                </Sel>
                <Sel name="statusJamaahIbu">
                  <option value="Sudah Jamaah">Sudah Jamaah</option>
                  <option value="Belum Jamaah">Belum Jamaah</option>
                </Sel>
              </div>
              <div className="border rounded-xl p-4 space-y-3">
                <p className="text-xs font-black text-gray-400 uppercase">Kondisi Bapak</p>
                <Sel name="kondisiAyah">
                  <option value="">&#8212;</option>
                  <option value="Masih Hidup">Masih Hidup</option>
                  <option value="Almarhum">Almarhum</option>
                </Sel>
                <Sel name="statusJamaahAyah">
                  <option value="Sudah Jamaah">Sudah Jamaah</option>
                  <option value="Belum Jamaah">Belum Jamaah</option>
                </Sel>
              </div>
            </div>

            {/* Step 4: Foto Profil */}
            <div className={step === 3 ? "space-y-4" : "hidden"}>
              <div className="flex flex-col items-center gap-4">
                <div
                  className="relative h-48 w-48 rounded-3xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 cursor-pointer hover:border-emerald-400 transition-colors flex items-center justify-center"
                  onClick={() => document.getElementById("fotoInput")?.click()}
                >
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-bold">Tap untuk upload foto</p>
                    </div>
                  )}
                </div>
                <input id="fotoInput" type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                <p className="text-xs text-gray-500 text-center">
                  {fotoPreview ? "Foto terpilih. Tap untuk ganti." : "Foto profil wajib diupload."}
                </p>
                {fotoPreview && (
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("fotoInput")?.click()}>
                    Ganti Foto
                  </Button>
                )}
              </div>
            </div>

            {/* Step 5: Daftar Event */}
            <div className={step === 4 ? "space-y-4" : "hidden"}>
              {activeEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Tidak ada event aktif saat ini.</p>
                  <p className="text-xs text-gray-400 mt-1">Kamu bisa daftar event nanti lewat QR Code panitia.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-transparent hover:border-gray-200 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="eventRadio"
                      value=""
                      checked={selectedEventId === ""}
                      onChange={() => setSelectedEventId("")}
                      className="accent-emerald-600"
                    />
                    <span className="text-sm text-gray-500">Lewati, tidak daftar event sekarang</span>
                  </label>
                  {activeEvents.map((ev) => (
                    <label
                      key={ev.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedEventId === ev.id
                          ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100"
                          : "border-gray-100 hover:border-emerald-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="eventRadio"
                        value={ev.id}
                        checked={selectedEventId === ev.id}
                        onChange={() => setSelectedEventId(ev.id)}
                        className="mt-1 accent-emerald-600"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{ev.title}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(ev.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {ev.location}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={goBack} className="flex-1 h-12 rounded-xl font-bold">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                </Button>
              )}
              {!isLast ? (
                <Button type="button" onClick={goNext} className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold">
                  Lanjut <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : <>Simpan & Lanjutkan <CheckCircle2 className="h-4 w-4 ml-2" /></>}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}