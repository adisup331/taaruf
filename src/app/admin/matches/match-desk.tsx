"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, ArrowRight, MessageSquare, Send, Loader2 } from "lucide-react";
import { cn, statusLabel } from "@/lib/utils";
import { toast } from "sonner";
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

type DaerahContact = { contactName: string | null; contactWhatsapp: string | null; contactName2: string | null; contactWhatsapp2: string | null };
type FollowupMsg = { phone: string; message: string; picName: string };

function buildFollowup(
  req: any,
  daerahContacts: Record<string, DaerahContact>,
  participantMap: Record<string, string>,
  eventTitle: string,
  messageTemplate: string,
) {
  const senderDaerah = req.senderProfile?.daerahSambung || null;
  const receiverDaerah = req.receiverProfile?.daerahSambung || null;
  const shortId = req.id.slice(-6).toUpperCase();
  const senderName = req.senderProfile?.namaLengkap || "-";
  const receiverName = req.receiverProfile?.namaLengkap || "-";
  const senderNum = participantMap[req.senderId] || "-";
  const receiverNum = participantMap[req.receiverId] || "-";
  const senderHp = req.senderProfile?.nomorHp || "-";
  const receiverHp = req.receiverProfile?.nomorHp || "-";

  function fillTemplate(picName: string, daerah: string) {
    return messageTemplate
      .replace("{nama_pic}", picName).replace("{daerah}", daerah)
      .replace("{nama_pengirim}", senderName).replace("{no_pengirim}", senderNum)
      .replace("{hp_pengirim}", senderHp).replace("{daerah_pengirim}", senderDaerah || "-")
      .replace("{nama_penerima}", receiverName).replace("{no_penerima}", receiverNum)
      .replace("{hp_penerima}", receiverHp).replace("{daerah_penerima}", receiverDaerah || "-")
      .replace("{kode}", shortId).replace("{nama_event}", eventTitle)
      .replace("{status}", statusLabel(req.status) || req.status);
  }

  function makeWaUrl(phone: string, picName: string, daerah: string) {
    const clean = phone.replace(/[^0-9]/g, "");
    if (!clean) return null;
    return `https://wa.me/${clean}?text=${encodeURIComponent(fillTemplate(picName, daerah))}`;
  }

  function resolve(daerah: string | null): { urls: string[]; msgs: FollowupMsg[] } {
    if (!daerah || !daerahContacts[daerah]) return { urls: [], msgs: [] };
    const c = daerahContacts[daerah];
    const urls: string[] = [];
    const msgs: FollowupMsg[] = [];
    const pairs: [string | null, string | null][] = [[c.contactWhatsapp, c.contactName], [c.contactWhatsapp2, c.contactName2]];
    for (const [phone, name] of pairs) {
      if (!phone) continue;
      const picName = name || "Bapak/Ibu";
      const u = makeWaUrl(phone, picName, daerah);
      if (u) urls.push(u);
      const clean = phone.replace(/[^0-9]/g, "");
      if (clean) msgs.push({ phone: clean, message: fillTemplate(picName, daerah), picName });
    }
    return { urls, msgs };
  }

  const sender = resolve(senderDaerah);
  const receiver = resolve(receiverDaerah !== senderDaerah ? receiverDaerah : null);

  return {
    senderDaerah, receiverDaerah: receiverDaerah !== senderDaerah ? receiverDaerah : null,
    senderUrls: sender.urls, senderMsgs: sender.msgs,
    receiverUrls: receiver.urls, receiverMsgs: receiver.msgs,
  };
}

interface Props {
  requests: any[];
  participantMap: Record<string, string>;
  availableTables: number[];
  selectedEventId: string | null;
  daerahContacts: Record<string, DaerahContact>;
  eventTitle: string;
  messageTemplate: string;
  updateRequest: (id: string, prev: any, fd: FormData) => Promise<any>;
  deleteRequest: (id: string) => Promise<any>;
}

