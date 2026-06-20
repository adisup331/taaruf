"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Search, Camera, CheckCircle2, UserCheck, UserX, Trash2, ChevronDown, Phone, Instagram } from "lucide-react";
import { genderLabel, photoUrl } from "@/lib/utils";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";

interface AttendeeTableProps {
  attendees: any[];
  checkedInCount: number;
  actions: {
    updateAttendee: (attendeeId: string, prev: any, formData: FormData) => Promise<any>;
    checkinAttendee: (attendeeId: string, prev: any, formData: FormData) => Promise<any>;
    uncheckAttendee: (attendeeId: string, prev: any, formData: FormData) => Promise<any>;
    removeAttendee: (attendeeId: string, prev: any, formData: FormData) => Promise<any>;
  };
}

export function AttendeeTable({ attendees, checkedInCount, actions }: AttendeeTableProps) {
  const [search, setSearch] = useState("");
  const [showActions, setShowActions] = useState<string | null>(null);

  const filtered = search
    ? attendees.filter((a: any) =>
        (a.profile?.namaLengkap || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.participantNumber || "").includes(search)
      )
    : attendees;

  return (
    <div className="space-y-4">
      {/* Header: counter + search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-bold text-emerald-600">{checkedInCount}</span>
            <span className="text-muted-foreground">/ {attendees.length} hadir</span>
          </Badge>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama / nomor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filtered.map((a: any) => (
          <div
            key={a.id}
            className={`rounded-2xl border p-4 space-y-3 ${a.isCheckedIn ? "bg-emerald-50/50 border-emerald-100" : "bg-white"}`}
          >
            {/* Row 1: Avatar + Nama + No Peserta */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border shadow-sm">
                {photoUrl(a.profile?.fotoProfil) ? (
                  <AvatarImage src={photoUrl(a.profile.fotoProfil)!} alt={a.profile.namaLengkap} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-muted">
                    <Camera className="h-4 w-4 text-muted-foreground opacity-30" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{a.profile?.namaLengkap || "-"}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <Badge variant={a.profile?.jenisKelamin === "IKHWAN" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                    {genderLabel(a.profile?.jenisKelamin)}
                  </Badge>
                  {a.participantNumber && (
                    <span className="font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-lg tracking-tight">
                      #{a.participantNumber}
                    </span>
                  )}
                </div>
              </div>
              {/* Checkin Badge */}
              {a.isCheckedIn ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <span className="text-[9px] font-bold text-emerald-600">Hadir</span>
                </div>
              ) : (
                <div className="flex flex-col items-center opacity-40">
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                  <span className="text-[9px] font-bold text-gray-400">Belum</span>
                </div>
              )}
            </div>

            {/* Row 2: Quick Checkin Button */}
            <div className="flex gap-2">
              {a.isCheckedIn ? (
                <ActionForm action={actions.uncheckAttendee.bind(null, a.id)} className="flex-1">
                  <SubmitButton size="sm" variant="outline" pendingText="..." className="w-full h-10 border-amber-200 text-amber-700 bg-amber-50 text-xs font-bold rounded-xl">
                    <UserX className="h-4 w-4 mr-1" /> Batalkan Hadir
                  </SubmitButton>
                </ActionForm>
              ) : (
                <ActionForm action={actions.checkinAttendee.bind(null, a.id)} className="flex-1">
                  <SubmitButton size="sm" pendingText="..." className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl">
                    <UserCheck className="h-4 w-4 mr-1" /> Tandai Hadir
                  </SubmitButton>
                </ActionForm>
              )}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 rounded-xl"
                  onClick={() => setShowActions(showActions === a.id ? null : a.id)}
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${showActions === a.id ? "rotate-180" : ""}`} />
                </Button>
                {showActions === a.id && (
                  <div className="absolute right-0 bottom-full mb-2 z-10 bg-white border rounded-xl shadow-lg p-2 space-y-1 min-w-[180px]">
                    <div className="px-3 py-2 text-xs font-bold text-muted-foreground border-b">Atur No. Peserta</div>
                    <ActionForm action={actions.updateAttendee.bind(null, a.id)} className="flex items-center gap-1 px-2">
                      <Input name="participantNumber" defaultValue={a.participantNumber || ""} placeholder="No" className="h-8 w-16 text-sm" />
                      <SubmitButton size="sm" variant="outline" pendingText="..." className="text-xs">Set</SubmitButton>
                    </ActionForm>
                    <div className="border-t pt-1 mt-1">
                      <ActionForm action={actions.removeAttendee.bind(null, a.id)}>
                        <SubmitButton size="sm" variant="ghost" className="w-full justify-start text-destructive text-xs" pendingText="">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Hapus dari acara
                        </SubmitButton>
                      </ActionForm>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            {search ? `Tidak ditemukan "${search}"` : "Belum ada peserta."}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium w-[60px]">Foto</th>
              <th className="px-3 py-2 font-medium">Nama</th>
              <th className="px-3 py-2 font-medium">Gender</th>
              <th className="px-3 py-2 font-medium">No. Peserta</th>
              <th className="px-3 py-2 font-medium">Kehadiran</th>
              <th className="px-3 py-2 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a: any) => (
              <tr key={a.id} className={`border-b ${a.isCheckedIn ? "bg-emerald-50/50" : ""}`}>
                <td className="px-3 py-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Avatar className="h-10 w-10 border shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all">
                        {photoUrl(a.profile?.fotoProfil) ? (
                          <AvatarImage src={photoUrl(a.profile.fotoProfil)!} alt={a.profile.namaLengkap} className="object-cover" />
                        ) : (
                          <AvatarFallback className="bg-muted">
                            <Camera className="h-4 w-4 text-muted-foreground opacity-30" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </DialogTrigger>
                    {photoUrl(a.profile?.fotoProfil) && (
                      <DialogContent className="max-w-lg p-2 bg-black border-none rounded-2xl">
                        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden">
                          <Image src={photoUrl(a.profile.fotoProfil)!} fill className="object-contain" alt={a.profile.namaLengkap} unoptimized />
                        </div>
                        <p className="text-center text-white text-sm font-bold py-2">{a.profile.namaLengkap} — No. {a.participantNumber}</p>
                      </DialogContent>
                    )}
                  </Dialog>
                </td>
                <td className="px-3 py-2 font-medium">{a.profile?.namaLengkap || "-"}</td>
                <td className="px-3 py-2">
                  <Badge variant={a.profile?.jenisKelamin === "IKHWAN" ? "default" : "secondary"}>{genderLabel(a.profile?.jenisKelamin)}</Badge>
                </td>
                <td className="px-3 py-2">
                  <ActionForm action={actions.updateAttendee.bind(null, a.id)} className="flex items-center gap-1">
                    <Input name="participantNumber" defaultValue={a.participantNumber || ""} placeholder="No" className="h-8 w-20" />
                    <SubmitButton size="sm" variant="outline" pendingText="...">Set</SubmitButton>
                  </ActionForm>
                </td>
                <td className="px-3 py-2">
                  {a.isCheckedIn ? (
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle2 className="h-4 w-4" /> Hadir</span>
                      {a.checkedInAt && <span className="text-[10px] text-muted-foreground">{new Date(a.checkedInAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Belum hadir</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {a.isCheckedIn ? (
                      <ActionForm action={actions.uncheckAttendee.bind(null, a.id)}>
                        <SubmitButton size="icon" variant="ghost" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50" pendingText="">
                          <UserX className="h-4 w-4" />
                        </SubmitButton>
                      </ActionForm>
                    ) : (
                      <ActionForm action={actions.checkinAttendee.bind(null, a.id)}>
                        <SubmitButton size="icon" variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" pendingText="">
                          <UserCheck className="h-4 w-4" />
                        </SubmitButton>
                      </ActionForm>
                    )}
                    <ActionForm action={actions.removeAttendee.bind(null, a.id)}>
                      <SubmitButton size="icon" variant="ghost" className="text-destructive" pendingText="">
                        <Trash2 className="h-4 w-4" />
                      </SubmitButton>
                    </ActionForm>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  {search ? `Tidak ditemukan "${search}"` : "Belum ada peserta."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
