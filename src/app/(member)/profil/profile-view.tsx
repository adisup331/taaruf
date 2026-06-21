"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { User, Pencil, Save, X, Calendar, MapPin, Home, Users, Instagram, Phone, Briefcase, GraduationCap, Heart, Baby, Users2, Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, photoUrl } from "@/lib/utils";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { CascadingWilayah } from "@/components/member/CascadingWilayah";
import { updateProfile } from "./actions";
import { Watermark } from "@/components/member/ScreenshotGuard";

interface ProfileViewProps {
  profile: any;
  daerahList: { id: string; nama: string }[];
  desaList: { id: string; nama: string }[];
  kelompokList: { id: string; nama: string }[];
}

export function ProfileView({ profile, daerahList, desaList, kelompokList }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fotoPreview, setFotoPreview] = useState(photoUrl(profile.fotoProfil));
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function uploadWithProgress(file: File) {
    setUploading(true);
    setUploadProgress(0);

    // Konversi HEIC → JPEG jika perlu
    const { ensureJpeg } = await import("@/lib/image-utils");
    let processedFile = file;
    try { processedFile = await ensureJpeg(file); } catch {}

    const fd = new FormData();
    fd.append("photo", processedFile);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/profile/upload-photo");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.ok) {
            setFotoPreview(photoUrl(data.url));
            toast.success("Foto profil berhasil diperbarui!");
            setUploadProgress(100);
            setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
            router.refresh();
            return;
          }
          throw new Error(data.message);
        } catch (err: any) {
          toast.error(err.message || "Gagal upload foto");
        }
      } else {
        toast.error("Gagal upload foto (server error)");
      }
      setUploading(false);
      setUploadProgress(0);
    };
    xhr.onerror = () => {
      toast.error("Gagal upload foto (network error)");
      setUploading(false);
      setUploadProgress(0);
    };
    xhr.send(fd);
  }

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
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">Dapukan Saat Ini</p>
            <CascadingWilayah
              prefix="dapukan"
              labelPrefix="Dapukan"
              initialDaerah={profile.dapukanDaerah || ""}
              initialDesa={profile.dapukanDesa || ""}
              initialKelompok={profile.dapukanKelompok || ""}
              daerahList={daerahList}
              desaList={desaList}
              kelompokList={kelompokList}
            />

            <div className="border-t pt-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Asal (Biodata)</p>
              <CascadingWilayah
                prefix="asal"
                labelPrefix="Asal"
                initialDaerah={profile.asalDaerah || ""}
                initialDesa={profile.asalDesa || ""}
                initialKelompok={profile.asalKelompok || ""}
                daerahList={daerahList}
                desaList={desaList}
                kelompokList={kelompokList}
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">Daerah Sambung</p>
            <CascadingWilayah
              prefix="sambung"
              labelPrefix="Sambung"
              initialDaerah={profile.daerahSambung || ""}
              initialDesa={profile.desaSambung || ""}
              initialKelompok={profile.kelompokSambung || ""}
              daerahList={daerahList}
              desaList={desaList}
              kelompokList={kelompokList}
            />
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

          {isEditing && (
          <div className="space-y-4 border-t pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">Foto Profil</p>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => fileRef.current?.click()}>
                {fotoPreview ? (
                  <Image src={fotoPreview} fill className="object-cover" alt="Foto" unoptimized />
                ) : (
                  <div className="flex items-center justify-center h-full"><Camera className="h-6 w-6 text-gray-300" /></div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <CircularProgress progress={uploadProgress} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Ganti foto profil utama kamu. Foto Event tidak bisa diubah dari sini.</p>
                <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-gray-50 border border-gray-100 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                  <Upload className="h-4 w-4" /> Ganti Foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) uploadWithProgress(f);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          )}

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
    <>
    <div className="space-y-6 pb-20">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-100/50 space-y-8 relative overflow-hidden">
        <div className="space-y-3 text-center">
          {/* Foto Profil */}
          <div className="relative mx-auto h-24 w-24 rounded-full overflow-hidden border-4 border-emerald-50 shadow-lg bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity screenshot-guard" onContextMenu={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()}>
            {fotoPreview ? (
              <Image src={fotoPreview} fill className="object-cover" alt="Foto Profil" unoptimized />
            ) : (
              <div className="flex items-center justify-center h-full"><Camera className="h-8 w-8 text-gray-300" /></div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-full">
                <CircularProgress progress={uploadProgress} />
              </div>
            )}
            <Watermark text={profile.namaLengkap} />
          </div>
          
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

        <div className="bg-white rounded-3xl border border-gray-50 p-6 shadow-sm space-y-4">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Daerah Sambung</p>
           <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Daerah</p>
                 <p className="text-xs font-bold text-gray-700">{profile.daerahSambung || "-"}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Desa</p>
                 <p className="text-xs font-bold text-gray-700">{profile.desaSambung || "-"}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Kelompok</p>
                 <p className="text-xs font-bold text-gray-700">{profile.kelompokSambung || "-"}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { uploadWithProgress(f); } e.target.value = ""; }} />
    </>
  );
}

function CircularProgress({ progress }: { progress: number }) {
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx="22" cy="22" r={r} fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-200" />
      </svg>
      <span className="text-[10px] font-bold text-emerald-600">{progress}%</span>
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
