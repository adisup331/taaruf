"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Phone, Instagram, MapPin, Calendar, Briefcase, GraduationCap, Heart, User, Baby, Users2 } from "lucide-react"
import { photoUrl, genderLabel } from "@/lib/utils"
import { PhotoViewDialog } from "@/components/admin-panel/photo-view-dialog"

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
  const [photoOpen, setPhotoOpen] = useState(false)

  const imageUrl = photoUrl(profile.fotoProfil)

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

      {/* Layer 1: Modal Detail Profil */}
      {detailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setDetailOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 hover:bg-white transition-colors shadow-md"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Header dengan foto */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center text-white">
              <div
                className="relative mx-auto h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 cursor-pointer hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation()
                  if (imageUrl) setPhotoOpen(true)
                }}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt={profile.namaLengkap} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-emerald-200 text-emerald-700 text-3xl font-bold">
                    {profile.namaLengkap?.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-black mb-2">{profile.namaLengkap}</h2>
              <Badge className="bg-white/20 text-white border-none font-bold px-4 py-1">
                {genderLabel(profile.jenisKelamin)}
              </Badge>
            </div>

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
          </div>
        </div>
      )}

      {/* Layer 2: Fullscreen foto — rendered via PhotoViewDialog (z-60, di atas detail) */}
      <PhotoViewDialog
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        foto={profile.fotoProfil}
        nama={profile.namaLengkap}
      />
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
