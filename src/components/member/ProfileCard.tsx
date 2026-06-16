"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, photoUrl } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Maximize2, X, ChevronDown, MapPin, Home, Users, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";

export function ProfileCard({ profile, eventId, isEventBlurActive, targetUserId, alreadyRequested = false, lockType = null }: any) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(alreadyRequested);
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
    ? "Sudah Diminta ✓"
    : sent
    ? "Terkirim ✓"
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
    <Card className="w-full overflow-hidden relative border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] group bg-white">
      <Dialog>
        {/* Cover foto — klik buka detail */}
        <DialogTrigger asChild>
          <div className="relative h-[440px] cursor-pointer overflow-hidden">
            <Image
              src={photoUrl(profile.fotoProfil) || "/placeholder-user.jpg"}
              className={cn(
                "object-cover transition-all duration-700",
                isEventBlurActive ? "blur-2xl grayscale scale-110" : "blur-0 grayscale-0"
              )}
              fill
              alt="Profile"
              unoptimized
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

            {!isEventBlurActive && (
              <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md p-2.5 rounded-2xl text-white">
                <ChevronDown className="h-5 w-5" />
              </div>
            )}

            <div className="absolute bottom-6 left-6 text-white pointer-events-none">
               <h2 className="text-3xl font-black">{profile.namaLengkap}, {age}</h2>
               <p className="text-emerald-300 font-bold tracking-wide">{profile.asalDaerah}</p>
            </div>

            {isEventBlurActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm font-black bg-black/40 px-6 py-3 rounded-full backdrop-blur-xl border border-white/20 uppercase tracking-widest">Foto Terkunci</span>
              </div>
            )}
          </div>
        </DialogTrigger>

        {/* Detail Dialog — fullscreen mobile */}
        <DialogContent className="max-w-md w-full h-[95vh] p-0 overflow-y-auto bg-white border-none sm:rounded-[2.5rem] gap-0">
          {/* Header foto gallery */}
          {hasFoto && !isEventBlurActive && (
            <div className="flex overflow-x-auto snap-x snap-mandatory">
              {profile.fotoProfil && (
                <div className="relative min-w-full h-[400px] snap-center flex-shrink-0">
                  <Image
                    src={photoUrl(profile.fotoProfil)!}
                    fill
                    className="object-cover"
                    alt="Foto Profil"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-white text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">Foto Utama</span>
                  {profile.fotoEvent && (
                    <span className="absolute bottom-4 right-4 text-white text-[10px] font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">Geser →</span>
                  )}
                </div>
              )}
              {profile.fotoEvent && (
                <div className="relative min-w-full h-[400px] snap-center flex-shrink-0">
                  <Image
                    src={photoUrl(profile.fotoEvent)!}
                    fill
                    className="object-cover"
                    alt="Foto Event"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-emerald-300 text-[10px] font-black uppercase tracking-widest bg-emerald-900/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-400/20">Foto Studio</span>
                </div>
              )}
            </div>
          )}

          {/* Biodata */}
          <div className="p-6 space-y-5">
            {/* Nama & Umur */}
            <div>
              <h2 className="text-2xl font-black text-gray-900">{profile.namaLengkap}, {age}</h2>
              <p className="text-emerald-600 font-bold">{profile.asalDaerah}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 border-none font-bold text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(profile.tanggalLahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </Badge>
            </div>

            {/* Info detail */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <InfoRow icon={<MapPin className="h-4 w-4 text-gray-400" />} label="Asal Daerah" value={profile.asalDaerah} />
              <InfoRow icon={<Home className="h-4 w-4 text-gray-400" />} label="Asal Desa" value={profile.asalDesa} />
              <InfoRow icon={<Users className="h-4 w-4 text-gray-400" />} label="Asal Kelompok" value={profile.asalKelompok} last />
            </div>

            {/* Tombol Lancarkan */}
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
          </div>
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
