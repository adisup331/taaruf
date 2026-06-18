import { createClient } from "@/lib/supabase/server";
import { QrCodeIcon } from "lucide-react";
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
      .select('jenisKelamin')
      .eq('userId', uid)
      .maybeSingle()
  ]);

  if (!userProfile) redirect('/register-profile');

  const verifiedActive = (myAttendances || [])
    .map((a: any) => ({
      ...a,
      event: Array.isArray(a.Event) ? a.Event[0] : a.Event,
    }))
    .filter((a: any) => a.event?.isActive)
    .sort((a: any, b: any) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

  const current = verifiedActive[0];

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 space-y-4 relative">
        <div className="absolute top-4 right-4">
          <LogoutButton className="text-gray-500 hover:text-red-500 hover:bg-red-50" />
        </div>
        <div className="bg-emerald-100 p-6 rounded-full animate-pulse">
          <QrCodeIcon className="h-16 w-16 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Belum Tergabung di Event</h2>
          <p className="text-gray-600 mt-2 max-w-xs">
            Scan QR Code acara dari panitia, lalu masukkan Nomor Peserta kamu untuk mulai Taaruf.
          </p>
        </div>
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
      .select('receiverId')
      .eq('senderId', uid)
      .eq('eventId', activeEvent.id)
      .in('status', ['PENDING', 'APPROVED', 'LANJUT', 'SL'])
  ]);

  const attendeeUserIds = allAttendees?.map(a => a.userId) || [];
  const sentSet = new Set((myRequests || []).map((r: any) => r.receiverId));

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
        .in('status', ['PENDING', 'APPROVED', 'LANJUT', 'SL'])
    ]);

    if (oppositeProfiles && oppositeProfiles.length > 0) {
      // Tentukan status lock per user
      // Prioritas: taaruf aktif (APPROVED/LANJUT/SL) > pending dari orang lain
      allRequests?.forEach(req => {
        const isTaarufAktif = ['APPROVED', 'LANJUT', 'SL'].includes(req.status);
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
                alreadyRequested={sentSet.has(p.userId)}
                lockType={lock || null}
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
