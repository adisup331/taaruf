"use client"

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
import { useState } from "react"

export function EditMemberDialog({ profile }: { profile: any }) {
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
          className="space-y-6 py-4"
        >
          <input type="hidden" name="userId" value={profile.userId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Nama Lengkap</label>
              <Input name="namaLengkap" defaultValue={profile.namaLengkap} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Jenis Kelamin</label>
              <select name="jenisKelamin" defaultValue={profile.jenisKelamin} className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="IKHWAN">Laki-Laki</option>
                <option value="AKHWAT">Perempuan</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Tanggal Lahir</label>
              <Input name="tanggalLahir" type="date" defaultValue={profile.tanggalLahir?.split('T')[0]} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Status Pernikahan</label>
              <select name="statusPernikahan" defaultValue={profile.statusPernikahan || "Lajang"} className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Lajang">Lajang</option>
                <option value="Duda/Janda">Duda/Janda</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Status Mubaligh</label>
              <select name="statusMubaligh" defaultValue={profile.statusMubaligh || "Non Mubaligh"} className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Non Mubaligh">Non Mubaligh</option>
                <option value="Mubaligh">Mubaligh</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Pendidikan Terakhir</label>
              <Input name="pendidikanTerakhir" defaultValue={profile.pendidikanTerakhir} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Pekerjaan</label>
              <Input name="pekerjaan" defaultValue={profile.pekerjaan} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Anak Ke</label>
                <Input name="anakKe" type="number" defaultValue={profile.anakKe} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Saudara</label>
                <Input name="jumlahSaudara" type="number" defaultValue={profile.jumlahSaudara} />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="text-[10px] font-black uppercase text-emerald-600">Dapukan Saat Ini</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input name="dapukanDaerah" defaultValue={profile.dapukanDaerah} placeholder="Daerah" />
              <Input name="dapukanDesa" defaultValue={profile.dapukanDesa} placeholder="Desa" />
              <Input name="dapukanKelompok" defaultValue={profile.dapukanKelompok} placeholder="Kelompok" />
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="text-[10px] font-black uppercase text-emerald-600">Kondisi Orang Tua</p>
            <div className="grid gap-4 sm:grid-cols-2">
               <div className="space-y-2">
                 <label className="text-xs font-medium">Ibu</label>
                 <select name="kondisiIbu" defaultValue={profile.kondisiIbu || "Masih Hidup"} className="h-9 w-full rounded-md border text-sm">
                    <option value="Masih Hidup">Masih Hidup</option>
                    <option value="Almarhum">Almarhum</option>
                 </select>
                 <select name="statusJamaahIbu" defaultValue={profile.statusJamaahIbu || "Sudah Jamaah"} className="h-9 w-full rounded-md border text-sm">
                    <option value="Sudah Jamaah">Sudah Jamaah</option>
                    <option value="Belum Jamaah">Belum Jamaah</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-medium">Bapak</label>
                 <select name="kondisiAyah" defaultValue={profile.kondisiAyah || "Masih Hidup"} className="h-9 w-full rounded-md border text-sm">
                    <option value="Masih Hidup">Masih Hidup</option>
                    <option value="Almarhum">Almarhum</option>
                 </select>
                 <select name="statusJamaahAyah" defaultValue={profile.statusJamaahAyah || "Sudah Jamaah"} className="h-9 w-full rounded-md border text-sm">
                    <option value="Sudah Jamaah">Sudah Jamaah</option>
                    <option value="Belum Jamaah">Belum Jamaah</option>
                 </select>
               </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
             <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">WhatsApp</label>
              <Input name="nomorHp" defaultValue={profile.nomorHp} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Instagram</label>
              <Input name="instagram" defaultValue={profile.instagram} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
             <Input name="asalDaerah" defaultValue={profile.asalDaerah} placeholder="Asal Daerah" />
             <Input name="asalDesa" defaultValue={profile.asalDesa} placeholder="Asal Desa" />
             <Input name="asalKelompok" defaultValue={profile.asalKelompok} placeholder="Asal Kelompok" />
          </div>

          <div className="pt-4">
            <SubmitButton pendingText="Menyimpan..." className="w-full">
              Simpan Perubahan
            </SubmitButton>
          </div>
        </ActionForm>
      </DialogContent>
    </Dialog>
  )
}
