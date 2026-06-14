import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Plus, Settings } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { revalidatePath } from "next/cache";
import { DeleteEventButton } from "@/components/admin-panel/delete-event-button";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { type ActionResult } from "@/lib/action-result";

export default async function AdminEventsPage() {
  const supabase = createClient();

  // Robust: fetch events plainly (relation count failures won't hide the list)
  const { data: events } = await supabase
    .from("Event")
    .select("*")
    .order("date", { ascending: false });

  // Attendee counts per event (separate query)
  const counts: Record<string, number> = {};
  if (events && events.length > 0) {
    const { data: attendees } = await supabase
      .from("EventAttendee")
      .select("eventId");
    attendees?.forEach((a: any) => {
      counts[a.eventId] = (counts[a.eventId] || 0) + 1;
    });
  }

  async function createEvent(
    _prev: ActionResult,
    formData: FormData
  ): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const location = formData.get("location") as string;
    const totalTablesRaw = formData.get("totalTables") as string;

    if (!title || !date || !location) {
      return { ok: false, message: "Lengkapi semua field event." };
    }

    const slug =
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
      "-" + Math.floor(Math.random() * 1000);

    const { error } = await supabase.from("Event").insert({
      title,
      date: new Date(date).toISOString(),
      location,
      slug,
      totalTables: totalTablesRaw ? parseInt(totalTablesRaw) : 0,
      isActive: true,
      isPhotoBlurred: true,
    });

    if (error) {
      return { ok: false, message: `Gagal: ${error.message}` };
    }

    revalidatePath("/admin/events");
    return { ok: true, message: `Event "${title}" berhasil dibuat.` };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manajemen Event</h2>
        <p className="text-muted-foreground">Buka pendaftaran offline & generate QR Code.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buat Event Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionForm action={createEvent} resetOnSuccess className="flex flex-wrap gap-2">
            <input name="title" placeholder="Judul Event" required className="h-10 min-w-[200px] flex-1 rounded-md border bg-background px-3 text-sm" />
            <input name="date" type="datetime-local" required className="h-10 rounded-md border bg-background px-3 text-sm" />
            <input name="location" placeholder="Lokasi (Gedung/Masjid)" required className="h-10 min-w-[180px] flex-1 rounded-md border bg-background px-3 text-sm" />
            <input name="totalTables" type="number" min="0" placeholder="Jumlah Meja" required className="h-10 w-32 rounded-md border bg-background px-3 text-sm" />
            <SubmitButton pendingText="Membuat...">
              <Plus className="mr-2 h-4 w-4" /> Buka Event
            </SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events?.map((event: any) => {
          async function deleteEvent(): Promise<ActionResult> {
            "use server";
            const supabase = createClient();
            await supabase.from("TaarufRequest").delete().eq("eventId", event.id);
            await supabase.from("EventAttendee").delete().eq("eventId", event.id);
            const { error } = await supabase.from("Event").delete().eq("id", event.id);
            if (error) return { ok: false, message: `Gagal: ${error.message}` };
            revalidatePath("/admin/events");
            return { ok: true, message: `Event "${event.title}" dihapus.` };
          }

          return (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant={event.isActive ? "default" : "secondary"} className="mt-1">
                      {event.isActive ? "AKTIF" : "NON-AKTIF"}
                    </Badge>
                  </div>
                  <DeleteEventButton eventTitle={event.title} action={deleteEvent} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(event.date).toLocaleDateString("id-ID", { dateStyle: "full" })}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span>{counts[event.id] ?? 0} peserta</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{event.totalTables ?? 0} meja</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-4">
                  <div className="rounded-lg bg-white p-2">
                    <QRCodeSVG value={`${appUrl}/e/${event.slug}`} size={110} level="H" />
                  </div>
                  <code className="mt-2 rounded bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                    /e/{event.slug}
                  </code>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/admin/events/${event.id}`}>
                    <Settings className="mr-2 h-4 w-4" /> Kelola Event
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {(!events || events.length === 0) && (
          <div className="col-span-full rounded-xl border border-dashed py-20 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <p className="font-medium">Belum ada event terdaftar</p>
            <p className="text-sm">Buat event baru menggunakan form di atas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
