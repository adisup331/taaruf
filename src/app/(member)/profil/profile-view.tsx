"use client";

import { useState } from "react";
import { User, Pencil, Save, X, Calendar, MapPin, Home, Users, Instagram, Phone } from "lucide-react";
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
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
            <Input name="namaLengkap" defaultValue={profile.namaLengkap} required className="rounded-xl border-gray-100" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tanggal Lahir</label>
            <Input name="tanggalLahir" type="date" defaultValue={profile.tanggalLahir?.split('T')[0]} required className="rounded-xl border-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Asal Daerah</label>
              <Input name="asalDaerah" defaultValue={profile.asalDaerah} className="rounded-xl border-gray-100" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Asal Desa</label>
              <Input name="asalDesa" defaultValue={profile.asalDesa} className="rounded-xl border-gray-100" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Asal Kelompok</label>
            <Input name="asalKelompok" defaultValue={profile.asalKelompok} className="rounded-xl border-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No. HP (WhatsApp)</label>
              <Input name="nomorHp" defaultValue={profile.nomorHp} required className="rounded-xl border-gray-100" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instagram</label>
              <Input name="instagram" defaultValue={profile.instagram} className="rounded-xl border-gray-100" />
            </div>
          </div>

          <div className="pt-4">
            <SubmitButton pendingText="Menyimpan..." className="w-full rounded-2xl h-12 bg-emerald-600 font-black shadow-lg shadow-emerald-100">
               <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
            </SubmitButton>
          </div>
        </ActionForm>
      </div>
    );
  }

  return (
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
          label="Asal Daerah"
          value={profile.asalDaerah}
        />
        <div className="grid grid-cols-2 gap-4">
           <InfoItem icon={<Home className="h-5 w-5 text-gray-400" />} label="Desa" value={profile.asalDesa} />
           <InfoItem icon={<Users className="h-5 w-5 text-gray-400" />} label="Kelompok" value={profile.asalKelompok} />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <InfoItem icon={<Phone className="h-5 w-5 text-gray-400" />} label="WhatsApp" value={profile.nomorHp} />
           <InfoItem icon={<Instagram className="h-5 w-5 text-gray-400" />} label="Instagram" value={profile.instagram} />
        </div>
      </div>

      <Button
        onClick={() => setIsEditing(true)}
        className="w-full rounded-2xl h-12 bg-gray-50 text-gray-600 hover:bg-gray-100 font-black shadow-none border border-gray-100"
      >
        <Pencil className="h-4 w-4 mr-2" /> Edit Profil
      </Button>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">{label}</p>
        <p className="text-sm font-bold text-gray-700">{value || "-"}</p>
      </div>
    </div>
  );
}
