import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { HeartHandshake, Inbox, Send, Ticket, QrCodeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, photoUrl, memberStatusLabel } from "@/lib/utils";
import { MemberRealtime } from "@/components/member/MemberRealtime";
import { Watermark } from "@/components/member/ScreenshotGuard";

export default async function TaarufStatusPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ⚡ Baca role dari metadata — tidak perlu query DB
  const role = user.user_metadata?.role as string | undefined;
  if (role === "ADMIN") redirect("/admin/dashboard");
  if (role === "PHOTOGRAPHER") redirect("/admin/events/photography");

  const uid = user.id;

  const { data: myProfile } = await supabase
    .from("Profile")
    .select("namaLengkap")
    .eq("userId", uid)
    .maybeSingle();

  const viewerName = myProfile?.namaLengkap || user.email || "";

  // Event aktif yang member sudah terverifikasi (pola sama seperti dashboard)
  const { data: myAttendances } = await supabase
    .from("EventAttendee")
    .select("eventId, isVerified, participantNumber, Event(id, title, isActive, isPhotoBlurred, date)")
    .eq("userId", uid)
    .eq("isVerified", true);

  const verifiedActive = (myAttendances || [])
    .map((a: any) => ({ ...a, event: Array.isArray(a.Event) ? a.Event[0] : a.Event }))
    .filter((a: any) => a.event?.isActive)
    .sort((a: any, b: any) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

  const current = verifiedActive[0];

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 space-y-4">
        <div className="bg-emerald-100 p-6 rounded-full">
          <QrCodeIcon className="h-16 w-16 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Belum Tergabung di Event</h2>
          <p className="text-gray-600 mt-2 max-w-xs">
            Gabung event lewat QR Code panitia untuk mulai taaruf.
          </p>
        </div>
      </div>
    );
  }

  const activeEvent = current.event;

  // Semua permintaan yang melibatkan member di event ini + profil kedua pihak
  const { data: rawRequests } = await supabase
    .from("TaarufRequest")
    .select(`
      id, status, tableNumber, senderId, receiverId,
      sender:User!TaarufRequest_senderId_fkey ( Profile ( namaLengkap, tanggalLahir, asalDaerah, asalKelompok, asalDesa, fotoProfil ) ),
      receiver:User!TaarufRequest_receiverId_fkey ( Profile ( namaLengkap, tanggalLahir, asalDaerah, asalKelompok, asalDesa, fotoProfil ) )
    `)
    .eq("eventId", activeEvent.id)
    .or(`senderId.eq.${uid},receiverId.eq.${uid}`)
    .order("id", { ascending: false });

  // Member hanya boleh lihat PENDING/APPROVED. Status internal disembunyikan.
  const VISIBLE = new Set(["PENDING", "APPROVED", "DISERAHKAN_PENGURUS"]);

  const items = (rawRequests || [])
    .filter((r: any) => VISIBLE.has(r.status))
    .map((r: any) => {
      const senderUser = Array.isArray(r.sender) ? r.sender[0] : r.sender;
      const receiverUser = Array.isArray(r.receiver) ? r.receiver[0] : r.receiver;
      const senderProfile = Array.isArray(senderUser?.Profile) ? senderUser.Profile[0] : senderUser?.Profile;
      const receiverProfile = Array.isArray(receiverUser?.Profile) ? receiverUser.Profile[0] : receiverUser?.Profile;

      const iAmSender = r.senderId === uid;
      const lawan = iAmSender ? receiverProfile : senderProfile;

      return {
        id: r.id,
        status: r.status,
        tableNumber: r.tableNumber,
        iAmSender,
        lawan,
      };
    });

  const sent = items.filter((i) => i.iAmSender);
  const incoming = items.filter((i) => !i.iAmSender);

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <MemberRealtime userId={uid} eventId={activeEvent.id} />
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HeartHandshake className="h-6 w-6 text-emerald-600" /> Taaruf Saya
        </h1>
        <p className="text-sm text-gray-500">
          {activeEvent.title} · No. Peserta {current.participantNumber}
        </p>
      </div>

      <Section
        title="Permintaan Saya"
        icon={<Send className="h-4 w-4" />}
        items={sent}
        isBlur={activeEvent.isPhotoBlurred}
        viewerName={viewerName}
        emptyText="Belum ada permintaan yang kamu kirim. Pilih lawan jenis di halaman Jelajah."
      />

      <Section
        title="Permintaan Masuk"
        icon={<Inbox className="h-4 w-4" />}
        items={incoming}
        isBlur={activeEvent.isPhotoBlurred}
        viewerName={viewerName}
        emptyText="Belum ada yang mengajukan taaruf ke kamu."
      />
    </div>
  );
}

function Section({
  title,
  icon,
  items,
  isBlur,
  viewerName,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: any[];
  isBlur: boolean;
  viewerName: string;
  emptyText: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-3">
        {icon} {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <TaarufItem key={it.id} item={it} isBlur={isBlur} viewerName={viewerName} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaarufItem({ item, isBlur, viewerName }: { item: any; isBlur: boolean; viewerName: string }) {
  const lawan = item.lawan;
  const age = lawan?.tanggalLahir
    ? new Date().getFullYear() - new Date(lawan.tanggalLahir).getFullYear()
    : null;
  const label = memberStatusLabel(item.status);
  const atTable = item.status === "APPROVED" && item.tableNumber;

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm active:scale-[0.98] transition-transform">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1.25rem] bg-gray-50 border border-gray-50 screenshot-guard">
        <Image
          src={photoUrl(lawan?.fotoProfil) || photoUrl(lawan?.fotoEvent) || "/placeholder-user.jpg"}
          alt={lawan?.namaLengkap || "Foto"}
          fill
          unoptimized
          className={cn("object-cover", isBlur ? "blur-xl grayscale scale-110" : "")}
        />
        <Watermark text={viewerName} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-black text-gray-900">
          {lawan?.namaLengkap || "Peserta"}{age ? `, ${age}` : ""}
        </p>
        <p className="truncate text-xs font-bold text-emerald-600 tracking-wide uppercase">
          {lawan?.asalDaerah}
        </p>

        {atTable ? (
          <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white shadow-md shadow-emerald-100">
            <Ticket className="h-4 w-4" />
            <span className="text-sm font-black italic">Meja {item.tableNumber}</span>
          </div>
        ) : (
          label && (
            <Badge variant="secondary" className="mt-2 rounded-full px-3 py-1 bg-gray-100 text-gray-500 border-none font-bold text-[10px] uppercase tracking-tighter">{label}</Badge>
          )
        )}
      </div>
    </div>
  );
}
