"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ActionForm } from "@/components/admin-panel/action-form"
import { SubmitButton } from "@/components/admin-panel/submit-button"
import { adminUpdateMember } from "./actions"

interface Props {
  profile: any
  daerahList: { nama: string }[]
  desaList: { nama: string }[]
  kelompokList: { nama: string }[]
}

const Sel = ({ name, defaultValue, children, ...props }: any) => (
  <select
    name={name}
    defaultValue={defaultValue || ""}
    className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
    {...props}
  >
    {children}
  </select>
)

const Label = ({ children }: any) => (
  <label className="text-xs font-bold uppercase text-muted-foreground">{children}</label>
)

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    {children}
  </div>
)

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

        <ActionForm
          action={adminUpdateMember}
          onSuccess={() => setOpen(false)}
          className="space-y-5 py-2"
        >
          <input type="hidden" name="userId" value={profile.userId} />

          {/* ── Data Utama ── */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama Lengkap">
              <Input name="namaLengkap" defaultValue={profile.namaLengkap} required />
            </Field>
            <Field label="Jenis Kelamin">
              <Sel name="jenisKelamin" defaultValue={profile.jenisKelamin}>
                <option value="IKHWAN">Laki-Laki</option>
                <option value="AKHWAT">Perempuan</option>
              </Sel>
            </Field>
            <Field label="Tanggal Lahir">
              <Input name="tanggalLahir" type="date" defaultValue={profile.tanggalLahir?.split('T')[0]} required />
            </Field>
            <Field label="Status Pernikahan">
              <Sel name="statusPernikahan" defaultValue={profile.statusPernikahan}>
                <option value="Lajang">Lajang</option>
                <option value="Duda/Janda">Duda/Janda</option>
              </Sel>
            </Field>
          </div>

          {/* ── Asal (Dropdown) ── */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Asal (Biodata)</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Asal Daerah">
                <Sel name="asalDaerah" defaultValue={profile.asalDaerah}>
                  <option value="">— Pilih —</option>
                  {daerahList.map(d => <option key={d.nama} value={d.nama}>{d.nama}</option>)}
                </Sel>
              </Field>
              <Field label="Asal Desa">
                <Sel name="asalDesa" defaultValue={profile.asalDesa}>
                  <option value="">— Pilih —</option>
                  {desaList.map(d => <option key={d.nama} value={d.nama}>{d.nama}</option>)}
                </Sel>
              </Field>
              <Field label="Asal Kelompok">
                <Sel name="asalKelompok" defaultValue={profile.asalKelompok}>
                  <option value="">— Pilih —</option>
                  {kelompokList.map(d => <option key={d.nama} value={d.nama}>{d.nama}</option>)}
                </Sel>
              </Field>
            </div>
          </div>

          {/* ── Dapukan (Dropdown) ── */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Dapukan Saat Ini</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Dapukan Daerah">
                <Sel name="dapukanDaerah" defaultValue={profile.dapukanDaerah}>
                  <option value="">— Pilih —</option>
                  {daerahList.map(d => <option key={d.nama} value={d.nama}>{d.nama}</option>)}
                </Sel>
              </Field>
              <Field label="Dapukan Desa">
                <Sel name="dapukanDesa" defaultValue={profile.dapukanDesa}>
                  <option value="">— Pilih —</option>
                  {desaList.map(d => <option key={d.nama} value={d.nama}>{d.nama}</option>)}
                </Sel>
              </Field>
              <Field label="Dapukan Kelompok">
                <Sel name="dapukanKelompok" defaultValue={profile.dapukanKelompok}>
                  <option value="">— Pilih —</option>
                  {kelompokList.map(d => <option key={d.nama} value={d.nama}>{d.nama}</option>)}
                </Sel>
              </Field>
            </div>
          </div>

          {/* ── Latar Belakang ── */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Latar Belakang</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Status Mubaligh">
                <Sel name="statusMubaligh" defaultValue={profile.statusMubaligh}>
                  <option value="">— Pilih —</option>
                  <option value="Non Mubaligh">Non Mubaligh</option>
                  <option value="Mubaligh">Mubaligh</option>
                </Sel>
              </Field>
              <Field label="Pendidikan Terakhir">
                <Input name="pendidikanTerakhir" defaultValue={profile.pendidikanTerakhir} placeholder="SD / SMA / S1..." />
              </Field>
              <Field label="Pekerjaan">
                <Input name="pekerjaan" defaultValue={profile.pekerjaan} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Anak Ke">
                  <Input name="anakKe" type="number" defaultValue={profile.anakKe} />
                </Field>
                <Field label="Jml Saudara">
                  <Input name="jumlahSaudara" type="number" defaultValue={profile.jumlahSaudara} />
                </Field>
              </div>
            </div>
          </div>

          {/* ── Kondisi Orang Tua ── */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Kondisi Orang Tua</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Ibu</Label>
                <Sel name="kondisiIbu" defaultValue={profile.kondisiIbu}>
                  <option value="">— Pilih —</option>
                  <option value="Masih Hidup">Masih Hidup</option>
                  <option value="Almarhum">Almarhum</option>
                </Sel>
                <Sel name="statusJamaahIbu" defaultValue={profile.statusJamaahIbu}>
                  <option value="">— Status Jamaah —</option>
                  <option value="Sudah Jamaah">Sudah Jamaah</option>
                  <option value="Belum Jamaah">Belum Jamaah</option>
                </Sel>
              </div>
              <div className="space-y-2">
                <Label>Bapak</Label>
                <Sel name="kondisiAyah" defaultValue={profile.kondisiAyah}>
                  <option value="">— Pilih —</option>
                  <option value="Masih Hidup">Masih Hidup</option>
                  <option value="Almarhum">Almarhum</option>
                </Sel>
                <Sel name="statusJamaahAyah" defaultValue={profile.statusJamaahAyah}>
                  <option value="">— Status Jamaah —</option>
                  <option value="Sudah Jamaah">Sudah Jamaah</option>
                  <option value="Belum Jamaah">Belum Jamaah</option>
                </Sel>
              </div>
            </div>
          </div>

          {/* ── Kontak ── */}
          <div className="grid gap-3 sm:grid-cols-2 border-t pt-4">
            <Field label="WhatsApp">
              <Input name="nomorHp" defaultValue={profile.nomorHp} required />
            </Field>
            <Field label="Instagram">
              <Input name="instagram" defaultValue={profile.instagram} placeholder="tanpa @" />
            </Field>
          </div>

          <div className="pt-2">
            <SubmitButton pendingText="Menyimpan..." className="w-full">
              Simpan Perubahan
            </SubmitButton>
          </div>
        </ActionForm>
      </DialogContent>
    </Dialog>
  )
}
