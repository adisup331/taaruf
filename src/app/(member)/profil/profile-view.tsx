"use client";

import { useState } from "react";
import { User, Pencil, Save, X, Calendar, MapPin, Home, Users, Instagram, Phone, Briefcase, GraduationCap, Heart, Baby, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { updateProfile } from "./actions";

export function ProfileView({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-100/50 space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-black text-gray-900">Edit Profil</h2>
           <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-full">
              <X className="h-5 w-5" />
           </Button>
        </div>

        <ActionForm
          action={updateProfile}
          onSuccess={() => setIsEditing(false)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">Data Utama</p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
              <Input name="namaLengkap" defaultValue={profile.namaLengkap} required className="rounded-xl border-gray-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tanggal Lahir</label>
                <Input name="tanggalLahir" type="date" defaultValue={profile.tanggalLahir?.split('T')[0]} required className="rounded-xl border-gray-100" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Pernikahan</label>
                <select name="statusPernikahan" defaultValue={profile.statusPernikahan || "Lajang"} className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm focus:ring-emerald-500">
                  <option value="Lajang">Lajang</option>
                  <option value="Duda/Janda">Duda/Janda</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">Latar Belakang</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Mubaligh</label>
                <select name="statusMubaligh" defaultValue={profile.statusMubaligh || "Non Mubaligh"} className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm">
                  <option value="Non Mubaligh">Non Mubaligh</option>
                  <option value="Mubaligh">Mubaligh</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pendidikan Terakhir</label>
                <Input name="pendidikanTerakhir" defaultValue={profile.pendidikanTerakhir} placeholder="S1 / SMA..." className="rounded-xl border-gray-100" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pekerjaan</label>
              <Input name="pekerjaan" defaultValue={profile.pekerjaan} className="rounded-xl border-gray-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Anak Ke</label>
                <Input name="anakKe" type="number" defaultValue={profile.anakKe} className="rounded-xl border-gray-100" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jumlah Saudara</label>
                <Input name="jumlahSaudara" type="number" defaultValue={profile.jumlahSaudara} className="rounded-xl border-gray-100" />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">Dapukan & Asal</p>

            <div className="grid grid-cols-1 gap-3">
              <Input name="dapukanKelompok" defaultValue={profile.dapukanKelompok} placeholder="Dapukan Kelompok" className="rounded-xl border-gray-100" />
              <Input name="dapukanDesa" defaultValue={profile.dapukanDesa} placeholder="Dapukan Desa" className="rounded-xl border-gray-100" />
              <Input name="dapukanDaerah" defaultValue={profile.dapukanDaerah} placeholder="Dapukan Daerah" className="rounded-xl border-gray-100" />
            </div>

            <div className="grid grid-cols-3 gap-3 border-t pt-3">
              <Input name="asalDaerah" defaultValue={profile.asalDaerah} placeholder="Asal Daerah" className="rounded-xl border-gray-100" />
              <Input name="asalDesa" defaultValue={profile.asalDesa} placeholder="Asal Desa" className="rounded-xl border-gray-100" />
              <Input name="asalKelompok" defaultValue={profile.asalKelompok} placeholder="Asal Kelompok" className="rounded-xl border-gray-100" />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">Kondisi Orang Tua</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ibu</label>
                <select name="kondisiIbu" defaultValue={profile.kondisiIbu || "Masih Hidup"} className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm">
                  <option value="Masih Hidup">Masih Hidup</option>
                  <option value="Almarhum">Almarhum</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bapak</label>
                <select name="kondisiAyah" defaultValue={profile.kondisiAyah || "Masih Hidup"} className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm">
                  <option value="Masih Hidup">Masih Hidup</option>
                  <option value="Almarhum">Almarhum</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Jamaah Ibu</label>
                <select name="statusJamaahIbu" defaultValue={profile.statusJamaahIbu || "Sudah Jamaah"} className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm">
                  <option value="Sudah Jamaah">Sudah Jamaah</option>
                  <option value="Belum Jamaah">Belum Jamaah</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Jamaah Bapak</label>
                <select name="statusJamaahAyah" defaultValue={profile.statusJamaahAyah || "Sudah Jamaah"} className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm">
                  <option value="Sudah Jamaah">Sudah Jamaah</option>
                  <option value="Belum Jamaah">Belum Jamaah</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">Kontak</p>
            <div className="grid grid-cols-2 gap-4">
              <Input name="nomorHp" defaultValue={profile.nomorHp} required placeholder="WhatsApp" className="rounded-xl border-gray-100" />
              <Input name="instagram" defaultValue={profile.instagram} placeholder="Instagram" className="rounded-xl border-gray-100" />
            </div>
          </div>

          <div className="pt-6">
            <SubmitButton pendingText="Menyimpan..." className="w-full rounded-2xl h-14 bg-emerald-600 font-black shadow-lg shadow-emerald-100 text-lg">
               <Save className="h-5 w-5 mr-2" /> Simpan Perubahan
            </SubmitButton>
          </div>
        </ActionForm>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-100/50 space-y-8 relative overflow-hidden">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black text-gray-900">{profile.namaLengkap}</h2>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-bold px-4 py-1.5 rounded-full">
            {profile.jenisKelamin === "IKHWAN" ? "Laki-Laki" : "Perempuan"}
          </Badge>
        </div>

        <div className="grid gap-6">
          <InfoItem
            icon={<Calendar className="h-5 w-5 text-gray-400" />}
            label="Tanggal Lahir"
            value={new Date(profile.tanggalLahir).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          />
          <InfoItem
            icon={<MapPin className="h-5 w-5 text-gray-400" />}
            label="Asal (Sesuai Biodata)"
            value={`${profile.asalDaerah}, ${profile.asalDesa}, ${profile.asalKelompok}`}
          />
          <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
             <InfoItem icon={<Phone className="h-5 w-5 text-gray-400" />} label="WhatsApp" value={profile.nomorHp} />
             <InfoItem icon={<Instagram className="h-5 w-5 text-gray-400" />} label="Instagram" value={profile.instagram} />
          </div>
        </div>

        <Button
          onClick={() => setIsEditing(true)}
          className="w-full rounded-2xl h-12 bg-gray-50 text-gray-600 hover:bg-gray-100 font-black shadow-none border border-gray-100"
        >
          <Pencil className="h-4 w-4 mr-2" /> Edit Lengkap Biodata
        </Button>
      </div>

      <div className="grid gap-4 px-2">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Informasi Tambahan</h3>

        <div className="bg-white rounded-3xl border border-gray-50 p-6 shadow-sm grid grid-cols-2 gap-6">
           <InfoItem icon={<GraduationCap className="h-4 w-4 text-emerald-500" />} label="Pendidikan" value={profile.pendidikanTerakhir} />
           <InfoItem icon={<Briefcase className="h-4 w-4 text-emerald-500" />} label="Pekerjaan" value={profile.pekerjaan} />
           <InfoItem icon={<Heart className="h-4 w-4 text-emerald-500" />} label="Status" value={profile.statusPernikahan} />
           <InfoItem icon={<User className="h-4 w-4 text-emerald-500" />} label="Mubaligh" value={profile.statusMubaligh} />
           <InfoItem icon={<Baby className="h-4 w-4 text-emerald-500" />} label="Anak Ke" value={profile.anakKe?.toString()} />
           <InfoItem icon={<Users2 className="h-4 w-4 text-emerald-500" />} label="Saudara" value={profile.jumlahSaudara?.toString()} />
        </div>

        <div className="bg-white rounded-3xl border border-gray-50 p-6 shadow-sm space-y-4">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Kondisi Orang Tua</p>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Ibu</p>
                 <p className="text-sm font-bold text-gray-700">{profile.kondisiIbu || "-"} ({profile.statusJamaahIbu})</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Bapak</p>
                 <p className="text-sm font-bold text-gray-700">{profile.kondisiAyah || "-"} ({profile.statusJamaahAyah})</p>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-50 p-6 shadow-sm space-y-4">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Dapukan Saat Ini</p>
           <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Daerah</p>
                 <p className="text-xs font-bold text-gray-700">{profile.dapukanDaerah || "-"}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Desa</p>
                 <p className="text-xs font-bold text-gray-700">{profile.dapukanDesa || "-"}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Kelompok</p>
                 <p className="text-xs font-bold text-gray-700">{profile.dapukanKelompok || "-"}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">{label}</p>
        <p className="text-sm font-bold text-gray-700 leading-tight">{value || "-"}</p>
      </div>
    </div>
  );
}
