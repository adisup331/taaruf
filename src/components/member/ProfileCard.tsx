"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, photoUrl } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";
import { Badge } from "../ui/badge";

export function ProfileCard({ profile, eventId, isEventBlurActive, targetUserId, alreadyRequested = false }: any) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(alreadyRequested);
  const age = new Date().getFullYear() - new Date(profile.tanggalLahir).getFullYear();

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

  return (
    <Card className="w-full overflow-hidden relative border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] group bg-white">
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative h-[440px] cursor-zoom-in overflow-hidden">
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

            {!isEventBlurActive && profile.fotoProfil && (
              <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md p-2.5 rounded-2xl text-white">
                <Maximize2 className="h-5 w-5" />
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

        {!isEventBlurActive && profile.fotoProfil && (
          <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden bg-black border-none sm:rounded-[3rem]">
             <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={photoUrl(profile.fotoProfil)!}
                  alt="Full Preview"
                  className="max-w-full max-h-full object-contain"
                />
             </div>
          </DialogContent>
        )}
      </Dialog>

      <CardContent className="p-6 pt-5 space-y-4">
        <div className="flex flex-wrap gap-2">
           <Badge variant="secondary" className="rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 border-none font-bold">Lahir: {new Date(profile.tanggalLahir).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}</Badge>
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
          disabled={loading || sent}
          className={cn(
            "w-full rounded-3xl h-14 font-black text-lg transition-all active:scale-95 shadow-lg",
            sent ? "bg-gray-100 text-gray-400" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
          )}
        >
          {alreadyRequested ? "Sudah Diminta ✓" : sent ? "Terkirim ✓" : loading ? "Memproses..." : "Lancarkan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