export function MatchDesk({
  requests, participantMap, availableTables, selectedEventId,
  daerahContacts, eventTitle, messageTemplate,
  updateRequest, deleteRequest,
}: Props) {
  const [activeTab, setActiveTab] = useState("active");
  const [sendingState, setSendingState] = useState<{ id: string; step: string } | null>(null);

  async function sendViaApi(phone: string, message: string, reqId: string, label: string) {
    const key = reqId + phone;
    setSendingState({ id: key, step: "Menyiapkan PDF..." });
    try {
      setSendingState({ id: key, step: "Mengirim pesan + PDF..." });
      const res = await fetch("/api/admin/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message, matchId: reqId }),
      });
      const data = await res.json();
      if (data.ok) {
        setSendingState({ id: key, step: "Berhasil!" });
        toast.success(`Pesan ke ${label} berhasil dikirim!`);
      } else {
        toast.error(data.error || data.message || "Gagal mengirim");
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setTimeout(() => setSendingState(null), 1500);
    }
  }

  const tabStatuses = TABS.find(t => t.key === activeTab)?.statuses || [];
  const filtered = tabStatuses.length > 0 ? requests.filter(r => tabStatuses.includes(r.status)) : requests;

  const counts: Record<string, number> = {
    active: requests.filter(r => ["PENDING", "APPROVED"].includes(r.status)).length,
    lanjut: requests.filter(r => ["LANJUT", "SL"].includes(r.status)).length,
    tidak: requests.filter(r => r.status === "TIDAK_LANJUT").length,
    pengurus: requests.filter(r => r.status === "DISERAHKAN_PENGURUS").length,
    all: requests.length,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map(tab => (
          <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
            className={cn("flex-1 rounded-md px-3 py-2 text-xs font-bold transition-all",
              activeTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {tab.label}
            <span className={cn("ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20")}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map((req: any) => {
          const senderNum = participantMap[req.senderId];
          const receiverNum = participantMap[req.receiverId];
          const shortId = req.id.slice(-6).toUpperCase();
          const fu = ["DISERAHKAN_PENGURUS", "LANJUT", "SL"].includes(req.status) ? buildFollowup(req, daerahContacts, participantMap, eventTitle, messageTemplate) : null;

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
                  {req.senderProfile?.daerahSambung && <p className="text-xs text-emerald-600 font-medium">Sambung: {req.senderProfile.daerahSambung}</p>}
                  {senderNum && <Badge variant="outline" className="mt-1 text-[10px]">No. {senderNum}</Badge>}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <Badge variant={statusVariant(req.status)}>{statusLabel(req.status)}</Badge>
                  {req.tableNumber && <span className="text-xs text-muted-foreground">Meja {req.tableNumber}</span>}
                </div>

                <div className="flex-1 text-center md:text-right">
                  <p className="text-xs font-medium text-muted-foreground">PENERIMA</p>
                  <h4 className="font-semibold">{req.receiverProfile?.namaLengkap || "-"}</h4>
                  <p className="text-sm text-muted-foreground">{req.receiverProfile?.asalKelompok}</p>
                  {req.receiverProfile?.daerahSambung && <p className="text-xs text-emerald-600 font-medium">Sambung: {req.receiverProfile.daerahSambung}</p>}
                  {receiverNum && <Badge variant="outline" className="mt-1 text-[10px]">No. {receiverNum}</Badge>}
                </div>

                <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <ActionForm action={updateRequest.bind(null, req.id)} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="eventId" value={selectedEventId || ""} />
                      <select name="tableNumber" defaultValue={req.tableNumber || ""} className="h-9 w-16 rounded-md border bg-background px-2 text-sm">
                        <option value="">-</option>
                        {req.tableNumber && <option value={req.tableNumber}>{req.tableNumber}</option>}
                        {availableTables.map((t) => <option key={t} value={t}>{t}</option>)}
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
                      <a href={`/admin/print/match/${req.id}`} target="_blank"><Printer className="mr-2 h-4 w-4" /> Bio</a>
                    </Button>

                    <DeleteConfirmButton title="Hapus Antrean?" description="Hapus data pasangan ini dari daftar antrean event." action={deleteRequest.bind(null, req.id)} />
                  </div>

                  {fu && (
                    <FollowupSection fu={fu} reqId={req.id} sendingState={sendingState} sendViaApi={sendViaApi} />
                  )}
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

function FollowupSection({ fu, reqId, sendingState, sendViaApi }: {
  fu: ReturnType<typeof buildFollowup>;
  reqId: string;
  sendingState: { id: string; step: string } | null;
  sendViaApi: (phone: string, message: string, reqId: string, label: string) => void;
}) {
  return (
    <div className="border-t pt-2 space-y-2">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Followup Pengurus</p>
      {fu.senderDaerah && (
        <FollowupDaerah label={fu.senderDaerah} urls={fu.senderUrls} msgs={fu.senderMsgs} reqId={reqId} sendingState={sendingState} sendViaApi={sendViaApi} />
      )}
      {fu.receiverDaerah && (
        <FollowupDaerah label={fu.receiverDaerah} urls={fu.receiverUrls} msgs={fu.receiverMsgs} reqId={reqId} sendingState={sendingState} sendViaApi={sendViaApi} />
      )}
      {!fu.senderDaerah && !fu.receiverDaerah && (
        <p className="text-[10px] text-amber-600 italic">Daerah sambung belum diisi</p>
      )}
    </div>
  );
}

function FollowupDaerah({ label, urls, msgs, reqId, sendingState, sendViaApi }: {
  label: string; urls: string[]; msgs: FollowupMsg[]; reqId: string;
  sendingState: { id: string; step: string } | null;
  sendViaApi: (phone: string, message: string, reqId: string, label: string) => void;
}) {
  if (msgs.length === 0) {
    return (
      <div>
        <p className="text-[10px] font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-[10px] text-amber-600 italic">Belum ada kontak</p>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-gray-500">{label}</p>
      {msgs.map((m, i) => {
        const picLabel = `${label}${msgs.length > 1 ? ` PIC ${i + 1}` : ""} (${m.picName})`;
        const isSending = sendingState?.id === reqId + m.phone;
        return (
          <div key={i} className="flex gap-1">
            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-[10px] flex-1 h-7" asChild>
              <a href={urls[i]} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-1 h-3 w-3" /> WA {m.picName}
              </a>
            </Button>
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-[10px] flex-1 h-7"
              disabled={isSending} onClick={() => sendViaApi(m.phone, m.message, reqId, picLabel)}>
              {isSending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Send className="mr-1 h-3 w-3" />}
              {isSending ? sendingState?.step || "Kirim..." : `API ${m.picName}`}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
