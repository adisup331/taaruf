"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { LayoutGrid, Table2, Printer } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { genderLabel, photoUrl } from "@/lib/utils";
import { EditMemberDialog } from "./edit-dialog";
import { AddToEventButton } from "./add-to-event";
import { DeleteConfirmButton } from "@/components/admin-panel/delete-confirm-button";
import { MemberDetailDialog } from "@/components/admin-panel/member-detail-dialog";
import Link from "next/link";

interface Props {
  profiles: any[];
  daerahList: any[];
  desaList: any[];
  kelompokList: any[];
  activeEvents: any[];
  deleteMember: (id: string) => Promise<any>;
}

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
};

export function MemberListView({ profiles, daerahList, desaList, kelompokList, activeEvents, deleteMember }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const viewMode = params.get("view") || "table";

  const setView = (v: string) => {
    const p = new URLSearchParams(params.toString());
    p.set("view", v);
    router.push(`?${p.toString()}`);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        {viewMode === "table" ? (
          <Button variant="outline" size="sm" onClick={() => setView("grid")} className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" /> Grid
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setView("table")} className="flex items-center gap-2">
            <Table2 className="h-4 w-4" /> Tabel
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div key="table" {...fade}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Member</th>
                    <th className="px-6 py-3 font-medium">Jenis Kelamin</th>
                    <th className="px-6 py-3 font-medium">Usia</th>
                    <th className="px-6 py-3 font-medium">Asal Daerah</th>
                    <th className="px-6 py-3 font-medium">Kelompok / Desa</th>
                    <th className="px-6 py-3 font-medium">Daerah Sambung</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <MemberDetailDialog profile={p} />
                          <span className="font-medium">{p.namaLengkap}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={p.jenisKelamin === "IKHWAN" ? "default" : "secondary"}>{genderLabel(p.jenisKelamin)}</Badge>
                      </td>
                      <td className="px-6 py-3">{calculateAge(p.tanggalLahir)} Tahun</td>
                      <td className="px-6 py-3">{p.asalDaerah}</td>
                      <td className="px-6 py-3 text-muted-foreground">{p.asalKelompok} / {p.asalDesa}</td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {[p.daerahSambung, p.desaSambung, p.kelompokSambung].filter(Boolean).join(" / ") || <span className="text-xs italic">-</span>}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <AddToEventButton userId={p.userId} events={activeEvents || []} />
                          <EditMemberDialog profile={p} daerahList={daerahList} desaList={desaList} kelompokList={kelompokList} />
                          <Link href={`/admin/print/member/${p.userId}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-600" title="Cetak Biodata PDF">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteConfirmButton title="Hapus Member?" description={`Hapus "${p.namaLengkap}"?`} action={deleteMember.bind(null, p.userId)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {profiles.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Belum ada member terdaftar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div key="grid" {...fade}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((p) => (
                <div key={p.id} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[4/3] relative bg-muted overflow-hidden">
                    {(photoUrl(p.fotoProfil) || photoUrl(p.fotoEvent)) ? (
                      <img src={(photoUrl(p.fotoProfil) || photoUrl(p.fotoEvent))!} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground text-4xl font-bold opacity-10">
                        {p.namaLengkap?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold truncate">{p.namaLengkap}</h3>
                      <p className="text-xs text-muted-foreground">{calculateAge(p.tanggalLahir)} Tahun &middot; {genderLabel(p.jenisKelamin)}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">{p.asalDaerah}</Badge>
                      <Badge variant="outline" className="text-[10px]">{p.asalDesa}</Badge>
                    </div>
                    <div className="flex items-center justify-end gap-1 pt-1 border-t">
                      <AddToEventButton userId={p.userId} events={activeEvents || []} />
                      <EditMemberDialog profile={p} daerahList={daerahList} desaList={desaList} kelompokList={kelompokList} />
                      <Link href={`/admin/print/member/${p.userId}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-600" title="Cetak Biodata PDF">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteConfirmButton title="Hapus Member?" description={`Hapus "${p.namaLengkap}"?`} action={deleteMember.bind(null, p.userId)} />
                    </div>
                  </div>
                </div>
              ))}
              {profiles.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground">Belum ada member terdaftar.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function calculateAge(dob: string | null) {
  if (!dob) return "-";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}
