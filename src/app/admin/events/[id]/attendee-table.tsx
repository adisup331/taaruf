"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Search, Camera, CheckCircle2, UserCheck, UserX, Trash2 } from "lucide-react";
import { genderLabel, photoUrl } from "@/lib/utils";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";

interface AttendeeTableProps {
  attendees: any[];
  checkedInCount: number;
  // Server actions passed as props (bound)
  actions: {
    updateAttendee: (attendeeId: string, prev: any, formData: FormData) => Promise<any>;
    checkinAttendee: (attendeeId: string, prev: any, formData: FormData) => Promise<any>;
    uncheckAttendee: (attendeeId: string, prev: any, formData: FormData) => Promise<any>;
    removeAttendee: (attendeeId: string, prev: any, formData: FormData) => Promise<any>;
  };
}

export function AttendeeTable({ attendees, checkedInCount, actions }: AttendeeTableProps) {
  const [search, setSearch] = useState("");

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

      {/* Table */}
      <div className="overflow-x-auto">
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
                          <Image
                            src={photoUrl(a.profile.fotoProfil)!}
                            fill
                            className="object-contain"
                            alt={a.profile.namaLengkap}
                            unoptimized
                          />
                        </div>
                        <p className="text-center text-white text-sm font-bold py-2">
                          {a.profile.namaLengkap} — No. {a.participantNumber}
                        </p>
                      </DialogContent>
                    )}
                  </Dialog>
                </td>
                <td className="px-3 py-2 font-medium">{a.profile?.namaLengkap || "-"}</td>
                <td className="px-3 py-2">
                  <Badge variant={a.profile?.jenisKelamin === "IKHWAN" ? "default" : "secondary"}>
                    {genderLabel(a.profile?.jenisKelamin)}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <ActionForm action={actions.updateAttendee.bind(null, a.id)} className="flex items-center gap-1">
                    <Input
                      name="participantNumber"
                      defaultValue={a.participantNumber || ""}
                      placeholder="No"
                      className="h-8 w-20"
                    />
                    <SubmitButton size="sm" variant="outline" pendingText="...">Set</SubmitButton>
                  </ActionForm>
                </td>
                <td className="px-3 py-2">
                  {a.isCheckedIn ? (
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                        <CheckCircle2 className="h-4 w-4" /> Hadir
                      </span>
                      {a.checkedInAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(a.checkedInAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Belum hadir</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {a.isCheckedIn ? (
                      <ActionForm action={actions.uncheckAttendee.bind(null, a.id)}>
                        <SubmitButton size="icon" variant="ghost" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50" pendingText="" title="Batalkan checkin">
                          <UserX className="h-4 w-4" />
                        </SubmitButton>
                      </ActionForm>
                    ) : (
                      <ActionForm action={actions.checkinAttendee.bind(null, a.id)}>
                        <SubmitButton size="icon" variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" pendingText="" title="Checkin hadir">
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
