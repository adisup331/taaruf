import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CheckCircle2, Calendar, MapPin, Clock, Ticket, UserPlus, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { type ActionResult } from "@/lib/action-result";
import { nextParticipantNumber } from "@/lib/participant";
import { EventJoinClient } from "./event-join-client";

export default async function EventJoinPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from("Event")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Event tidak ditemukan</h1>
          <p className="mt-2 text-gray-500">Pastikan QR Code / link yang kamu scan benar.</p>
        </div>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/e/${params.slug}`);

  let { data: dbUser } = await supabase
    .from("User")
    .select("id, role")
    .eq("email", user!.email)
    .maybeSingle();

  if (!dbUser) {
    const { data: created } = await supabase
      .from("User")
      .insert({
        id: user!.id,
        email: user!.email,
        name: user!.user_metadata?.name || user!.user_metadata?.full_name || "",
        role: "MEMBER",
      })
      .select("id, role")
      .single();
    dbUser = created;
  }

  if (dbUser?.role === "ADMIN" || dbUser?.role === "PHOTOGRAPHER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">Akun Staff</h1>
          <p className="mt-2 text-gray-500">Akun admin/staff tidak bisa check-in sebagai peserta.</p>
          <Button asChild className="mt-4"><Link href="/admin/dashboard">Ke Dashboard Admin</Link></Button>
        </div>
      </div>
    );
  }

  if (!event.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">{event.title}</h1>
          <p className="mt-2 text-gray-500">Acara ini sudah ditutup / belum aktif.</p>
        </div>
      </div>
    );
  }

  const { data: myAttendee } = await supabase
    .from("EventAttendee")
    .select("id, isVerified, participantNumber")
    .eq("eventId", event.id)
    .eq("userId", dbUser!.id)
    .maybeSingle();

  const alreadyIn = myAttendee?.isVerified === true;

  // Check if user already has a complete profile
  const { data: myProfile } = await supabase
    .from("Profile")
    .select("id, namaLengkap, fotoProfil, jenisKelamin, tanggalLahir, asalDaerah")
    .eq("userId", dbUser!.id)
    .maybeSingle();

  // Master data for cascading selects
  const [{ data: daerahList }, { data: desaList }, { data: kelompokList }] = await Promise.all([
    supabase.from("Daerah").select("id, nama").order("nama"),
    supabase.from("Desa").select("id, nama, daerahId").order("nama"),
    supabase.from("Kelompok").select("id, nama, desaId").order("nama"),
  ]);

  const hasCompleteProfile = myProfile
    && myProfile.namaLengkap && myProfile.namaLengkap !== "-"
    && myProfile.asalDaerah && myProfile.asalDaerah !== "-"
    && myProfile.tanggalLahir;

  // --- Server Action: klaim nomor peserta ---
  async function claimNumber(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Sesi habis. Silakan login lagi." };

    const { data: me } = await supabase.from("User").select("id").eq("email", user.email).single();
    if (!me) return { ok: false, message: "Akun tidak ditemukan." };

    const number = (formData.get("participantNumber") as string)?.trim();
    if (!number) return { ok: false, message: "Masukkan nomor peserta kamu." };

    const { data: slot } = await supabase
      .from("EventAttendee")
      .select("id, userId, isVerified")
      .eq("eventId", event.id)
      .eq("participantNumber", number)
      .maybeSingle();

    if (!slot) return { ok: false, message: `Nomor peserta "${number}" tidak terdaftar di acara ini.` };

    if (slot.userId === me.id) {
      await supabase.from("EventAttendee").update({ isVerified: true }).eq("id", slot.id);
      revalidatePath(`/e/${params.slug}`);
      return { ok: true, message: "Berhasil masuk event!" };
    }

    const { data: slotUser } = await supabase.from("User").select("email").eq("id", slot.userId).single();
    const isOfflinePlaceholder = slotUser?.email?.endsWith("@offline.local");
    if (!isOfflinePlaceholder) return { ok: false, message: "Nomor peserta ini sudah diklaim oleh akun lain." };

    const { data: existingMine } = await supabase
      .from("EventAttendee").select("id").eq("eventId", event.id).eq("userId", me.id).maybeSingle();
    if (existingMine) await supabase.from("EventAttendee").delete().eq("id", existingMine.id);

    const { data: slotProfile } = await supabase.from("Profile").select("id").eq("userId", slot.userId).maybeSingle();
    if (slotProfile) {
      await supabase.from("Profile").delete().eq("userId", me.id);
      await supabase.from("Profile").update({ userId: me.id }).eq("id", slotProfile.id);
    }

    const { error: bindErr } = await supabase.from("EventAttendee").update({ userId: me.id, isVerified: true }).eq("id", slot.id);
    if (bindErr) return { ok: false, message: `Gagal klaim: ${bindErr.message}` };

    revalidatePath(`/e/${params.slug}`);
    return { ok: true, message: "Berhasil masuk event!" };
  }

  // --- Server Action: register baru tanpa nomor (isi biodata -> auto-assign nomor) ---
  async function registerNew(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
    "use server";
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "Sesi habis." };

    const { data: me } = await supabase.from("User").select("id").eq("email", user.email).single();
    if (!me) return { ok: false, message: "Akun tidak ditemukan." };

    const g = (k: string) => (formData.get(k) as string)?.trim() || undefined;
    const gInt = (k: string) => { const v = formData.get(k) as string; return v ? parseInt(v) : undefined; };

    const namaLengkap = g("namaLengkap");
    const jenisKelamin = formData.get("jenisKelamin") as string;
    const tanggalLahirRaw = formData.get("tanggalLahir") as string;
    const fotoProfil = g("fotoProfilUrl");

    if (!namaLengkap || !jenisKelamin || !tanggalLahirRaw) {
      return { ok: false, message: "Nama, jenis kelamin, dan tanggal lahir wajib diisi." };
    }
    if (!fotoProfil) {
      return { ok: false, message: "Foto profil wajib diupload." };
    }

    const payload: Record<string, any> = {
      namaLengkap,
      jenisKelamin,
      tanggalLahir: new Date(tanggalLahirRaw).toISOString(),
      asalDaerah: g("asalDaerah") || "-",
      asalKelompok: g("asalKelompok") || "-",
      asalDesa: g("asalDesa") || "-",
      nomorHp: g("nomorHp") || "-",
      instagram: g("instagram") || "-",
      fotoProfil,
      statusMubaligh: g("statusMubaligh"),
      pendidikanTerakhir: g("pendidikanTerakhir"),
      statusPernikahan: g("statusPernikahan") || "Lajang",
      pekerjaan: g("pekerjaan"),
      anakKe: gInt("anakKe"),
      jumlahSaudara: gInt("jumlahSaudara"),
      dapukanKelompok: g("dapukanKelompok"),
      dapukanDesa: g("dapukanDesa"),
      dapukanDaerah: g("dapukanDaerah"),
      kondisiIbu: g("kondisiIbu"),
      kondisiAyah: g("kondisiAyah"),
      statusJamaahIbu: g("statusJamaahIbu"),
      statusJamaahAyah: g("statusJamaahAyah"),
      daerahSambung: g("daerahSambung"),
      desaSambung: g("desaSambung"),
      kelompokSambung: g("kelompokSambung"),
    };

    const { data: existing } = await supabase.from("Profile").select("id").eq("userId", me.id).maybeSingle();
    if (existing) {
      await supabase.from("Profile").update(payload).eq("userId", me.id);
    } else {
      await supabase.from("Profile").insert({ userId: me.id, ...payload, instagram: "-" });
    }

    // Create EventAttendee with auto-assigned number
    const { data: alreadyAttendee } = await supabase
      .from("EventAttendee").select("id, participantNumber, isVerified")
      .eq("eventId", event.id).eq("userId", me.id).maybeSingle();

    if (alreadyAttendee) {
      if (!alreadyAttendee.participantNumber) {
        const num = await nextParticipantNumber(supabase, event.id);
        await supabase.from("EventAttendee").update({ participantNumber: num, isVerified: true }).eq("id", alreadyAttendee.id);
      } else {
        await supabase.from("EventAttendee").update({ isVerified: true }).eq("id", alreadyAttendee.id);
      }
    } else {
      const num = await nextParticipantNumber(supabase, event.id);
      await supabase.from("EventAttendee").insert({
        eventId: event.id, userId: me.id, participantNumber: num, isVerified: true, isCheckedIn: false,
      });
    }

    revalidatePath(`/e/${params.slug}`);
    return { ok: true, message: "Berhasil terdaftar!" };
  }

  // === RENDER ===

  if (alreadyIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 p-6">
        <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-100 p-4">
              <CheckCircle2 className="h-14 w-14 text-emerald-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kamu Sudah Terdaftar!</h1>
            <p className="mt-1 text-gray-500">Akses taaruf sudah terbuka.</p>
          </div>
          {myAttendee?.participantNumber && (
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-700">
                <Ticket className="h-4 w-4" /> Nomor Peserta Kamu
              </div>
              <p className="mt-1 text-5xl font-black text-emerald-700">{myAttendee.participantNumber}</p>
            </div>
          )}
          <EventMeta event={event} />
          <Button asChild className="h-12 w-full rounded-xl bg-emerald-600 font-bold hover:bg-emerald-700">
            <Link href="/dashboard">Lihat Peserta Lawan Jenis</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <EventJoinClient
      event={event}
      hasCompleteProfile={!!hasCompleteProfile}
      claimNumber={claimNumber}
      registerNew={registerNew}
      daerahList={daerahList || []}
      desaList={desaList || []}
      kelompokList={kelompokList || []}
    />
  );
}

function EventMeta({ event }: { event: any }) {
  return (
    <div className="space-y-2 rounded-2xl bg-gray-50 p-4 text-left">
      <div className="flex items-center text-sm text-gray-600">
        <Calendar className="mr-2 h-4 w-4" />
        {new Date(event.date).toLocaleDateString("id-ID", { dateStyle: "full" })}
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <Clock className="mr-2 h-4 w-4" />
        {new Date(event.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <MapPin className="mr-2 h-4 w-4" />
        {event.location}
      </div>
    </div>
  );
}