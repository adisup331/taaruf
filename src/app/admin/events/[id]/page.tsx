import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, UserPlus, Trash2, CheckCircle2, Camera } from "lucide-react";
import { ShareEvent } from "@/components/admin-panel/share-event";
import { DeleteEventButton } from "@/components/admin-panel/delete-event-button";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { type ActionResult } from "@/lib/action-result";
import { genderLabel, photoUrl } from "@/lib/utils";
import { nextParticipantNumber } from "@/lib/participant";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  // Pakai revalidate 0 atau force-dynamic agar data selalu fresh dari DB
  // atau cukup pastikan query tidak di-cache secara agresif.

  const { data: event } = await supabase
    .from("Event")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) notFound();

  // Attendees of this event
  const { data: attendeesRaw } = await supabase
    .from("EventAttendee")
    .select(`
      id,
      participantNumber,
      isVerified,
      userId,
      User (
        id,
        email,
        name,
        Profile (
          id,
          namaLengkap,
          jenisKelamin,
          fotoProfil
        )
      )
    `)
    .eq("eventId", params.id);

  const attendees = attendeesRaw?.map((a: any) => {
    const userData = Array.isArray(a.User) ? a.User[0] : a.User;
    const profile = Array.isArray(userData?.Profile) ? userData.Profile[0] : userData?.Profile;

    return {
      ...a,
      profile: profile || { namaLengkap: userData?.name || "Member Baru", jenisKelamin: "IKHWAN" }
    }
  }) || [];

  // Members NOT yet in this event (for manual add dropdown)
  const attendeeUserIds = (attendees || []).map((a: any) => a.userId);
  const { data: allMembers } = await supabase
    .from("Profile")
    .select("userId, namaLengkap, jenisKelamin")
    .order("namaLengkap", { ascending: true });

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

    // Auto-assign nomor peserta bila admin tidak mengisi
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
          {/* Tambah member yang sudah terdaftar di Data Member */}
          {availableMembers.length > 0 ? (
            <ActionForm action={addAttendee} resetOnSuccess className="flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Tambah Member ke Acara</label>
                <select name="userId" required className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">Pilih member...</option>
                  {availableMembers.map((m: any) => (
                    <option key={m.userId} value={m.userId}>
                      {m.namaLengkap} ({genderLabel(m.jenisKelamin)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">No. Peserta (auto)</label>
                <Input name="participantNumber" placeholder="otomatis" className="w-28" />
              </div>
              <SubmitButton pendingText="Menambah..."><UserPlus className="mr-2 h-4 w-4" /> Tambah</SubmitButton>
            </ActionForm>
          ) : (
            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              Semua member sudah terdaftar di acara ini. Tambah member baru lewat{" "}
              <Link href="/admin/members" className="font-medium text-foreground underline">Data Member</Link>.
            </p>
          )}

          {/* List */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium w-[60px]">Foto</th>
                  <th className="px-3 py-2 font-medium">Nama</th>
                  <th className="px-3 py-2 font-medium">Gender</th>
                  <th className="px-3 py-2 font-medium">No. Peserta</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {attendees?.map((a: any) => (
                  <tr key={a.id} className="border-b">
                    <td className="px-3 py-2">
                      <Avatar className="h-10 w-10 border shadow-sm">
                         {photoUrl(a.profile?.fotoProfil) ? (
                           <AvatarImage src={photoUrl(a.profile.fotoProfil)!} alt={a.profile.namaLengkap} className="object-cover" />
                         ) : (
                           <AvatarFallback className="bg-muted">
                             <Camera className="h-4 w-4 text-muted-foreground opacity-30" />
                           </AvatarFallback>
                         )}
                      </Avatar>
                    </td>
                    <td className="px-3 py-2 font-medium">{a.profile?.namaLengkap || "-"}</td>
                    <td className="px-3 py-2">
                      <Badge variant={a.profile?.jenisKelamin === "IKHWAN" ? "default" : "secondary"}>
                        {genderLabel(a.profile?.jenisKelamin)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <ActionForm action={updateAttendee.bind(null, a.id)} className="flex items-center gap-1">
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
                      {a.isVerified ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" /> Verified
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Menunggu</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <ActionForm action={removeAttendee.bind(null, a.id)}>
                        <SubmitButton size="icon" variant="ghost" className="text-destructive" pendingText="">
                          <Trash2 className="h-4 w-4" />
                        </SubmitButton>
                      </ActionForm>
                    </td>
                  </tr>
                ))}
                {(!attendees || attendees.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      Belum ada peserta. Tambah manual di atas atau tunggu member scan QR.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
