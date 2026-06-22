"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, Phone, MapPin, Calendar, Briefcase, GraduationCap, Heart, User, Baby, Users2, X, ArrowLeft } from "lucide-react";
import { genderLabel, statusLabel, photoUrl } from "@/lib/utils";

function calculateAge(dob: string | null) {
  if (!dob) return "-";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

interface Props {
  matchId: string;
  pin: string;
  status: string;
  tableNumber: number | null;
  profile1: any;
  profile2: any;
}

export function BioViewer({ matchId, pin, status, tableNumber, profile1, profile2 }: Props) {
  const [inputPin, setInputPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);

  function handleUnlock() {
    if (inputPin === pin) {
      setUnlocked(true);
      setError("");
    } else {
      setError("PIN salah. Silakan coba lagi.");
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <Lock className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Biodata Pasangan</h1>
            <p className="text-sm text-gray-500 mt-1">Masukkan PIN untuk melihat biodata</p>
          </div>
          <div className="space-y-3">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Masukkan PIN"
              value={inputPin}
              onChange={(e) => { setInputPin(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              className="text-center text-2xl font-bold tracking-[0.5em] h-14"
              autoFocus
            />
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <Button onClick={handleUnlock} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-bold" disabled={inputPin.length < 4}>
              <Eye className="mr-2 h-5 w-5" /> Lihat Biodata
            </Button>
          </div>
          <p className="text-[11px] text-gray-400">PIN dikirim bersama pesan WhatsApp dari panitia.</p>
        </div>
      </div>
    );
  }

  const shortId = matchId.slice(-6).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-6 text-center">
        <h1 className="text-xl font-black">Biodata Pasangan Taaruf</h1>
        <div className="flex items-center justify-center gap-4 mt-2 text-sm">
          <span>Kode: <strong>{shortId}</strong></span>
          <Badge className="bg-white/20 border-none">{statusLabel(status)}</Badge>
          {tableNumber && <span>Meja {tableNumber}</span>}
        </div>
      </div>

      {/* Profiles */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <ProfileCard label="Biodata 1" profile={profile1} viewPhoto={viewPhoto} setViewPhoto={setViewPhoto} />
          <ProfileCard label="Biodata 2" profile={profile2} viewPhoto={viewPhoto} setViewPhoto={setViewPhoto} />
        </div>
        {viewPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setViewPhoto(null)}>
            <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setViewPhoto(null)} className="absolute -top-12 right-0 rounded-full bg-white/20 p-2 hover:bg-white/40 transition-colors"><X className="h-6 w-6 text-white" /></button>
              <div className="rounded-2xl overflow-hidden bg-black"><img src={viewPhoto} alt="Foto" className="w-full object-contain max-h-[80vh]" /></div>
            </div>
          </div>
        )}
        <p className="text-center text-[10px] text-gray-400 pt-4">TaarufYuk &middot; {new Date().toLocaleDateString("id-ID")}</p>
      </div>
    </div>
  );
}

function ProfileCard({ label, profile: p, viewPhoto, setViewPhoto }: { label: string; profile: any; viewPhoto: string | null; setViewPhoto: (url: string | null) => void }) {
  if (!p) return (
    <div className="rounded-2xl border-2 border-dashed p-8 text-center text-gray-400 font-bold bg-white">{label}: Data tidak tersedia</div>
  );

  const age = calculateAge(p.tanggalLahir);
  const imageUrl = photoUrl(p.fotoProfil) || photoUrl(p.fotoEvent);

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
        <div className="flex items-center gap-4">
          <div className={`h-20 w-20 shrink-0 rounded-full border-2 border-white overflow-hidden bg-emerald-300 ${imageUrl ? "cursor-pointer hover:scale-105 transition-transform" : ""}`}
            onClick={() => { if (imageUrl) setViewPhoto(imageUrl); }}>
            {imageUrl ? (
              <img src={imageUrl} alt={p.namaLengkap} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/70">
                {p.namaLengkap?.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-black">{p.namaLengkap}</h2>
            <p className="text-emerald-100 text-sm">{genderLabel(p.jenisKelamin)} &middot; {age} Tahun</p>
          </div>
        </div>
      </div>

      {/* Foto */}
      {(photoUrl(p.fotoProfil) || photoUrl(p.fotoEvent)) && (
        <div className="px-4 pt-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Foto</p>
          <div className="grid grid-cols-2 gap-2">
            {photoUrl(p.fotoProfil) && (
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all"
                onClick={() => setViewPhoto(photoUrl(p.fotoProfil)!)}>
                <img src={photoUrl(p.fotoProfil)!} alt="Foto Profil" className="h-full w-full object-cover" />
                <span className="absolute bottom-1.5 left-1.5 text-white text-[9px] font-bold bg-black/50 px-2 py-0.5 rounded-full">Profil</span>
              </div>
            )}
            {photoUrl(p.fotoEvent) && (
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all"
                onClick={() => setViewPhoto(photoUrl(p.fotoEvent)!)}>
                <img src={photoUrl(p.fotoEvent)!} alt="Foto Event" className="h-full w-full object-cover" />
                <span className="absolute bottom-1.5 left-1.5 text-emerald-300 text-[9px] font-bold bg-black/50 px-2 py-0.5 rounded-full">Event</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="p-4 space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <InfoItem icon={<Calendar className="h-4 w-4 text-emerald-600" />} label="Tanggal Lahir" value={p.tanggalLahir ? new Date(p.tanggalLahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} />
          <InfoItem icon={<Heart className="h-4 w-4 text-emerald-600" />} label="Status" value={p.statusPernikahan || "Lajang"} />
          {p.pendidikanTerakhir && <InfoItem icon={<GraduationCap className="h-4 w-4 text-emerald-600" />} label="Pendidikan" value={p.pendidikanTerakhir} />}
          {p.pekerjaan && <InfoItem icon={<Briefcase className="h-4 w-4 text-emerald-600" />} label="Pekerjaan" value={p.pekerjaan} />}
        </div>

        <div className="border-t pt-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Asal</p>
          <InfoItem icon={<MapPin className="h-4 w-4 text-emerald-600" />} label="" value={[p.asalDaerah, p.asalDesa, p.asalKelompok].filter(Boolean).join(", ")} />
        </div>

        {(p.daerahSambung || p.desaSambung || p.kelompokSambung) && (
          <div className="border-t pt-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Daerah Sambung</p>
            <InfoItem icon={<MapPin className="h-4 w-4 text-emerald-600" />} label="" value={[p.daerahSambung, p.desaSambung, p.kelompokSambung].filter(Boolean).join(", ")} />
          </div>
        )}

        {(p.dapukanDaerah || p.dapukanDesa || p.dapukanKelompok) && (
          <div className="border-t pt-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Dapukan</p>
            <InfoItem icon={<User className="h-4 w-4 text-emerald-600" />} label="" value={[p.dapukanDaerah, p.dapukanDesa, p.dapukanKelompok].filter(Boolean).join(", ")} />
          </div>
        )}

        {p.statusMubaligh && (
          <div className="border-t pt-3">
            <InfoItem icon={<User className="h-4 w-4 text-emerald-600" />} label="Mubaligh" value={p.statusMubaligh} />
          </div>
        )}

        {(p.anakKe || p.jumlahSaudara) && (
          <div className="border-t pt-3 grid grid-cols-2 gap-3">
            {p.anakKe && <InfoItem icon={<Baby className="h-4 w-4 text-emerald-600" />} label="Anak Ke" value={String(p.anakKe)} />}
            {p.jumlahSaudara && <InfoItem icon={<Users2 className="h-4 w-4 text-emerald-600" />} label="Jml Saudara" value={String(p.jumlahSaudara)} />}
          </div>
        )}

        {(p.kondisiIbu || p.kondisiAyah) && (
          <div className="border-t pt-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Orang Tua</p>
            <div className="grid grid-cols-2 gap-3">
              {p.kondisiIbu && <InfoItem icon={<Heart className="h-4 w-4 text-emerald-600" />} label="Ibu" value={`${p.kondisiIbu}${p.statusJamaahIbu ? ` (${p.statusJamaahIbu})` : ""}`} />}
              {p.kondisiAyah && <InfoItem icon={<Heart className="h-4 w-4 text-emerald-600" />} label="Bapak" value={`${p.kondisiAyah}${p.statusJamaahAyah ? ` (${p.statusJamaahAyah})` : ""}`} />}
            </div>
          </div>
        )}

        <div className="border-t pt-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Kontak</p>
          <div className="grid grid-cols-2 gap-3">
            {p.nomorHp && <InfoItem icon={<Phone className="h-4 w-4 text-emerald-600" />} label="HP" value={p.nomorHp} />}
            {p.instagram && <InfoItem icon={<User className="h-4 w-4 text-emerald-600" />} label="IG" value={`@${p.instagram}`} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        {label && <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>}
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
