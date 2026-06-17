import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, UserPlus, Trash2, CheckCircle2, Camera, UserCheck, UserX, Users } from "lucide-react";
import { ShareEvent } from "@/components/admin-panel/share-event";
import { DeleteEventButton } from "@/components/admin-panel/delete-event-button";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { type ActionResult } from "@/lib/action-result";
import { genderLabel, photoUrl } from "@/lib/utils";
import { nextParticipantNumber } from "@/lib/participant";
import { AddMembersForm } from "./add-members";
import { AttendeeTable } from "./attendee-table";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // ⚡ Event + Attendees + All Members PARALEL
  const [
    { data: event },
    { data: attendeesRaw },
    { data: allMembers },
  ] = await Promise.all([
    supabase
      .from("Event")
      .select("id, title, slug, date, location, isActive, isPhotoBlurred, totalTables")
      .eq("id", params.id)
      .single(),
    supabase
      .from("EventAttendee")
      .select(`
        id, participantNumber, isVerified, isCheckedIn, checkedInAt, userId,
        User ( id, email, name, Profile ( id, namaLengkap, jenisKelamin, fotoProfil ) )
      `)
      .eq("eventId", params.id),
    supabase
      .from("Profile")
      .select("userId, namaLengkap, jenisKelamin")
      .order("namaLengkap", { ascending: true }),
  ]);

  if (!event) notFound();

  const attendees = attendeesRaw?.map((a: any) => {
    const userData = Array.isArray(a.User) ? a.User[0] : a.User;
    const profile = Array.isArray(userData?.Profile) ? userData.Profile[0] : userData?.Profile;
    return {
      ...a,
      profile: profile || { namaLengkap: userData?.name || "Member Baru", jenisKelamin: "IKHWAN" }
    }
  }) || [];

  const checkedInCount = attendees.filter((a: any) => a.isCheckedIn).length;

  const attendeeUserIds = attendees.map((a: any) => a.userId);

  const availableMembers = (allMembers || []).filter(
    (m: any) => !attendeeUserIds.includes(m.userId)
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const joinUrl = `${appUrl}/e/${event.slug}`;

  // --- Server Actions ---
  async function updateEvent(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const { error } = await supabase
      .from("Event")
      .update({
        title: formData.get("title") as string,
        location: formData.get("location") as string,
        date: new Date(formData.get("date") as string).toISOString(),
        totalTables: parseInt((formData.get("totalTables") as string) || "0"),
        isActive: formData.get("isActive") === "on",
        isPhotoBlurred: formData.get("isPhotoBlurred") === "on",
      })
      .eq("id", params.id);
    if (error) return { ok: false, message: `Gagal: ${error.message}` };
    revalidatePath(`/admin/events/${params.id}`);
    revalidatePath("/admin/events");
    return { ok: true, message: "Perubahan event tersimpan." };
  }

  async function deleteEvent(): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    await supabase.from("TaarufRequest").delete().eq("eventId", params.id);
    await supabase.from("EventAttendee").delete().eq("eventId", params.id);
    const { error } = await supabase.from("Event").delete().eq("id", params.id);
    if (error) return { ok: false, message: `Gagal: ${error.message}` };
    revalidatePath("/admin/events");
    redirect("/admin/events");
  }

  async function addAttendee(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const userId = formData.get("userId") as string;
    let participantNumber = (formData.get("participantNumber") as string)?.trim() || null;
    if (!userId) return { ok: false, message: "Pilih member dulu." };

    if (!participantNumber) {
      participantNumber = await nextParticipantNumber(supabase, params.id);
    }

    const { error } = await supabase.from("EventAttendee").insert({
      eventId: params.id,
      userId,
      participantNumber,
      isVerified: true,
    });
    if (error) return { ok: false, message: `Gagal: ${error.message}` };
    revalidatePath(`/admin/events/${params.id}`);
    return { ok: true, message: `Peserta ditambahkan (No. ${participantNumber}).` };
  }

  async function updateAttendee(
    attendeeId: string,
    _prev: ActionResult,
    formData: FormData
  ): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const { error } = await supabase
      .from("EventAttendee")
      .update({
        participantNumber: (formData.get("participantNumber") as string)?.trim() || null,
        isVerified: true,
      })
      .eq("id", attendeeId);
    if (error) return { ok: false, message: `Gagal: ${error.message}` };
    revalidatePath(`/admin/events/${params.id}`);
    return { ok: true, message: "Nomor peserta diperbarui." };
  }

  async function removeAttendee(
    attendeeId: string,
    _prev: ActionResult,
    _formData: FormData
  ): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const { error } = await supabase.from("EventAttendee").delete().eq("id", attendeeId);
    if (error) return { ok: false, message: `Gagal: ${error.message}` };
    revalidatePath(`/admin/events/${params.id}`);
    return { ok: true, message: "Peserta dihapus." };
  }

  async function checkinAttendee(
    attendeeId: string,
    _prev: ActionResult,
    _formData: FormData
  ): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const { error } = await supabase
      .from("EventAttendee")
      .update({ isCheckedIn: true, checkedInAt: new Date().toISOString() })
      .eq("id", attendeeId);
    if (error) return { ok: false, message: `Gagal checkin: ${error.message}` };
    revalidatePath(`/admin/events/${params.id}`);
    return { ok: true, message: "Peserta dicheckin." };
  }

  async function uncheckAttendee(
    attendeeId: string,
    _prev: ActionResult,
    _formData: FormData
  ): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const { error } = await supabase
      .from("EventAttendee")
      .update({ isCheckedIn: false, checkedInAt: null })
      .eq("id", attendeeId);
    if (error) return { ok: false, message: `Gagal: ${error.message}` };
    revalidatePath(`/admin/events/${params.id}`);
    return { ok: true, message: "Checkin dibatalkan." };
  }

  const dateLocal = new Date(event.date).toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/events"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali</Link>
        </Button>
        <DeleteEventButton eventTitle={event.title} action={deleteEvent} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Edit form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Event</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={updateEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Judul Event</label>
                <Input name="title" defaultValue={event.title} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tanggal & Waktu</label>
                  <Input name="date" type="datetime-local" defaultValue={dateLocal} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Jumlah Meja</label>
                  <Input name="totalTables" type="number" min="0" defaultValue={event.totalTables ?? 0} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Lokasi</label>
                <Input name="location" defaultValue={event.location} required />
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isActive" defaultChecked={event.isActive} className="h-4 w-4" />
                  Event Aktif
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isPhotoBlurred" defaultChecked={event.isPhotoBlurred} className="h-4 w-4" />
                  Blur Foto Syar'i
                </label>
              </div>
              <SubmitButton pendingText="Menyimpan..."><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>

        {/* Share QR + link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Link & QR Acara</CardTitle>
          </CardHeader>
          <CardContent>
            <ShareEvent url={joinUrl} slug={event.slug} />
          </CardContent>
        </Card>
      </div>

      {/* Attendee management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peserta Acara ({attendees?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tambah member (checkbox multiple) */}
          {availableMembers.length > 0 ? (
            <AddMembersForm eventId={params.id} availableMembers={availableMembers} />
          ) : (
            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              Semua member sudah terdaftar di acara ini. Tambah member baru lewat{" "}
              <Link href="/admin/members" className="font-medium text-foreground underline">Data Member</Link>.
            </p>
          )}

          {/* Tabel peserta: search + foto zoom + checkin */}
          <AttendeeTable
            attendees={attendees}
            checkedInCount={checkedInCount}
            actions={{
              updateAttendee,
              checkinAttendee,
              uncheckAttendee,
              removeAttendee,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
