"use client"

import * as React from "react"
import Image from "next/image"
import { Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiveCamera } from "@/components/admin-panel/live-camera"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { genderLabel, photoUrl } from "@/lib/utils"

interface PhotographyClientProps {
  attendee: any
  activeEvents: any[]
  currentEventId: string
  queryNum: string
}

export function PhotographyClient({
  attendee,
  activeEvents,
  currentEventId,
  queryNum,
}: PhotographyClientProps) {
  const router = useRouter()
  const [showCamera, setShowCamera] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [localFotoEvent, setLocalFotoEvent] = React.useState<string | null>(null)

  const userData = Array.isArray(attendee?.User) ? attendee.User[0] : attendee?.User
  const profile = Array.isArray(userData?.Profile) ? userData.Profile[0] : userData?.Profile

  // Sync localFotoEvent when attendee/profile changes (e.g. new search)
  React.useEffect(() => {
    setLocalFotoEvent(null)
  }, [attendee])

  // Resolved foto event: prefer local updated URL, fallback to server prop
  const resolvedFotoEvent = localFotoEvent ?? profile?.fotoEvent

  const handleCapture = async (blob: Blob) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("photo", blob, "capture.jpg")
      formData.append("eventId", currentEventId)
      formData.append("profileId", profile.id)

      const res = await fetch("/api/admin/photography/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Upload gagal")
      }

      // Update foto langsung di client state
      if (data.url) {
        setLocalFotoEvent(data.url)
      }

      toast.success("Foto berhasil diperbarui!")
      setShowCamera(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah foto.")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mx-auto mt-6 max-w-xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Studio Foto Acara</h2>
        <p className="text-muted-foreground">Ketik Nomor Peserta untuk update foto profil.</p>
      </div>

      <form method="GET" className="flex flex-col gap-4">
        <select
          name="eventId"
          className="h-12 w-full rounded-md border bg-background px-3"
          required
          defaultValue={currentEventId}
        >
          <option value="">Pilih Event Aktif</option>
          {activeEvents?.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <Input
            name="num"
            placeholder="No. Peserta (cth: 1)"
            defaultValue={queryNum}
            className="h-14 text-center text-2xl font-bold"
            autoFocus
          />
          <Button type="submit" className="h-14 px-8 text-lg">Cari</Button>
        </div>
      </form>

      {queryNum && currentEventId && !attendee && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center font-bold text-destructive">
          Peserta {queryNum} tidak ditemukan di event ini.
        </div>
      )}

      {profile && (
        <div className="space-y-6 rounded-2xl border bg-card p-6 text-center shadow-sm relative overflow-hidden">
          {showCamera ? (
            <LiveCamera
              onCapture={handleCapture}
              onCancel={() => setShowCamera(false)}
              isUploading={isUploading}
            />
          ) : (
            <>
              {/* Nomor Peserta */}
              <div className="flex justify-center">
                <div className="inline-flex flex-col items-center rounded-xl bg-primary px-8 py-2 text-primary-foreground">
                  <span className="text-[10px] uppercase tracking-widest opacity-80">No. Peserta</span>
                  <span className="text-3xl font-black leading-none">{attendee.participantNumber}</span>
                </div>
              </div>

              {/* DETAIL BIODATA (Validasi) */}
              <div className="rounded-xl border bg-muted/30 p-4 text-left">
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Validasi Data Peserta
                </p>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Nama</dt>
                    <dd className="font-bold text-right">{profile.namaLengkap}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Jenis Kelamin</dt>
                    <dd className="font-medium text-right">{genderLabel(profile.jenisKelamin)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Asal Daerah</dt>
                    <dd className="font-medium text-right">{profile.asalDaerah || "-"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Desa</dt>
                    <dd className="font-medium text-right">{profile.asalDesa || "-"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Kelompok</dt>
                    <dd className="font-medium text-right">{profile.asalKelompok || "-"}</dd>
                  </div>
                </dl>
              </div>

              {/* Foto saat ini */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Foto Profil</p>
                  <div className="relative h-48 w-full overflow-hidden rounded-xl border-2 border-white shadow-md bg-muted">
                    {photoUrl(profile.fotoProfil) ? (
                      <Image src={photoUrl(profile.fotoProfil)!} fill unoptimized className="object-cover" alt="Current Profil" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground opacity-20"><Camera className="h-8 w-8" /></div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-emerald-600">Foto Studio Event</p>
                  <div className="relative h-48 w-full overflow-hidden rounded-xl border-2 border-emerald-100 shadow-md bg-emerald-50/30">
                    {photoUrl(resolvedFotoEvent) ? (
                      <Image src={photoUrl(resolvedFotoEvent)!} fill unoptimized className="object-cover" alt="Current Event" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-600/30">
                        <Camera className="h-8 w-8 mb-1" />
                        <span className="text-[10px] font-bold">BELUM ADA</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowCamera(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 h-12 font-bold"
                >
                  <Camera className="mr-2 h-5 w-5" /> Ambil Foto
                </Button>

                <label className="cursor-pointer">
                  <div className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 font-bold hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Upload className="h-5 w-5" /> Pilih File
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) handleCapture(file)
                    }}
                  />
                </label>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
