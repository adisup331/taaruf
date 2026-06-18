"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, photoUrl } from "@/lib/utils";
import { useState, useEffect } from "react";

import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Maximize2, X, ChevronDown, MapPin, Home, Users, Calendar, ArrowLeft } from "lucide-react";
import { Badge } from "../ui/badge";

export function ProfileCard({ profile, eventId, isEventBlurActive, targetUserId, alreadyRequested = false, lockType = null }: any) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(alreadyRequested);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const age = new Date().getFullYear() - new Date(profile.tanggalLahir).getFullYear();
  const isLocked = !!lockType;
  const disabled = loading || sent || isLocked;

  async function handleRequest() {
    setLoading(true);
    try {
      const res = await fetch("/api/taaruf/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: targetUserId, eventId }),
      });
      if (!res.ok) throw new Error("failed");
      setSent(true);
    } catch {
      alert("Gagal mengirim permintaan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = lockType === "taaruf"
    ? "Sedang Proses Taaruf"
    : lockType === "pending"
    ? "Sedang Diproses Orang Lain"
    : alreadyRequested
    ? "Sudah Diminta âœ“"
    : sent
    ? "Terkirim âœ“"
    : loading
    ? "Memproses..."
    : "Lancarkan";

  const buttonClass = lockType === "taaruf"
    ? "bg-amber-50 text-amber-500 border border-amber-200 shadow-none"
    : lockType === "pending"
    ? "bg-orange-50 text-orange-400 border border-orange-200 shadow-none"
    : sent
    ? "bg-gray-100 text-gray-400"
    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200";

  const hasFoto = profile.fotoProfil || profile.fotoEvent;

  return (
    <>
    <Card className="w-full overflow-hidden relative border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] group bg-white">
      <Dialog>
        {/* Cover foto â€” klik buka detail */}
        <DialogTrigger asChild>
          <div className="relative h-[440px] cursor-pointer overflow-hidden">
            <Image
              src={photoUrl(profile.fotoProfil) || photoUrl(profile.fotoEvent) || "/placeholder-user.jpg"}
              className={cn(
                "object-cover transition-all duration-700",
                isEventBlurActive ? "blur-2xl grayscale scale-110" : "blur-0 grayscale-0"
              )}
              fill
              alt="Profile"
              unoptimized
              loading="lazy"
              sizes="(max-width: 430px) 100vw, 430px"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

            {!isEventBlurActive && (
              <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md p-2.5 rounded-2xl text-white">
                <ChevronDown className="h-5 w-5" />
              </div>
            )}

            <div className="absolute bottom-6 left-6 text-white pointer-events-none">
               <h2 className="text-3xl font-black">{profile.namaLengkap}, {age} Thn</h2>
               <p className="text-emerald-300 font-bold tracking-wide">{profile.asalDaerah}</p>
            </div>

            {isEventBlurActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm font-black bg-black/40 px-6 py-3 rounded-full backdrop-blur-xl border border-white/20 uppercase tracking-widest">Foto Terkunci</span>
              </div>
            )}
          </div>
        </DialogTrigger>

        {/* Detail Dialog */}
        <DialogContent
          className="max-w-md w-full h-[95vh] p-0 overflow-y-auto bg-white border-none sm:rounded-[2.5rem] gap-0"
          onPointerDownOutside={(e) => { if (zoomImage) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (zoomImage) e.preventDefault(); }}
          onInteractOutside={(e) => { if (zoomImage) e.preventDefault(); }}
        >

          {/* Header with close */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-50 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">{profile.namaLengkap}, {age} Thn</h2>
            <DialogClose className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>

          {/* Foto grid â€” di atas semua */}
          {!isEventBlurActive && (profile.fotoProfil || profile.fotoEvent) && (
            <div className="px-6 pt-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Foto</p>
              <div className="grid grid-cols-2 gap-3">
                {profile.fotoProfil && (
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all" onClick={() => setZoomImage(photoUrl(profile.fotoProfil)!)}>
                    <Image src={photoUrl(profile.fotoProfil)!} fill className="object-cover" alt="Foto Profil" unoptimized />
                    <span className="absolute bottom-2 left-2 text-white text-[9px] font-bold bg-black/50 px-2 py-0.5 rounded-full">Utama</span>
                  </div>
                )}
                {profile.fotoEvent && (
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all" onClick={() => setZoomImage(photoUrl(profile.fotoEvent)!)}>
                    <Image src={photoUrl(profile.fotoEvent)!} fill className="object-cover" alt="Foto Event" unoptimized />
                    <span className="absolute bottom-2 left-2 text-emerald-300 text-[9px] font-bold bg-black/50 px-2 py-0.5 rounded-full">Event</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="px-6 pt-4">
            <p className="text-emerald-600 font-bold">{profile.asalDaerah}</p>
          </div>

          <div className="px-6 pb-4">
            <Badge variant="secondary" className="rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 border-none font-bold text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(profile.tanggalLahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </Badge>
            {profile.statusPernikahan && profile.statusPernikahan !== "Lajang" && (
              <Badge variant="secondary" className="ml-2 rounded-full px-3 py-1 bg-gray-100 text-gray-600 border-none font-bold text-xs">{profile.statusPernikahan}</Badge>
            )}
          </div>

          {/* Asal / Biodata */}
          <div className="px-6 pt-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Asal / Biodata</p>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <InfoRow icon={<MapPin className="h-4 w-4 text-gray-400" />} label="Asal Daerah" value={profile.asalDaerah} />
              <InfoRow icon={<Home className="h-4 w-4 text-gray-400" />} label="Asal Desa" value={profile.asalDesa} />
              <InfoRow icon={<Users className="h-4 w-4 text-gray-400" />} label="Asal Kelompok" value={profile.asalKelompok} last />
            </div>
          </div>

          {/* Latar Belakang */}
          {(profile.statusMubaligh || profile.pendidikanTerakhir || profile.pekerjaan || profile.anakKe || profile.jumlahSaudara) && (
            <div className="px-6 pt-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Latar Belakang</p>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                {profile.statusMubaligh && <InfoRow icon={<Users className="h-4 w-4 text-gray-400" />} label="Mubaligh" value={profile.statusMubaligh} />}
                {profile.pendidikanTerakhir && <InfoRow icon={<Users className="h-4 w-4 text-gray-400" />} label="Pendidikan" value={profile.pendidikanTerakhir} />}
                {profile.pekerjaan && <InfoRow icon={<Users className="h-4 w-4 text-gray-400" />} label="Pekerjaan" value={profile.pekerjaan} />}
                {profile.anakKe && <InfoRow icon={<Users className="h-4 w-4 text-gray-400" />} label="Anak Ke" value={String(profile.anakKe)} />}
                {profile.jumlahSaudara && <InfoRow icon={<Users className="h-4 w-4 text-gray-400" />} label="Saudara" value={String(profile.jumlahSaudara)} />}
              </div>
            </div>
          )}

          {/* Daerah Sambung â€” section sendiri */}
          {(profile.daerahSambung || profile.desaSambung || profile.kelompokSambung) && (
            <div className="px-6 pt-5">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Daerah Sambung</p>
              <div className="bg-emerald-50/50 rounded-2xl p-4 space-y-2">
                {profile.daerahSambung && <InfoRow icon={<MapPin className="h-4 w-4 text-emerald-400" />} label="Daerah" value={profile.daerahSambung} />}
                {profile.desaSambung && <InfoRow icon={<Home className="h-4 w-4 text-emerald-400" />} label="Desa" value={profile.desaSambung} />}
                {profile.kelompokSambung && <InfoRow icon={<Users className="h-4 w-4 text-emerald-400" />} label="Kelompok" value={profile.kelompokSambung} />}
              </div>
            </div>
          )}

          {/* Orang Tua */}
          <div className="px-6 pt-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Kondisi Orang Tua</p>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <InfoRow icon={<Users className="h-4 w-4 text-gray-400" />} label="Ibu" value={profile.kondisiIbu ? `${profile.kondisiIbu}${profile.statusJamaahIbu ? ` (${profile.statusJamaahIbu})` : ""}` : "-"} />
              <InfoRow icon={<Users className="h-4 w-4 text-gray-400" />} label="Bapak" value={profile.kondisiAyah ? `${profile.kondisiAyah}${profile.statusJamaahAyah ? ` (${profile.statusJamaahAyah})` : ""}` : "-"} last />
            </div>
          </div>

          {/* Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-50 p-6 flex gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1 rounded-3xl h-14 font-black text-lg border-gray-200">
                <ArrowLeft className="h-5 w-5 mr-2" /> Kembali
              </Button>
            </DialogClose>
            <Button onClick={handleRequest} disabled={disabled} className={cn("flex-1 rounded-3xl h-14 font-black text-lg transition-all active:scale-95 shadow-lg", buttonClass)}>
              {buttonLabel}
            </Button>
          </div>
          {zoomImage && (
            <div className="absolute inset-0 z-50 bg-black/95 flex flex-col rounded-[2.5rem] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-4">
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl font-bold text-gray-900 hover:bg-gray-100 transition-all shadow-lg"
                  onClick={() => setZoomImage(null)}
                >
                  <ArrowLeft className="h-5 w-5" /> Kembali
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center h-12 w-12 bg-white hover:bg-gray-100 text-gray-900 rounded-full font-bold transition-all shadow-lg"
                  onClick={() => setZoomImage(null)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative w-full max-w-md aspect-[3/4]">
                  <Image src={zoomImage} fill className="object-contain" alt="Zoom" unoptimized />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Card body (preview ringkas) */}
      <CardContent className="p-6 pt-5 space-y-4">
        <div className="flex flex-wrap gap-2">
           <Badge variant="secondary" className="rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 border-none font-bold">
             {new Date(profile.tanggalLahir).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}
           </Badge>
           <Badge variant="secondary" className="rounded-full px-3 py-1 bg-gray-100 text-gray-600 border-none font-bold">{profile.asalDesa}</Badge>
           <Badge variant="secondary" className="rounded-full px-3 py-1 bg-gray-100 text-gray-600 border-none font-bold">{profile.asalKelompok}</Badge>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
           <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-400 font-medium">Asal Daerah</span>
              <span className="font-bold text-gray-700">{profile.asalDaerah}</span>
           </div>
           <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-400 font-medium">Asal Desa</span>
              <span className="font-bold text-gray-700">{profile.asalDesa}</span>
           </div>
           <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 font-medium">Asal Kelompok</span>
              <span className="font-bold text-gray-700">{profile.asalKelompok}</span>
           </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          onClick={handleRequest}
          disabled={disabled}
          className={cn(
            "w-full rounded-3xl h-14 font-black text-lg transition-all active:scale-95 shadow-lg",
            buttonClass
          )}
        >
          {buttonLabel}
        </Button>
      </CardFooter>
    </Card>

    </>
  );
}

function InfoRow({ icon, label, value, last = false }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between text-sm", !last && "border-b border-gray-100 pb-3")}>
      <span className="flex items-center gap-2 text-gray-400 font-medium">{icon}{label}</span>
      <span className="font-bold text-gray-700">{value || "-"}</span>
    </div>
  );
}

