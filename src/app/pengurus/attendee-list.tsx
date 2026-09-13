"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Camera, CheckCircle2, X, Phone, MapPin, Calendar, Briefcase, GraduationCap, Heart, User, Baby, Users2 } from "lucide-react";
import { genderLabel, photoUrl } from "@/lib/utils";

interface Attendee {
  id: string;
  participantNumber: string | null;
  isCheckedIn: boolean;
  userId: string;
  profile: any;
}

function calculateAge(dob: string | null) {
  if (!dob) return "-";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

export function PengurusAttendeeList({ attendees }: { attendees: Attendee[] }) {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "IKHWAN" | "AKHWAT">("ALL");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const filtered = attendees.filter((a) => {
    const matchSearch = !search || (a.profile?.namaLengkap || "").toLowerCase().includes(search.toLowerCase()) || (a.participantNumber || "").includes(search);
    const matchGender = genderFilter === "ALL" || a.profile?.jenisKelamin === genderFilter;
    return matchSearch && matchGender;
  });

  const imageUrl = (p: any) => photoUrl(p?.fotoProfil) || photoUrl(p?.fotoEvent);

  if (selectedProfile) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedProfile(null)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="h-4 w-4" /> Kembali ke daftar
        </button>

        <div className="rounded-2xl border bg-white overflow-hidden">
          {/* Photo */}
          {imageUrl(selectedProfile) && (
            <div className="relative aspect-[4/3] bg-gray-100">
              <img
                src={imageUrl(selectedProfile)!}
                alt={selectedProfile.namaLengkap}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Profile Info */}
          <div className="p-5 space-y-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-gray-900">{selectedProfile.namaLengkap}</h2>
                {selectedProfile.participantNumber && (
                  <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-sm">#{selectedProfile.participantNumber}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={selectedProfile.jenisKelamin === "IKHWAN" ? "default" : "secondary"}>
                  {genderLabel(selectedProfile.jenisKelamin)}
                </Badge>
                <span className="text-sm text-gray-500">{calculateAge(selectedProfile.tanggalLahir)} tahun</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={<Calendar className="h-4 w-4 text-emerald-600" />} label="Tanggal Lahir" value={selectedProfile.tanggalLahir ? new Date(selectedProfile.tanggalLahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} />
              <InfoItem icon={<Heart className="h-4 w-4 text-emerald-600" />} label="Status" value={selectedProfile.statusPernikahan || "-"} />
              {selectedProfile.pendidikanTerakhir && <InfoItem icon={<GraduationCap className="h-4 w-4 text-emerald-600" />} label="Pendidikan" value={selectedProfile.pendidikanTerakhir} />}
              {selectedProfile.pekerjaan && <InfoItem icon={<Briefcase className="h-4 w-4 text-emerald-600" />} label="Pekerjaan" value={selectedProfile.pekerjaan} />}
            </div>

            <div className="border-t pt-4">
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Asal</p>
              <InfoItem icon={<MapPin className="h-4 w-4 text-emerald-600" />} label="" value={[selectedProfile.asalDaerah, selectedProfile.asalDesa, selectedProfile.asalKelompok].filter(Boolean).join(", ") || "-"} />
            </div>

            {(selectedProfile.daerahSambung || selectedProfile.desaSambung || selectedProfile.kelompokSambung) && (
              <div className="border-t pt-4">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Daerah Sambung</p>
                <InfoItem icon={<MapPin className="h-4 w-4 text-emerald-600" />} label="" value={[selectedProfile.daerahSambung, selectedProfile.desaSambung, selectedProfile.kelompokSambung].filter(Boolean).join(", ")} />
              </div>
            )}

            {(selectedProfile.dapukanDaerah || selectedProfile.dapukanDesa || selectedProfile.dapukanKelompok) && (
              <div className="border-t pt-4">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Dapukan</p>
                <InfoItem icon={<User className="h-4 w-4 text-emerald-600" />} label="" value={[selectedProfile.dapukanDaerah, selectedProfile.dapukanDesa, selectedProfile.dapukanKelompok].filter(Boolean).join(", ")} />
              </div>
            )}

            {selectedProfile.statusMubaligh && (
              <div className="border-t pt-4">
                <InfoItem icon={<User className="h-4 w-4 text-emerald-600" />} label="Mubaligh" value={selectedProfile.statusMubaligh} />
              </div>
            )}

            {(selectedProfile.anakKe || selectedProfile.jumlahSaudara) && (
              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                {selectedProfile.anakKe && <InfoItem icon={<Baby className="h-4 w-4 text-emerald-600" />} label="Anak Ke" value={String(selectedProfile.anakKe)} />}
                {selectedProfile.jumlahSaudara && <InfoItem icon={<Users2 className="h-4 w-4 text-emerald-600" />} label="Jml Saudara" value={String(selectedProfile.jumlahSaudara)} />}
              </div>
            )}

            {(selectedProfile.kondisiIbu || selectedProfile.kondisiAyah) && (
              <div className="border-t pt-4">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Orang Tua</p>
                <div className="grid grid-cols-2 gap-4">
                  {selectedProfile.kondisiIbu && <InfoItem icon={<Heart className="h-4 w-4 text-emerald-600" />} label="Ibu" value={`${selectedProfile.kondisiIbu}${selectedProfile.statusJamaahIbu ? ` (${selectedProfile.statusJamaahIbu})` : ""}`} />}
                  {selectedProfile.kondisiAyah && <InfoItem icon={<Heart className="h-4 w-4 text-emerald-600" />} label="Bapak" value={`${selectedProfile.kondisiAyah}${selectedProfile.statusJamaahAyah ? ` (${selectedProfile.statusJamaahAyah})` : ""}`} />}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Kontak</p>
              <div className="grid grid-cols-2 gap-4">
                {selectedProfile.nomorHp && <InfoItem icon={<Phone className="h-4 w-4 text-emerald-600" />} label="WhatsApp" value={selectedProfile.nomorHp} />}
                {selectedProfile.instagram && <InfoItem icon={<User className="h-4 w-4 text-emerald-600" />} label="Instagram" value={`@${selectedProfile.instagram}`} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari nama / nomor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant={genderFilter === "ALL" ? "default" : "outline"} onClick={() => setGenderFilter("ALL")} className="text-xs h-9">Semua</Button>
          <Button size="sm" variant={genderFilter === "IKHWAN" ? "default" : "outline"} className={`text-xs h-9 ${genderFilter === "IKHWAN" ? "bg-blue-600 hover:bg-blue-700" : ""}`} onClick={() => setGenderFilter("IKHWAN")}>Laki-Laki</Button>
          <Button size="sm" variant={genderFilter === "AKHWAT" ? "default" : "outline"} className={`text-xs h-9 ${genderFilter === "AKHWAT" ? "bg-pink-600 hover:bg-pink-700" : ""}`} onClick={() => setGenderFilter("AKHWAT")}>Perempuan</Button>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 font-medium">{filtered.length} ditampilkan</p>

      {/* Card List */}
      <div className="space-y-2">
        {filtered.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border p-3 flex items-center gap-3 cursor-pointer transition-all hover:shadow-sm ${
              a.isCheckedIn ? "bg-emerald-50/50 border-emerald-100" : "bg-white"
            }`}
            onClick={() => setSelectedProfile({ ...a.profile, participantNumber: a.participantNumber })}
          >
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-gray-100 border overflow-hidden shrink-0">
              {imageUrl(a.profile) ? (
                <img src={imageUrl(a.profile)!} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Camera className="h-4 w-4 text-gray-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{a.profile?.namaLengkap || "-"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={a.profile?.jenisKelamin === "IKHWAN" ? "default" : "secondary"} className="text-[9px] px-1 py-0 h-3.5">
                  {genderLabel(a.profile?.jenisKelamin)}
                </Badge>
                <span className="text-[10px] text-gray-400 truncate">
                  {[a.profile?.asalDaerah, a.profile?.asalDesa].filter(Boolean).join(", ")}
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0">
              {a.participantNumber && (
                <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">#{a.participantNumber}</span>
              )}
              {a.isCheckedIn && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            {search ? `Tidak ditemukan "${search}"` : "Belum ada peserta."}
          </div>
        )}
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
