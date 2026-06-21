"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Phone, Instagram, MapPin, Calendar, Briefcase, GraduationCap, Heart, User, Baby, Users2, ArrowLeft } from "lucide-react"
import { photoUrl, genderLabel } from "@/lib/utils"

interface MemberDetailDialogProps {
  profile: any
}

function calculateAge(dob: string | null) {
  if (!dob) return "-"
  const diff = Date.now() - new Date(dob).getTime()
  return Math.abs(new Date(diff).getUTCFullYear() - 1970)
}

export function MemberDetailDialog({ profile }: MemberDetailDialogProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)

  const imageUrl = photoUrl(profile.fotoProfil)
  const eventImageUrl = photoUrl(profile.fotoEvent)

  return (
    <>
      {/* Avatar trigger */}
      <Avatar
        className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all"
        onClick={() => setDetailOpen(true)}
      >
        {imageUrl ? (
          <AvatarImage src={imageUrl} alt={profile.namaLengkap} className="object-cover" />
        ) : (
          <AvatarFallback className="text-xs bg-muted">
            {profile.namaLengkap?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Modal */}
      {detailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => { setDetailOpen(false); setViewPhoto(null) }}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ===== View: Foto Besar ===== */}
            {viewPhoto ? (
              <div className="p-4 space-y-4">
                <button
                  type="button"
                  onClick={() => setViewPhoto(null)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors w-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Kembali ke Detail
                </button>
                <div className="rounded-2xl overflow-hidden bg-black">
                  <img src={viewPhoto} alt={profile.namaLengkap} className="w-full object-contain max-h-[70vh]" />
                </div>
                <p className="text-center text-sm font-bold text-gray-900">{profile.namaLengkap}</p>
              </div>
            ) : (
              /* ===== View: Detail Profil ===== */
              <>
                {/* Close button */}
                <button
                  onClick={() => { setDetailOpen(false); setViewPhoto(null) }}
                  className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 hover:bg-white transition-colors shadow-md"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>

                {/* Header dengan foto */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center text-white">
                  <div
                    className={`relative mx-auto h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 ${imageUrl ? "cursor-pointer hover:scale-105 transition-transform" : ""}`}
                    onClick={() => { if (imageUrl) setViewPhoto(imageUrl) }}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt={profile.namaLengkap} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-emerald-200 text-emerald-700 text-3xl font-bold">
                        {profile.namaLengkap?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {(imageUrl || eventImageUrl) && <p className="text-[10px] text-emerald-100 mb-2">Tap foto untuk memperbesar</p>}
                  <h2 className="text-2xl font-black mb-2">{profile.namaLengkap}</h2>
                  <Badge className="bg-white/20 text-white border-none font-bold px-4 py-1">
                    {genderLabel(profile.jenisKelamin)}
                  </Badge>
                </div>

                {/* Foto Grid */}
                {(imageUrl || eventImageUrl) && (
                  <div className="px-6 pt-5">
                    <p className="text-xs font-bold uppercase text-gray-400 mb-3">Foto</p>
                    <div className="grid grid-cols-2 gap-3">
                      {imageUrl && (
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all" onClick={() => setViewPhoto(imageUrl)}>
                          <img src={imageUrl} alt="Foto Profil" className="h-full w-full object-cover" />
                          <span className="absolute bottom-2 left-2 text-white text-[9px] font-bold bg-black/50 px-2 py-0.5 rounded-full">Profil</span>
                        </div>
                      )}
                      {eventImageUrl && (
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all" onClick={() => setViewPhoto(eventImageUrl)}>
                          <img src={eventImageUrl} alt="Foto Event" className="h-full w-full object-cover" />
                          <span className="absolute bottom-2 left-2 text-emerald-300 text-[9px] font-bold bg-black/50 px-2 py-0.5 rounded-full">Event</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Body detail */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={<Calendar className="h-5 w-5 text-emerald-600" />} label="Usia" value={`${calculateAge(profile.tanggalLahir)} Tahun`} />
                    <InfoItem icon={<Heart className="h-5 w-5 text-emerald-600" />} label="Status" value={profile.statusPernikahan || "-"} />
                    <InfoItem icon={<GraduationCap className="h-5 w-5 text-emerald-600" />} label="Pendidikan" value={profile.pendidikanTerakhir || "-"} />
                    <InfoItem icon={<Briefcase className="h-5 w-5 text-emerald-600" />} label="Pekerjaan" value={profile.pekerjaan || "-"} />
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-bold uppercase text-gray-400 mb-3">Asal (Biodata)</p>
                    <InfoItem
                      icon={<MapPin className="h-5 w-5 text-emerald-600" />}
                      label=""
                      value={`${profile.asalDaerah || "-"}, ${profile.asalDesa || "-"}, ${profile.asalKelompok || "-"}`}
                    />
                  </div>

                  {(profile.daerahSambung || profile.desaSambung || profile.kelompokSambung) && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-bold uppercase text-gray-400 mb-3">Daerah Sambung</p>
                      <InfoItem
                        icon={<MapPin className="h-5 w-5 text-emerald-600" />}
                        label=""
                        value={[profile.daerahSambung, profile.desaSambung, profile.kelompokSambung].filter(Boolean).join(", ") || "-"}
                      />
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-xs font-bold uppercase text-gray-400 mb-3">Kontak</p>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem icon={<Phone className="h-5 w-5 text-emerald-600" />} label="WhatsApp" value={profile.nomorHp || "-"} />
                      <InfoItem icon={<Instagram className="h-5 w-5 text-emerald-600" />} label="Instagram" value={profile.instagram || "-"} />
                    </div>
                  </div>

                  {(profile.statusMubaligh || profile.anakKe || profile.jumlahSaudara) && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-bold uppercase text-gray-400 mb-3">Informasi Tambahan</p>
                      <div className="grid grid-cols-2 gap-4">
                        {profile.statusMubaligh && <InfoItem icon={<User className="h-5 w-5 text-emerald-600" />} label="Mubaligh" value={profile.statusMubaligh} />}
                        {profile.anakKe && <InfoItem icon={<Baby className="h-5 w-5 text-emerald-600" />} label="Anak Ke" value={profile.anakKe} />}
                        {profile.jumlahSaudara && <InfoItem icon={<Users2 className="h-5 w-5 text-emerald-600" />} label="Jumlah Saudara" value={profile.jumlahSaudara} />}
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
  )
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
  )
}
