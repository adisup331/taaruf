"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, ArrowRight } from "lucide-react";
import { cn, statusLabel } from "@/lib/utils";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { DeleteConfirmButton } from "@/components/admin-panel/delete-confirm-button";

const TABS = [
  { key: "active", label: "Aktif", statuses: ["PENDING", "APPROVED"] },
  { key: "lanjut", label: "Lanjut / SL", statuses: ["LANJUT", "SL"] },
  { key: "tidak", label: "Tidak Lanjut", statuses: ["TIDAK_LANJUT"] },
  { key: "pengurus", label: "Diserahkan Pengurus", statuses: ["DISERAHKAN_PENGURUS"] },
  { key: "all", label: "Semua", statuses: [] },
];

const statusVariant = (s: string) =>
  s === "APPROVED" || s === "LANJUT" || s === "SL" || s === "DISERAHKAN_PENGURUS" ? "default" : "secondary";

interface Props {
  requests: any[];
  participantMap: Record<string, string>;
  availableTables: number[];
  selectedEventId: string | null;
  updateRequest: (id: string, prev: any, fd: FormData) => Promise<any>;
  deleteRequest: (id: string) => Promise<any>;
}

export function MatchDesk({
  requests,
  participantMap,
  availableTables,
  selectedEventId,
  updateRequest,
  deleteRequest,
}: Props) {
  const [activeTab, setActiveTab] = useState("active");

  const tabStatuses = TABS.find(t => t.key === activeTab)?.statuses || [];
  const filtered = tabStatuses.length > 0
    ? requests.filter(r => tabStatuses.includes(r.status))
    : requests;

  const counts: Record<string, number> = {
    active: requests.filter(r => ["PENDING", "APPROVED"].includes(r.status)).length,
    lanjut: requests.filter(r => ["LANJUT", "SL"].includes(r.status)).length,
    tidak: requests.filter(r => r.status === "TIDAK_LANJUT").length,
    pengurus: requests.filter(r => r.status === "DISERAHKAN_PENGURUS").length,
    all: requests.length,
  };

  return (
    <div className="space-y-4">
      {/* Tabs — instant, no network */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-xs font-bold transition-all",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className={cn(
              "ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
            )}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        {filtered.map((req: any) => {
          const senderNum = participantMap[req.senderId];
          const receiverNum = participantMap[req.receiverId];
          const shortId = req.id.slice(-6).toUpperCase();

          return (
            <Card key={req.id} className="overflow-hidden">
              <CardContent className="flex flex-col items-center gap-6 p-4 md:flex-row md:justify-between relative pt-8 md:pt-4">
                <div className="absolute top-0 left-0 bg-muted px-3 py-1 rounded-br-lg text-[10px] font-mono font-bold text-muted-foreground border-r border-b">
                  KODE: {shortId} {req.createdAt && <span className="ml-2 text-muted-foreground/70">{new Date(req.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} {new Date(req.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>}
                </div>

                <div className="flex-1 text-center md:text-left mt-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">PENGIRIM</p>
                  <h4 className="font-bold text-lg">{req.senderProfile?.namaLengkap || "-"}</h4>
                  <p className="text-sm text-muted-foreground">{req.senderProfile?.asalKelompok}</p>
                  {req.senderProfile?.daerahSambung && (
                    <p className="text-xs text-emerald-600 font-medium">Sambung: {req.senderProfile.daerahSambung}</p>
                  )}
                  {senderNum && <Badge variant="outline" className="mt-1 text-[10px]">No. {senderNum}</Badge>}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <Badge variant={statusVariant(req.status)}>{statusLabel(req.status)}</Badge>
                  {req.tableNumber && (
                    <span className="text-xs text-muted-foreground">Meja {req.tableNumber}</span>
                  )}
                </div>

                <div className="flex-1 text-center md:text-right">
                  <p className="text-xs font-medium text-muted-foreground">PENERIMA</p>
                  <h4 className="font-semibold">{req.receiverProfile?.namaLengkap || "-"}</h4>
                  <p className="text-sm text-muted-foreground">{req.receiverProfile?.asalKelompok}</p>
                  {req.receiverProfile?.daerahSambung && (
                    <p className="text-xs text-emerald-600 font-medium">Sambung: {req.receiverProfile.daerahSambung}</p>
                  )}
                  {receiverNum && <Badge variant="outline" className="mt-1 text-[10px]">No. {receiverNum}</Badge>}
                </div>

                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                  <ActionForm action={updateRequest.bind(null, req.id)} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="eventId" value={selectedEventId || ""} />
                    <select
                      name="tableNumber"
                      defaultValue={req.tableNumber || ""}
                      className="h-9 w-16 rounded-md border bg-background px-2 text-sm"
                    >
                      <option value="">-</option>
                      {req.tableNumber && (
                        <option value={req.tableNumber}>{req.tableNumber}</option>
                      )}
                      {availableTables.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <select name="status" defaultValue={req.status} className="h-9 rounded-md border bg-background px-2 text-sm">
                      <option value="PENDING">Menunggu</option>
                      <option value="APPROVED">Sedang Taaruf</option>
                      <option value="LANJUT">Lanjut</option>
                      <option value="SL">Lamaran (SL)</option>
                      <option value="TIDAK_LANJUT">Tidak Lanjut</option>
                      <option value="DISERAHKAN_PENGURUS">Diserahkan Pengurus Daerah</option>
                    </select>
                    <SubmitButton size="sm" pendingText="...">Update</SubmitButton>
                  </ActionForm>

                  <Button variant="secondary" size="sm" asChild title="Cetak Biodata">
                    <a href={`/admin/print/match/${req.id}`} target="_blank">
                      <Printer className="mr-2 h-4 w-4" /> Bio
                    </a>
                  </Button>

                  <DeleteConfirmButton
                    title="Hapus Antrean?"
                    description="Hapus data pasangan ini dari daftar antrean event."
                    action={deleteRequest.bind(null, req.id)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-muted/20">
            <p className="font-bold">Tidak ada data di tab ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
