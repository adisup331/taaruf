import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Printer, ArrowRight, Plus } from "lucide-react";
import { revalidatePath } from "next/cache";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { MatchSearch } from "@/components/admin-panel/match-search";
import { type ActionResult } from "@/lib/action-result";
import { MatchDesk } from "./match-desk";
import { DEFAULT_TEMPLATE } from "@/lib/constants";

export default async function LiveMatchingPage({
  searchParams,
}: {
  searchParams: { eventId?: string; q?: string };
}) {
  const supabase = createClient();
  const query = (searchParams.q || "").toLowerCase();

  // All events for the picker
  const { data: events } = await supabase
    .from("Event")
    .select("id, title, isActive, totalTables")
    .order("date", { ascending: false });

  // Selected event: from URL, else first active, else first event
  const selectedEventId =
    searchParams.eventId ||
    events?.find((e) => e.isActive)?.id ||
    events?.[0]?.id ||
    null;

  const selectedEvent = events?.find((e) => e.id === selectedEventId) || null;

  // ⚡ TaarufRequest + EventAttendees PARALEL
  let requestsRaw: any[] = [];
  let attendeeData: any[] = [];
  let messageTemplate = DEFAULT_TEMPLATE;
  let daerahContacts: Record<string, { contactName: string | null; contactWhatsapp: string | null; contactName2: string | null; contactWhatsapp2: string | null }> = {};

  if (selectedEventId) {
    let rq = supabase
      .from("TaarufRequest")
      .select(`
        id, status, tableNumber, senderId, receiverId,
        sender:User!TaarufRequest_senderId_fkey ( Profile ( namaLengkap, asalKelompok, daerahSambung, nomorHp ) ),
        receiver:User!TaarufRequest_receiverId_fkey ( Profile ( namaLengkap, asalKelompok, daerahSambung, nomorHp ) )
      `)
      .eq("eventId", selectedEventId)
      .order("id", { ascending: false });

    if (query) rq = rq.ilike("id", `%${query}%`);

    const [rqRes, attRes, daerahRes] = await Promise.all([
      rq,
      supabase
        .from("EventAttendee")
        .select("userId, participantNumber")
        .eq("eventId", selectedEventId),
      supabase
        .from("Daerah")
        .select("*"),
    ]);
    requestsRaw = rqRes.data || [];
    attendeeData = attRes.data || [];
    (daerahRes.data || []).forEach((d: any) => {
      if (d.nama) daerahContacts[d.nama] = { contactName: d.contactName, contactWhatsapp: d.contactWhatsapp, contactName2: d.contactName2, contactWhatsapp2: d.contactWhatsapp2 };
    });
    const { data: tmplSetting } = await supabase.from("AppSetting").select("value").eq("key", "followup_message_template").maybeSingle();
    if (tmplSetting?.value) messageTemplate = tmplSetting.value;
  }

  const requests = requestsRaw.map((req: any) => {
    const senderUser = Array.isArray(req.sender) ? req.sender[0] : req.sender;
    const receiverUser = Array.isArray(req.receiver) ? req.receiver[0] : req.receiver;
    return {
      ...req,
      senderProfile: Array.isArray(senderUser?.Profile) ? senderUser.Profile[0] : senderUser?.Profile,
      receiverProfile: Array.isArray(receiverUser?.Profile) ? receiverUser.Profile[0] : receiverUser?.Profile,
    };
  });

  const participantMap: Record<string, string> = {};
  attendeeData.forEach((a: any) => {
    if (a.participantNumber) participantMap[a.userId] = a.participantNumber;
  });

  // Used tables logic (to prevent duplicate table assignments)
  const usedTables = requests
    .filter(r => r.status === 'APPROVED' && r.tableNumber)
    .map(r => r.tableNumber);

  // Available tables (1 to totalTables)
  const totalTables = selectedEvent?.totalTables || 0;
  const availableTables = Array.from({ length: totalTables }, (_, i) => i + 1).filter(
    (t) => !usedTables.includes(t)
  );

  // --- Server Action: create a pair manually by participant numbers ---
  async function createManualMatch(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const eventId = formData.get("eventId") as string;
    const numA = (formData.get("numA") as string)?.trim();
    const numB = (formData.get("numB") as string)?.trim();
    const tableNumberRaw = formData.get("tableNumber") as string;

    if (!eventId || !numA || !numB) {
      return { ok: false, message: "Isi kedua nomor peserta." };
    }

    const { data: attA } = await supabase
      .from("EventAttendee")
      .select("userId")
      .eq("eventId", eventId)
      .eq("participantNumber", numA)
      .single();

    const { data: attB } = await supabase
      .from("EventAttendee")
      .select("userId")
      .eq("eventId", eventId)
      .eq("participantNumber", numB)
      .single();

    if (!attA || !attB) {
      return { ok: false, message: `Nomor peserta ${!attA ? numA : numB} tidak ditemukan di event ini.` };
    }

    if (tableNumberRaw) {
      const tNum = parseInt(tableNumberRaw);
      const { data: conflict } = await supabase
        .from("TaarufRequest")
        .select("id")
        .eq("eventId", eventId)
        .eq("tableNumber", tNum)
        .eq("status", "APPROVED")
        .maybeSingle();

      if (conflict) {
        return { ok: false, message: `Meja ${tNum} sedang digunakan oleh pasangan lain.` };
      }
    }

    const { error } = await supabase.from("TaarufRequest").insert({
      senderId: attA.userId,
      receiverId: attB.userId,
      eventId,
      status: tableNumberRaw ? "APPROVED" : "PENDING",
      tableNumber: tableNumberRaw ? parseInt(tableNumberRaw) : null,
    });

    if (error) return { ok: false, message: `Gagal: ${error.message}` };

    revalidatePath("/admin/matches");
    return { ok: true, message: `Pasangan ${numA} ↔ ${numB} berhasil dibuat.` };
  }

  async function updateRequest(
    requestId: string,
    _prev: ActionResult,
    formData: FormData
  ): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const tableNumberRaw = formData.get("tableNumber") as string;
    const status = formData.get("status") as string;
    const eventId = formData.get("eventId") as string;

    if (status === "APPROVED" && tableNumberRaw) {
      const tNum = parseInt(tableNumberRaw);
      // Cek apakah meja sedang dipakai oleh pasangan lain (status APPROVED)
      const { data: conflict } = await supabase
        .from("TaarufRequest")
        .select("id")
        .eq("eventId", eventId)
        .eq("tableNumber", tNum)
        .eq("status", "APPROVED")
        .neq("id", requestId)
        .maybeSingle();

      if (conflict) {
        return { ok: false, message: `Meja ${tNum} sedang digunakan oleh pasangan lain.` };
      }
    }

    const payload: Record<string, unknown> = {};
    if (status && status !== "PENDING") payload.status = status;
    if (tableNumberRaw) payload.tableNumber = parseInt(tableNumberRaw);

    if (Object.keys(payload).length === 0) {
      return { ok: false, message: "Tidak ada perubahan." };
    }

    const { error } = await supabase.from("TaarufRequest").update(payload).eq("id", requestId);
    if (error) return { ok: false, message: `Gagal: ${error.message}` };
    revalidatePath("/admin/matches");
    return { ok: true, message: "Status pasangan diperbarui." };
  }

  async function deleteRequest(requestId: string): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const { error } = await supabase.from("TaarufRequest").delete().eq("id", requestId);
    if (error) return { ok: false, message: `Gagal: ${error.message}` };
    revalidatePath("/admin/matches");
    return { ok: true, message: "Antrean pasangan berhasil dihapus." };
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Match-Making Desk</h2>
          <p className="text-muted-foreground text-sm">Monitor dan kelola antrean pasangan taaruf.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto Search Component */}
          <MatchSearch eventId={selectedEventId || ""} />

          {/* Event picker */}
          <form method="GET" className="flex items-center gap-2">
            <select
              name="eventId"
              defaultValue={selectedEventId || ""}
              className="h-10 rounded-md border bg-background px-3 text-sm focus:ring-emerald-500"
            >
              {events?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} {e.isActive ? "(aktif)" : ""}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline" size="sm">Pilih</Button>
          </form>
          <Button variant="outline" size="sm" asChild>
            <a href={`/admin/matches/print?eventId=${selectedEventId}`} target="_blank">
              <Printer className="mr-2 h-4 w-4" /> Print Semua
            </a>
          </Button>
        </div>
      </div>

      {/* Manual pairing form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pasangkan Manual (by Nomor Peserta)
            {selectedEvent && <span className="ml-2 font-normal text-muted-foreground">— {selectedEvent.title}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedEvent ? (
            <p className="text-sm text-muted-foreground">Belum ada event. Buat event dulu.</p>
          ) : (
            <ActionForm action={createManualMatch} resetOnSuccess className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="eventId" value={selectedEvent.id} />
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">No. Peserta A (Laki-Laki)</label>
                <Input name="numA" placeholder="cth: 012" required className="w-32" />
              </div>
              <ArrowRight className="mb-2 h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">No. Peserta B (Perempuan)</label>
                <Input name="numB" placeholder="cth: 045" required className="w-32" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Meja (opsional) — {availableTables.length} kosong / {totalTables} total
                </label>
                <select name="tableNumber" className="h-10 w-36 rounded-md border bg-background px-3 text-sm">
                  <option value="">Pilih meja...</option>
                  {availableTables.map((t) => (
                    <option key={t} value={t}>Meja {t}</option>
                  ))}
                </select>
              </div>
              <SubmitButton pendingText="Membuat...">
                <Plus className="mr-2 h-4 w-4" /> Buat Pasangan
              </SubmitButton>
            </ActionForm>
          )}
        </CardContent>
      </Card>

      <MatchDesk
        requests={requests}
        participantMap={participantMap}
        availableTables={availableTables}
        selectedEventId={selectedEventId}
        daerahContacts={daerahContacts}
        eventTitle={selectedEvent?.title || ""}
        messageTemplate={messageTemplate}
        updateRequest={updateRequest}
        deleteRequest={deleteRequest}
      />
    </div>
  );
}
