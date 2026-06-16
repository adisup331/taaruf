"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { UserPlus, ChevronDown, ChevronUp } from "lucide-react";

interface RegisterFormProps {
  action: (prev: any, fd: FormData) => Promise<any>;
  daerahList: { nama: string }[];
  desaList: { nama: string }[];
  kelompokList: { nama: string }[];
}

const Sel = ({ name, children, ...props }: any) => (
  <select name={name} className="h-10 w-full rounded-md border bg-background px-3 text-sm" {...props}>
    {children}
  </select>
);

export function RegisterMemberForm({ action, daerahList, desaList, kelompokList }: RegisterFormProps) {
  const [showExtra, setShowExtra] = useState(false);

  return (
    <ActionForm action={action} resetOnSuccess className="space-y-4">
      {/* ─── Field Wajib ─── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Nama Lengkap *</label>
          <Input name="namaLengkap" required />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Jenis Kelamin *</label>
          <Sel name="jenisKelamin" required>
            <option value="">Pilih...</option>
            <option value="IKHWAN">Laki-Laki</option>
            <option value="AKHWAT">Perempuan</option>
          </Sel>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Tanggal Lahir *</label>
          <Input name="tanggalLahir" type="date" required />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Asal Daerah</label>
          <Sel name="asalDaerah">
            <option value="">Pilih daerah...</option>
            {daerahList.map((d) => <option key={d.nama} value={d.nama}>{d.nama}</option>)}
          </Sel>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Asal Desa</label>
          <Sel name="asalDesa">
            <option value="">Pilih desa...</option>
            {desaList.map((d) => <option key={d.nama} value={d.nama}>{d.nama}</option>)}
          </Sel>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Asal Kelompok</label>
          <Sel name="asalKelompok">
            <option value="">Pilih kelompok...</option>
            {kelompokList.map((d) => <option key={d.nama} value={d.nama}>{d.nama}</option>)}
          </Sel>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">No. HP *</label>
          <Input name="nomorHp" type="tel" required />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Instagram</label>
          <Input name="instagram" placeholder="tanpa @" />
        </div>
      </div>

      {/* ─── Toggle Pendaftaran Lengkap ─── */}
      <button
        type="button"
        onClick={() => setShowExtra(v => !v)}
        className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors py-1"
      >
        {showExtra ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showExtra ? "Sembunyikan Data Lengkap" : "Tambahkan Data Lengkap (opsional)"}
      </button>

      {/* ─── Field Tambahan ─── */}
      {showExtra && (
        <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data Tambahan — Semua Opsional</p>

          {/* Latar Belakang */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Status Mubaligh</label>
              <Sel name="statusMubaligh">
                <option value="">-</option>
                <option value="Mubaligh">Mubaligh</option>
                <option value="Non Mubaligh">Non Mubaligh</option>
              </Sel>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Pendidikan Terakhir</label>
              <Input name="pendidikanTerakhir" placeholder="SD / SMA / S1..." />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Status Pernikahan</label>
              <Sel name="statusPernikahan">
                <option value="Lajang">Lajang</option>
                <option value="Duda/Janda">Duda/Janda</option>
              </Sel>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Pekerjaan</label>
              <Input name="pekerjaan" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Anak Ke</label>
              <Input name="anakKe" type="number" min="1" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Jumlah Saudara</label>
              <Input name="jumlahSaudara" type="number" min="0" />
            </div>
          </div>

          {/* Dapukan */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Dapukan Saat Ini</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Dapukan Daerah</label>
                <Input name="dapukanDaerah" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Dapukan Desa</label>
                <Input name="dapukanDesa" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Dapukan Kelompok</label>
                <Input name="dapukanKelompok" />
              </div>
            </div>
          </div>

          {/* Kondisi Orang Tua */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Kondisi Orang Tua</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Kondisi Ibu</label>
                <Sel name="kondisiIbu">
                  <option value="">-</option>
                  <option value="Masih Hidup">Masih Hidup</option>
                  <option value="Almarhum">Almarhum</option>
                </Sel>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Status Jamaah Ibu</label>
                <Sel name="statusJamaahIbu">
                  <option value="">-</option>
                  <option value="Sudah Jamaah">Sudah Jamaah</option>
                  <option value="Belum Jamaah">Belum Jamaah</option>
                </Sel>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Kondisi Bapak</label>
                <Sel name="kondisiAyah">
                  <option value="">-</option>
                  <option value="Masih Hidup">Masih Hidup</option>
                  <option value="Almarhum">Almarhum</option>
                </Sel>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Status Jamaah Bapak</label>
                <Sel name="statusJamaahAyah">
                  <option value="">-</option>
                  <option value="Sudah Jamaah">Sudah Jamaah</option>
                  <option value="Belum Jamaah">Belum Jamaah</option>
                </Sel>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <div>
        <SubmitButton pendingText="Mendaftarkan..." className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" /> Daftarkan Member
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
