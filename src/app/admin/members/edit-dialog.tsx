"use client"

import { useState, useMemo, useRef } from "react"
import { Pencil, Camera, Upload, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn, photoUrl } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ActionForm } from "@/components/admin-panel/action-form"
import { SubmitButton } from "@/components/admin-panel/submit-button"
import { WilayahSearch } from "@/components/admin-panel/wilayah-search"
import { adminUpdateMember } from "./actions"

interface WilayahItem { nama: string }
interface DesaItem extends WilayahItem { daerahId?: string }
interface KelompokItem extends WilayahItem { desaId?: string }

interface Props {
  profile: any
  daerahList: WilayahItem[]
  desaList: DesaItem[]
  kelompokList: KelompokItem[]
}

const Sel = ({ name, children, ...props }: any) => (
  <select name={name} className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...props}>
    {children}
  </select>
)
const Label = ({ children }: any) => <label className="text-xs font-bold uppercase text-muted-foreground">{children}</label>
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1"><Label>{label}</Label>{children}</div>
)

// ── Cascading group menggunakan client-side filter ──
function CascadingGroup({
  prefix, initDaerah, initDesa, initKelompok,
  daerahList, desaList, kelompokList,
}: {
  prefix: string; initDaerah: string; initDesa: string; initKelompok: string
  daerahList: WilayahItem[]; desaList: DesaItem[]; kelompokList: KelompokItem[]
}) {
  // Map: asalDaerah, asalDesa, asalKelompok / dapukanDaerah, dapukanDesa, dapukanKelompok / daerahSambung, desaSambung, kelompokSambung
  const fieldKeys: Record<string, [string, string, string]> = {
    asal: ["asalDaerah", "asalDesa", "asalKelompok"],
    dapukan: ["dapukanDaerah", "dapukanDesa", "dapukanKelompok"],
    sambung: ["daerahSambung", "desaSambung", "kelompokSambung"],
  }
  const [dKey, dsKey, kKey] = fieldKeys[prefix] || [prefix + "Daerah", prefix + "Desa", prefix + "Kelompok"]

  // Map nama → id dari indexed data
  const daerahMap = useMemo(() => {
    const map = new Map<string, string>()
    daerahList.forEach(d => (d as any).id && map.set(d.nama, (d as any).id))
    return map
  }, [daerahList])

  const desaParentMap = useMemo(() => {
    // Map nama desa → nama daerah parent (untuk filter client-side)
    const map = new Map<string, string>()
    desaList.forEach(d => {
      const daerahId = (d as any).daerahId
      const daerahNama = daerahList.find(dd => (dd as any).id === daerahId)?.nama
      if (daerahNama && d.nama) map.set(d.nama, daerahNama)
    })
    return map
  }, [desaList, daerahList])

  const kelompokParentMap = useMemo(() => {
    const map = new Map<string, string>()
    kelompokList.forEach(k => {
      const desaId = (k as any).desaId
      const desaNama = desaList.find(d => (d as any).id === desaId)?.nama
      if (desaNama && k.nama) map.set(k.nama, desaNama)
    })
    return map
  }, [kelompokList, desaList])

  const [daerah, setDaerah] = useState(initDaerah)
  const [desa, setDesa] = useState(initDesa)
  const [kelompok, setKelompok] = useState(initKelompok)

  // Filtered options
  const desaOpts = useMemo(() => {
    if (!daerah) return desaList
    return desaList.filter(d => desaParentMap.get(d.nama) === daerah)
  }, [daerah, desaList, desaParentMap])

  const kelOpts = useMemo(() => {
    if (!desa) return daerah ? [] : kelompokList
    return kelompokList.filter(k => kelompokParentMap.get(k.nama) === desa)
  }, [desa, daerah, kelompokList, kelompokParentMap])

  function handleDaerah(val: string) {
    setDaerah(val)
    setDesa("")
    setKelompok("")
  }

  function handleDesa(val: string) {
    setDesa(val)
    setKelompok("")
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <WilayahSearch name={dKey} label="Daerah" value={daerah} onChange={handleDaerah} options={daerahList} table="Daerah" />
      <WilayahSearch name={dsKey} label="Desa" value={desa} onChange={handleDesa} options={desaOpts} table="Desa" parentId={daerahMap.get(daerah) || ""} />
      <WilayahSearch name={kKey} label="Kelompok" value={kelompok} onChange={setKelompok} options={kelOpts} table="Kelompok" parentId={"" /* resolved on add via API */} />
    </div>
  )
}

