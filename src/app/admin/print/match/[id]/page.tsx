import { createClient } from "@/lib/supabase/server";
import { photoUrl } from "@/lib/utils";

export default async function PrintMatchPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // 1. Ambil data Match dan Profil
  const { data: match } = await supabase
    .from("TaarufRequest")
    .select(`
      id, tableNumber, eventId,
      sender:User!TaarufRequest_senderId_fkey ( id, Profile ( namaLengkap, tanggalLahir, asalDaerah, asalKelompok, asalDesa, jenisKelamin, fotoProfil ) ),
      receiver:User!TaarufRequest_receiverId_fkey ( id, Profile ( namaLengkap, tanggalLahir, asalDaerah, asalKelompok, asalDesa, jenisKelamin, fotoProfil ) )
    `)
    .eq("id", params.id)
    .single();

  if (!match) return <div className="p-8 text-center font-bold">Data tidak ditemukan</div>;

  const senderUser = Array.isArray(match.sender) ? match.sender[0] : match.sender;
  const receiverUser = Array.isArray(match.receiver) ? match.receiver[0] : match.receiver;

  const senderProfile = Array.isArray(senderUser?.Profile) ? senderUser.Profile[0] : senderUser?.Profile;
  const receiverProfile = Array.isArray(receiverUser?.Profile) ? receiverUser.Profile[0] : receiverUser?.Profile;

  // 2. Ambil Nomor Peserta dari EventAttendee
  const { data: attendees } = await supabase
    .from("EventAttendee")
    .select("userId, participantNumber")
    .eq("eventId", match.eventId)
    .in("userId", [senderUser.id, receiverUser.id]);

  const getNoPeserta = (uid: string) => attendees?.find(a => a.userId === uid)?.participantNumber || "-";

  const participants = [
    { profile: senderProfile, uid: senderUser.id },
    { profile: receiverProfile, uid: receiverUser.id }
  ];

  return (
    <div className="mx-auto max-w-4xl bg-white p-8 text-black print:p-0">
      {/* Header */}
      <div className="mb-8 border-b-4 border-black pb-4 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight">Lembar Kerja Taaruf Offline</h1>
        <div className="mt-4 flex items-center justify-center gap-10">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Nomor Meja</p>
            <p className="text-4xl font-black">{match.tableNumber ?? "-"}</p>
          </div>
          <div className="h-12 w-px bg-gray-300"></div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Kode Taaruf</p>
            <p className="font-mono text-2xl font-black">{match.id.slice(-6).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Konten Profil */}
      <div className="grid grid-cols-2 gap-8">
        {participants.map((item, idx) => {
          const p = item.profile;
          const noPeserta = getNoPeserta(item.uid);
          return (
            <div key={idx} className="relative rounded-xl border-2 border-black p-6">
              {/* Nomor Peserta Badge */}
              <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full border-2 border-black bg-white flex items-center justify-center font-black text-xl shadow-sm">
                {noPeserta}
              </div>

              <h2 className="mb-4 border-b-2 border-black pb-1 text-xl font-bold uppercase">
                {p?.jenisKelamin === "IKHWAN" ? "Profil Laki-Laki" : "Profil Perempuan"}
              </h2>

              <div className="flex gap-4">
                <div className="flex-1 space-y-2 text-sm">
                  <p><strong>Nama:</strong><br/>{p?.namaLengkap}</p>
                  <p><strong>Asal:</strong> {p?.asalDaerah}</p>
                  <p><strong>Desa:</strong> {p?.asalDesa}</p>
                  <p><strong>Kelompok:</strong> {p?.asalKelompok}</p>
                </div>

                {/* Container Foto - Dibuat Neat / Rapi */}
                <div className="h-40 w-32 shrink-0 border-2 border-black bg-gray-50 overflow-hidden rounded-md shadow-sm flex items-center justify-center">
                  {photoUrl(p?.fotoProfil) ? (
                    <img
                      src={photoUrl(p.fotoProfil)!}
                      alt={p.namaLengkap}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold uppercase text-center p-2">Pas Foto <br/> Belum Ada</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkbox Status Offline */}
      <div className="mt-8 rounded-xl border-2 border-black p-5">
        <h3 className="mb-4 text-center text-lg font-bold uppercase tracking-widest border-b-2 border-black pb-2">
          Hasil Keputusan Taaruf (Offline)
        </h3>
        <div className="flex justify-around items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 border-4 border-black rounded"></div>
            <span className="text-xl font-bold">Lanjut</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 border-4 border-black rounded"></div>
            <span className="text-xl font-bold">Lamaran (SL)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 border-4 border-black rounded"></div>
            <span className="text-xl font-bold">Tidak Lanjut</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-10 flex items-center justify-between border-t border-dashed border-gray-400 pt-4 text-[10px] font-mono text-gray-500">
        <p>ID MATCH: {match.id}</p>
        <p>DICETAK PADA: {new Date().toLocaleString("id-ID")}</p>
      </div>

      {/* Auto-print script */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 500);
        };
      ` }} />
    </div>
  );
}
