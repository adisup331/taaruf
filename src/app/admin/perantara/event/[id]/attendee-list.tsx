"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Camera, CheckCircle2, X, Phone, Instagram, MapPin, Calendar, Briefcase, GraduationCap, Heart, User, Baby, Users2, ArrowLeft } from "lucide-react";
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

export function PerantaraAttendeeList({ attendees }: { attendees: Attendee[] }) {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "IKHWAN" | "AKHWAT">("ALL");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);

  const filtered = attendees.filter((a) => {
    const matchSearch = !search || (a.profile?.namaLengkap || "").toLowerCase().includes(search.toLowerCase()) || (a.participantNumber || "").includes(search);
    const matchGender = genderFilter === "ALL" || a.profile?.jenisKelamin === genderFilter;
    return matchSearch && matchGender;
  });

  const imageUrl = (p: any) => photoUrl(p?.fotoProfil) || photoUrl(p?.fotoEvent);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama / nomor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={genderFilter === "ALL" ? "default" : "outline"} onClick={() => setGenderFilter("ALL")}>Semua</Button>
          <Button size="sm" variant={genderFilter === "IKHWAN" ? "default" : "outline"} className={genderFilter === "IKHWAN" ? "bg-blue-600 hover:bg-blue-700" : ""} onClick={() => setGenderFilter("IKHWAN")}>Laki-Laki</Button>
          <Button size="sm" variant={genderFilter === "AKHWAT" ? "default" : "outline"} className={genderFilter === "AKHWAT" ? "bg-pink-600 hover:bg-pink-700" : ""} onClick={() => setGenderFilter("AKHWAT")}>Perempuan</Button>
        </div>
        <Badge variant="outline" className="ml-auto">{filtered.length} ditampilkan</Badge>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filtered.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border bg-white p-4 space-y-3 cursor-pointer hover:border-emerald-300 transition-colors"
            onClick={() => setSelectedProfile({ ...a.profile, participantNumber: a.participantNumber })}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border shadow-sm">
                {imageUrl(a.profile) ? (
                  <AvatarImage src={imageUrl(a.profile)!} alt={a.profile?.namaLengkap} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-muted"><Camera className="h-4 w-4 text-muted-foreground opacity-30" /></AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{a.profile?.namaLengkap || "-"}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <Badge variant={a.profile?.jenisKelamin === "IKHWAN" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                    {genderLabel(a.profile?.jenisKelamin)}
                  </Badge>
                  {a.participantNumber && (
                    <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-sm">#{a.participantNumber}</span>
                  )}
                </div>
              </div>
              {a.isCheckedIn && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {[a.profile?.asalDaerah, a.profile?.asalDesa, a.profile?.asalKelompok].filter(Boolean).join(", ")}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground bg-muted/30">
              <th className="px-3 py-2 font-medium w-12">Foto</th>
              <th className="px-3 py-2 font-medium">No</th>
              <th className="px-3 py-2 font-medium">Nama</th>
              <th className="px-3 py-2 font-medium">Gender</th>
              <th className="px-3 py-2 font-medium">Asal</th>
              <th className="px-3 py-2 font-medium">Usia</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedProfile({ ...a.profile, participantNumber: a.participantNumber })}
              >
                <td className="px-3 py-2">
                  <Avatar className="h-10 w-10 border shadow-sm">
                    {imageUrl(a.profile) ? (
                      <AvatarImage src={imageUrl(a.profile)!} alt={a.profile?.namaLengkap} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-muted"><Camera className="h-4 w-4 text-muted-foreground opacity-30" /></AvatarFallback>
                    )}
                  </Avatar>
                </td>
                <td className="px-3 py-2 font-black text-emerald-700">{a.participantNumber || "-"}</td>
                <td className="px-3 py-2 font-medium">{a.profile?.namaLengkap || "-"}</td>
                <td className="px-3 py-2">
                  <Badge variant={a.profile?.jenisKelamin === "IKHWAN" ? "default" : "secondary"}>{genderLabel(a.profile?.jenisKelamin)}</Badge>
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs">{[a.profile?.asalDaerah, a.profile?.asalDesa].filter(Boolean).join(", ") || "-"}</td>
                <td className="px-3 py-2 text-muted-foreground">{a.profile?.tanggalLahir ? `${calculateAge(a.profile.tanggalLahir)} th` : "-"}</td>
                <td className="px-3 py-2">
                  {a.isCheckedIn ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Hadir</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Belum</Badge>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-12 text-center text-muted-foreground">{search ? `Tidak ditemukan "${search}"` : "Belum ada peserta."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => { setSelectedProfile(null); setViewPhoto(null); }}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {viewPhoto ? (
              <div className="p-4 space-y-4">
                <button type="button" onClick={() => setViewPhoto(null)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors w-full">
                  <ArrowLeft className="h-5 w-5" /> Kembali ke Detail
                </button>
                <div className="rounded-2xl overflow-hidden bg-black">
                  <img src={viewPhoto} alt={selectedProfile.namaLengkap} className="w-full object-contain max-h-[70vh]" />
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => { setSelectedProfile(null); setViewPhoto(null); }} className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 hover:bg-white transition-colors shadow-md">
                  <X className="h-5 w-5 text-gray-600" />
                </button>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center text-white rounded-t-3xl">
                  <div
                    className={`relative mx-auto h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 ${imageUrl(selectedProfile) ? "cursor-pointer hover:scale-105 transition-transform" : ""}`}
                    onClick={() => { if (imageUrl(selectedProfile)) setViewPhoto(imageUrl(selectedProfile)!); }}
                  >
                    {imageUrl(selectedProfile) ? (
                      <img src={imageUrl(selectedProfile)!} alt={selectedProfile.namaLengkap} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-emerald-200 text-emerald-700 text-3xl font-bold">
                        {selectedProfile.namaLengkap?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {imageUrl(selectedProfile) && <p className="text-[10px] text-emerald-100 mb-2">Tap foto untuk memperbesar</p>}
                  <h2 className="text-2xl font-black mb-1">{selectedProfile.namaLengkap}</h2>
                  {selectedProfile.participantNumber && <p className="text-emerald-100 font-bold text-sm mb-2">No. Peserta: {selectedProfile.participantNumber}</p>}
                  <Badge className="bg-white/20 text-white border-none font-bold px-4 py-1">
                    {genderLabel(selectedProfile.jenisKelamin)}
                  </Badge>
                </div>

                {(imageUrl(selectedProfile) || photoUrl(selectedProfile.fotoEvent)) && (
                  <div className="px-6 pt-5">
                    <p className="text-xs font-bold uppercase text-gray-400 mb-3">Foto</p>
                    <div className="grid grid-cols-2 gap-3">
                      {photoUrl(selectedProfile.fotoProfil) && (
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all" onClick={() => setViewPhoto(photoUrl(selectedProfile.fotoProfil)!)}>
                          <img src={photoUrl(selectedProfile.fotoProfil)!} alt="Foto Profil" className="h-full w-full object-cover" />
                          <span className="absolute bottom-2 left-2 text-white text-[9px] font-bold bg-black/50 px-2 py-0.5 rounded-full">Profil</span>
                        </div>
                      )}
                      {photoUrl(selectedProfile.fotoEvent) && (
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all" onClick={() => setViewPhoto(photoUrl(selectedProfile.fotoEvent)!)}>
                          <img src={photoUrl(selectedProfile.fotoEvent)!} alt="Foto Event" className="h-full w-full object-cover" />
                          <span className="absolute bottom-2 left-2 text-emerald-300 text-[9px] font-bold bg-black/50 px-2 py-0.5 rounded-full">Event</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={<Calendar className="h-5 w-5 text-emerald-600" />} label="Usia" value={`${calculateAge(selectedProfile.tanggalLahir)} Tahun`} />
                    <InfoItem icon={<Heart className="h-5 w-5 text-emerald-600" />} label="Status" value={selectedProfile.statusPernikahan || "-"} />
                    <InfoItem icon={<GraduationCap className="h-5 w-5 text-emerald-600" />} label="Pendidikan" value={selectedProfile.pendidikanTerakhir || "-"} />
                    <InfoItem icon={<Briefcase className="h-5 w-5 text-emerald-600" />} label="Pekerjaan" value={selectedProfile.pekerjaan || "-"} />
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-bold uppercase text-gray-400 mb-3">Asal (Biodata)</p>
                    <InfoItem icon={<MapPin className="h-5 w-5 text-emerald-600" />} label="" value={`${selectedProfile.asalDaerah || "-"}, ${selectedProfile.asalDesa || "-"}, ${selectedProfile.asalKelompok || "-"}`} />
                  </div>

                  {(selectedProfile.daerahSambung || selectedProfile.desaSambung || selectedProfile.kelompokSambung) && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-bold uppercase text-gray-400 mb-3">Daerah Sambung</p>
                      <InfoItem icon={<MapPin className="h-5 w-5 text-emerald-600" />} label="" value={[selectedProfile.daerahSambung, selectedProfile.desaSambung, selectedProfile.kelompokSambung].filter(Boolean).join(", ") || "-"} />
                    </div>
                  )}

                  {(selectedProfile.dapukanDaerah || selectedProfile.dapukanDesa || selectedProfile.dapukanKelompok) && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-bold uppercase text-gray-400 mb-3">Dapukan</p>
                      <InfoItem icon={<User className="h-5 w-5 text-emerald-600" />} label="" value={[selectedProfile.dapukanDaerah, selectedProfile.dapukanDesa, selectedProfile.dapukanKelompok].filter(Boolean).join(", ") || "-"} />
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-xs font-bold uppercase text-gray-400 mb-3">Kontak</p>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem icon={<Phone className="h-5 w-5 text-emerald-600" />} label="WhatsApp" value={selectedProfile.nomorHp || "-"} />
                      <InfoItem icon={<Instagram className="h-5 w-5 text-emerald-600" />} label="Instagram" value={selectedProfile.instagram || "-"} />
                    </div>
                  </div>

                  {(selectedProfile.statusMubaligh || selectedProfile.anakKe || selectedProfile.jumlahSaudara) && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-bold uppercase text-gray-400 mb-3">Informasi Tambahan</p>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProfile.statusMubaligh && <InfoItem icon={<User className="h-5 w-5 text-emerald-600" />} label="Mubaligh" value={selectedProfile.statusMubaligh} />}
                        {selectedProfile.anakKe && <InfoItem icon={<Baby className="h-5 w-5 text-emerald-600" />} label="Anak Ke" value={selectedProfile.anakKe} />}
                        {selectedProfile.jumlahSaudara && <InfoItem icon={<Users2 className="h-5 w-5 text-emerald-600" />} label="Jumlah Saudara" value={selectedProfile.jumlahSaudara} />}
                      </div>
                    </div>
                  )}

                  {(selectedProfile.kondisiIbu || selectedProfile.kondisiAyah) && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-bold uppercase text-gray-400 mb-3">Kondisi Orang Tua</p>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProfile.kondisiIbu && <InfoItem icon={<Heart className="h-5 w-5 text-emerald-600" />} label="Ibu" value={`${selectedProfile.kondisiIbu}${selectedProfile.statusJamaahIbu ? ` (${selectedProfile.statusJamaahIbu})` : ""}`} />}
                        {selectedProfile.kondisiAyah && <InfoItem icon={<Heart className="h-5 w-5 text-emerald-600" />} label="Bapak" value={`${selectedProfile.kondisiAyah}${selectedProfile.statusJamaahAyah ? ` (${selectedProfile.statusJamaahAyah})` : ""}`} />}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        {label && <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>}
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}