// ── Photo Upload with Preview ──
function PhotoUpload({ profileId, type, label, currentUrl }: { profileId: string; type: string; label: string; currentUrl?: string | null }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(photoUrl(currentUrl))
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function doUpload() {
    if (!selectedFile) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("photo", selectedFile)
      fd.append("profileId", profileId)
      fd.append("type", type)
      const res = await fetch("/api/admin/members/upload-photo", { method: "POST", body: fd })
      const data = await res.json()
      if (!data.ok) throw new Error(data.message)
      toast.success(`${label} berhasil diperbarui!`)
      setPreview(photoUrl(data.url))
      setSelectedFile(null)
      setLocalPreview(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Gagal upload")
    } finally {
      setUploading(false)
    }
  }

  function handleSelect(file: File) {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setLocalPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function cancel() {
    setSelectedFile(null)
    setLocalPreview(null)
  }

  const displayUrl = localPreview || preview

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
          {displayUrl ? (
            <img src={displayUrl} className="h-full w-full object-cover" alt="" />
          ) : (
            <div className="flex h-full items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground opacity-30" /></div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate">{label}</p>
          <p className="text-[10px] text-muted-foreground">
            {localPreview ? "Preview — klik Simpan atau Batal" : (preview ? "Foto tersimpan" : "Belum ada foto")}
          </p>
        </div>
        {!localPreview && (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 mr-1" />{preview ? "Ganti" : "Upload"}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleSelect(f); e.target.value = "" }} />
          </>
        )}
      </div>
      {localPreview && (
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" size="sm" onClick={cancel} disabled={uploading}>Batal</Button>
          <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={doUpload} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {uploading ? "Menyimpan..." : "Simpan Foto"}
          </Button>
        </div>
      )}
    </div>
  )
}

export function EditMemberDialog({ profile, daerahList, desaList, kelompokList }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-600">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Member: {profile.namaLengkap}</DialogTitle>
        </DialogHeader>

        <ActionForm action={adminUpdateMember} onSuccess={() => setOpen(false)} className="space-y-5 py-2">
          <input type="hidden" name="userId" value={profile.userId} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama Lengkap"><Input name="namaLengkap" defaultValue={profile.namaLengkap} required /></Field>
            <Field label="Jenis Kelamin">
              <Sel name="jenisKelamin" defaultValue={profile.jenisKelamin}><option value="IKHWAN">Laki-Laki</option><option value="AKHWAT">Perempuan</option></Sel>
            </Field>
            <Field label="Tanggal Lahir"><Input name="tanggalLahir" type="date" defaultValue={profile.tanggalLahir?.split('T')[0]} required /></Field>
            <Field label="Status Pernikahan">
              <Sel name="statusPernikahan" defaultValue={profile.statusPernikahan}><option value="Lajang">Lajang</option><option value="Duda/Janda">Duda/Janda</option></Sel>
            </Field>
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Asal (Biodata)</p>
            <CascadingGroup prefix="asal" initDaerah={profile.asalDaerah || ""} initDesa={profile.asalDesa || ""} initKelompok={profile.asalKelompok || ""} daerahList={daerahList} desaList={desaList} kelompokList={kelompokList} />
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Dapukan Saat Ini</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Dapukan Daerah"><Input name="dapukanDaerah" defaultValue={profile.dapukanDaerah} placeholder="Daerah" /></Field>
              <Field label="Dapukan Desa"><Input name="dapukanDesa" defaultValue={profile.dapukanDesa} placeholder="Desa" /></Field>
              <Field label="Dapukan Kelompok"><Input name="dapukanKelompok" defaultValue={profile.dapukanKelompok} placeholder="Kelompok" /></Field>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Daerah Sambung</p>
            <CascadingGroup prefix="sambung" initDaerah={profile.daerahSambung || ""} initDesa={profile.desaSambung || ""} initKelompok={profile.kelompokSambung || ""} daerahList={daerahList} desaList={desaList} kelompokList={kelompokList} />
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Latar Belakang</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Mubaligh"><Sel name="statusMubaligh" defaultValue={profile.statusMubaligh}><option value="">—</option><option value="Non Mubaligh">Non Mubaligh</option><option value="Mubaligh">Mubaligh</option></Sel></Field>
              <Field label="Pendidikan"><Input name="pendidikanTerakhir" defaultValue={profile.pendidikanTerakhir} /></Field>
              <Field label="Pekerjaan"><Input name="pekerjaan" defaultValue={profile.pekerjaan} /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Anak Ke"><Input name="anakKe" type="number" defaultValue={profile.anakKe} /></Field>
                <Field label="Saudara"><Input name="jumlahSaudara" type="number" defaultValue={profile.jumlahSaudara} /></Field>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Kondisi Orang Tua</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Ibu</Label>
                <Sel name="kondisiIbu" defaultValue={profile.kondisiIbu}><option value="">—</option><option value="Masih Hidup">Masih Hidup</option><option value="Almarhum">Almarhum</option></Sel>
                <Sel name="statusJamaahIbu" defaultValue={profile.statusJamaahIbu}><option value="">— Status —</option><option value="Sudah Jamaah">Sudah Jamaah</option><option value="Belum Jamaah">Belum Jamaah</option></Sel>
              </div>
              <div className="space-y-2">
                <Label>Bapak</Label>
                <Sel name="kondisiAyah" defaultValue={profile.kondisiAyah}><option value="">—</option><option value="Masih Hidup">Masih Hidup</option><option value="Almarhum">Almarhum</option></Sel>
                <Sel name="statusJamaahAyah" defaultValue={profile.statusJamaahAyah}><option value="">— Status —</option><option value="Sudah Jamaah">Sudah Jamaah</option><option value="Belum Jamaah">Belum Jamaah</option></Sel>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 border-t pt-4">
            <Field label="WhatsApp"><Input name="nomorHp" defaultValue={profile.nomorHp} required /></Field>
            <Field label="Instagram"><Input name="instagram" defaultValue={profile.instagram} /></Field>
          </div>

          {/* ── Upload Foto ── */}
          <div className="border-t pt-4 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Upload Foto</p>
            <PhotoUpload profileId={profile.id} type="fotoProfil" label="Foto Profil" currentUrl={profile.fotoProfil} />
            <PhotoUpload profileId={profile.id} type="fotoEvent" label="Foto Event (Studio)" currentUrl={profile.fotoEvent} />
          </div>

          <div className="pt-2">
            <SubmitButton pendingText="Menyimpan..." className="w-full">Simpan Perubahan</SubmitButton>
          </div>
        </ActionForm>
      </DialogContent>
    </Dialog>
  )
}
