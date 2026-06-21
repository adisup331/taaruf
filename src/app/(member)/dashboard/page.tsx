import { createClient } from "@/lib/supabase/server";
import { QrCodeIcon, Calendar, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import { nextParticipantNumber } from "@/lib/participant";
import { revalidatePath } from "next/cache";
import { ProfileCard } from "@/components/member/ProfileCard";
import { LogoutButton } from "@/components/member/LogoutButton";
import { MemberRealtime } from "@/components/member/MemberRealtime";
import { redirect } from "next/navigation";

export default async function MemberDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // ⚡ Baca role dari metadata — tidak perlu query DB
  const role = user.user_metadata?.role as string | undefined;
  if (role === 'ADMIN') redirect('/admin/dashboard');
  if (role === 'PHOTOGRAPHER') redirect('/admin/events/photography');

  const uid = user.id;

  // 2 query paralel: attendance + profile sendiri
  const [{ data: myAttendances }, { data: userProfile }] = await Promise.all([
    supabase
      .from('EventAttendee')
      .select('eventId, isVerified, participantNumber, Event(id, title, isActive, isPhotoBlurred, date)')
      .eq('userId', uid)
      .eq('isVerified', true),
    supabase
      .from('Profile')
      .select('namaLengkap, jenisKelamin')
      .eq('userId', uid)
      .maybeSingle()
  ]);

  if (!userProfile) redirect('/register-profile');

  // All attendances including unverified
  const { data: allMyAttendances } = await supabase
    .from('EventAttendee')
    .select('eventId, isVerified, participantNumber, Event(id, title, isActive, date, location, slug)')
    .eq('userId', uid);

  // All active events
  const { data: activeEvents } = await supabase
    .from('Event')
    .select('id, title, date, location, slug, isActive')
    .eq('isActive', true)
    .order('date', { ascending: true });

  const verifiedActive = (myAttendances || [])
    .map((a: any) => ({
      ...a,
      event: Array.isArray(a.Event) ? a.Event[0] : a.Event,
    }))
    .filter((a: any) => a.event?.isActive)
    .sort((a: any, b: any) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

  const current = verifiedActive[0];

  if (!current) {
    // Show list of events user is registered to + active events they can join
    const myEventIds = new Set((allMyAttendances || []).map((a: any) => {
      const ev = Array.isArray(a.Event) ? a.Event[0] : a.Event;
      return ev?.id;
    }).filter(Boolean));

    const myEvents = (allMyAttendances || []).map((a: any) => ({
      ...a,
      event: Array.isArray(a.Event) ? a.Event[0] : a.Event,
    })).filter((a: any) => a.event?.isActive);

    const otherEvents = (activeEvents || []).filter((e: any) => !myEventIds.has(e.id));

    return (
      <div className="p-4 max-w-md mx-auto pb-24 space-y-6 relative">
        <div className="absolute top-4 right-4">
          <LogoutButton className="text-gray-500 hover:text-red-500 hover:bg-red-50" />
        </div>
        <div className="text-center pt-8">
          <div className="bg-emerald-100 p-4 rounded-full inline-block mb-3">
            <Calendar className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Event Saya</h2>
          <p className="text-sm text-gray-500 mt-1">Pilih event yang ingin kamu ikuti</p>
        </div>

        {myEvents.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Event Terdaftar</p>
            {myEvents.map((a: any) => (
              <Link
                key={a.eventId}
                href={a.isVerified ? "/dashboard" : `/e/${a.event.slug}`}
                className={`block p-4 rounded-2xl border-2 transition-all ${
                  a.isVerified
                    ? "border-emerald-200 bg-emerald-50 hover:shadow-md"
                    : "border-amber-200 bg-amber-50 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{a.event.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(a.event.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    {a.participantNumber ? (
                      <div className="flex items-center gap-1 text-emerald-700">
                        <Ticket className="h-4 w-4" />
                        <span className="text-lg font-black">No. {a.participantNumber}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Belum ada nomor</span>
                    )}
                    {a.isVerified ? (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">Terverifikasi</p>
                    ) : (
                      <p className="text-[10px] text-amber-600 font-bold mt-1">Tap untuk verifikasi</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {otherEvents.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Event Tersedia</p>
            {otherEvents.map((ev: any) => (
              <Link
                key={ev.id}
                href={`/e/${ev.slug}`}
                className="block p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
              >
                <p className="font-bold text-gray-900">{ev.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(ev.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {myEvents.length === 0 && otherEvents.length === 0 && (
          <div className="text-center py-12">
            <QrCodeIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada event. Scan QR Code panitia untuk bergabung.</p>
          </div>
        )}
      </div>
    );
  }

  const activeEvent = current.event;
  const oppositeGender = userProfile.jenisKelamin === 'IKHWAN' ? 'AKHWAT' : 'IKHWAN';

  // 3 query PARALEL: attendees + opposite profiles + my requests
  const [{ data: allAttendees }, { data: myRequests }] = await Promise.all([
    supabase
      .from('EventAttendee')
      .select('userId')
      .eq('eventId', activeEvent.id)
      .eq('isVerified', true),
    supabase
      .from('TaarufRequest')
      .select('receiverId, status')
      .eq('senderId', uid)
      .eq('eventId', activeEvent.id)
      .in('status', ['PENDING', 'APPROVED', 'LANJUT', 'SL', 'DISERAHKAN_PENGURUS'])
  ]);

  const attendeeUserIds = allAttendees?.map(a => a.userId) || [];
  const sentSet = new Set((myRequests || []).map((r: any) => r.receiverId));
  const hasPendingRequest = (myRequests || []).some((r: any) => r.status === "PENDING");

  let profiles: any[] = [];
  // Map userId → status lock: "taaruf" (APPROVED/LANJUT/SL) atau "pending" (PENDING dari orang lain)
  let lockStatus = new Map<string, string>();

  if (attendeeUserIds.length > 0) {
    // 2 query PARALEL: opposite profiles + ALL active requests (termasuk PENDING)
    const [{ data: oppositeProfiles }, { data: allRequests }] = await Promise.all([
      supabase
        .from('Profile')
        .select('id, userId, namaLengkap, tanggalLahir, asalDaerah, asalKelompok, asalDesa, fotoProfil, fotoEvent, statusMubaligh, pendidikanTerakhir, statusPernikahan, pekerjaan, anakKe, jumlahSaudara, dapukanKelompok, dapukanDesa, dapukanDaerah, daerahSambung, desaSambung, kelompokSambung, kondisiIbu, kondisiAyah, statusJamaahIbu, statusJamaahAyah')
        .eq('jenisKelamin', oppositeGender)
        .in('userId', attendeeUserIds),
      supabase
        .from('TaarufRequest')
        .select('senderId, receiverId, status')
        .eq('eventId', activeEvent.id)
        .in('status', ['PENDING', 'APPROVED', 'LANJUT', 'SL', 'DISERAHKAN_PENGURUS'])
    ]);

    if (oppositeProfiles && oppositeProfiles.length > 0) {
      // Tentukan status lock per user
      // Prioritas: taaruf aktif (APPROVED/LANJUT/SL) > pending dari orang lain
      allRequests?.forEach(req => {
        const isTaarufAktif = ['APPROVED', 'LANJUT', 'SL', 'DISERAHKAN_PENGURUS'].includes(req.status);
        const isPending = req.status === 'PENDING';

        for (const userId of [req.senderId, req.receiverId]) {
          // Skip diri sendiri
          if (userId === uid) continue;

          if (isTaarufAktif) {
            lockStatus.set(userId, "taaruf"); // Override apapun
          } else if (isPending && !lockStatus.has(userId)) {
            // Hanya set pending jika belum di-set oleh taaruf aktif
            // Dan hanya jika bukan request DARI saya (sudah ditangani oleh sentSet)
            if (req.senderId !== uid && req.receiverId !== uid) {
              lockStatus.set(userId, "pending");
            }
          }
        }
      });

      profiles = oppositeProfiles;
    }
  }

  return (
    <div className="p-4 flex flex-col items-center max-w-md mx-auto">
      <MemberRealtime userId={uid} eventId={activeEvent.id} />
      <div className="w-full mb-4 flex items-center justify-between">
        <div className="text-left">
          <p className="text-sm font-bold text-emerald-600">{activeEvent.title}</p>
          <p className="text-xs text-gray-500">
            No. Peserta {current.participantNumber} · {profiles.length} lawan jenis tersedia
          </p>
        </div>
        <LogoutButton className="text-gray-500 hover:text-red-500 hover:bg-red-50" />
      </div>

      <div className="w-full space-y-10 pb-24">
        {profiles.length > 0 ? (
          profiles.map(p => {
            const lock = lockStatus.get(p.userId);
            return (
              <ProfileCard
                key={p.id}
                profile={p}
                eventId={activeEvent.id}
                isEventBlurActive={activeEvent.isPhotoBlurred}
                targetUserId={p.userId}
                viewerName={userProfile.namaLengkap}
                alreadyRequested={sentSet.has(p.userId)}
                lockType={hasPendingRequest ? "has_pending" : (lock || null)}
              />
            );
          })
        ) : (
          <div className="text-center py-20 text-gray-400">
            Semua peserta lawan jenis sedang dalam proses taaruf.
          </div>
        )}
      </div>
    </div>
  );
}
