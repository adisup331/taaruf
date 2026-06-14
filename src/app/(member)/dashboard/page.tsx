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

  // Resolve DB user (+ guard: staff tidak boleh di sini)
  const { data: dbUser } = await supabase
    .from('User')
    .select('id, role')
    .eq('email', user.email)
    .maybeSingle();

  if (dbUser?.role === 'ADMIN') redirect('/admin/dashboard');
  if (dbUser?.role === 'PHOTOGRAPHER') redirect('/admin/events/photography');

  const uid = dbUser?.id || user.id;

  // Cari keikutsertaan member yang TERVERIFIKASI di event AKTIF
  const { data: myAttendances } = await supabase
    .from('EventAttendee')
    .select('eventId, isVerified, participantNumber, Event(id, title, isActive, isPhotoBlurred, date)')
    .eq('userId', uid)
    .eq('isVerified', true);

  const verifiedActive = (myAttendances || [])
    .map((a: any) => ({
      ...a,
      event: Array.isArray(a.Event) ? a.Event[0] : a.Event,
    }))
    .filter((a: any) => a.event?.isActive)
    .sort((a: any, b: any) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

  const current = verifiedActive[0];

  // Belum masuk event manapun → arahkan scan QR / masukkan nomor
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

  // Profil sendiri (untuk tahu gender)
  const { data: userProfile } = await supabase
    .from('Profile')
    .select('*')
    .eq('userId', uid)
    .maybeSingle();

  if (!userProfile) redirect('/register-profile');

  const oppositeGender = userProfile.jenisKelamin === 'IKHWAN' ? 'AKHWAT' : 'IKHWAN';

  // Peserta event ini yang terverifikasi
  const { data: allAttendees } = await supabase
    .from('EventAttendee')
    .select('userId')
    .eq('eventId', activeEvent.id)
    .eq('isVerified', true);

  const attendeeUserIds = allAttendees?.map(a => a.userId) || [];

  let profiles: any[] = [];

  if (attendeeUserIds.length > 0) {
    const { data: oppositeProfiles } = await supabase
      .from('Profile')
      .select('id, userId, namaLengkap, tanggalLahir, asalDaerah, asalKelompok, asalDesa, fotoProfil')
      .eq('jenisKelamin', oppositeGender)
      .in('userId', attendeeUserIds);

    if (oppositeProfiles && oppositeProfiles.length > 0) {
      const profileUserIds = oppositeProfiles.map(p => p.userId);

      const { data: activeRequests } = await supabase
        .from('TaarufRequest')
        .select('senderId, receiverId')
        .in('status', ['APPROVED', 'LANJUT', 'SL'])
        .or(`senderId.in.(${profileUserIds.join(',')}),receiverId.in.(${profileUserIds.join(',')})`);

      const lockedUserIds = new Set();
      activeRequests?.forEach(req => {
        lockedUserIds.add(req.senderId);
        lockedUserIds.add(req.receiverId);
      });

      profiles = oppositeProfiles.filter(p => !lockedUserIds.has(p.userId));
    }
  }

  // Set lawan jenis yang SUDAH kukirimi permintaan (status aktif) → tombol jadi "Sudah Diminta"
  const { data: myRequests } = await supabase
    .from('TaarufRequest')
    .select('receiverId')
    .eq('senderId', uid)
    .eq('eventId', activeEvent.id)
    .in('status', ['PENDING', 'APPROVED', 'LANJUT', 'SL']);

  const sentSet = new Set((myRequests || []).map((r: any) => r.receiverId));

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
          profiles.map(p => (
            <ProfileCard
              key={p.id}
              profile={p}
              eventId={activeEvent.id}
              isEventBlurActive={activeEvent.isPhotoBlurred}
              targetUserId={p.userId}
              alreadyRequested={sentSet.has(p.userId)}
            />
          ))
        ) : (
          <div className="text-center py-20 text-gray-400">
            Semua peserta lawan jenis sedang dalam proses taaruf.
          </div>
        )}
      </div>
    </div>
  );
}
