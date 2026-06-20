import { createClient } from "@/lib/supabase/server";
import { photoUrl } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function PrintMatchPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: match } = await supabase
    .from("TaarufRequest")
    .select(`
      id, tableNumber, eventId, status,
      sender:User!TaarufRequest_senderId_fkey ( id, Profile ( * ) ),
      receiver:User!TaarufRequest_receiverId_fkey ( id, Profile ( * ) )
    `)
    .eq("id", params.id)
    .single();

  if (!match) notFound();

  const senderUser = Array.isArray(match.sender) ? match.sender[0] : match.sender;
  const receiverUser = Array.isArray(match.receiver) ? match.receiver[0] : match.receiver;
  const p1 = Array.isArray(senderUser?.Profile) ? senderUser.Profile[0] : senderUser?.Profile;
  const p2 = Array.isArray(receiverUser?.Profile) ? receiverUser.Profile[0] : receiverUser?.Profile;

  const { data: attendees } = await supabase
    .from("EventAttendee")
    .select("userId, participantNumber")
    .eq("eventId", match.eventId)
    .in("userId", [senderUser.id, receiverUser.id]);

  const getNo = (uid: string) => attendees?.find(a => a.userId === uid)?.participantNumber || "-";
  const no1 = getNo(senderUser.id);
  const no2 = getNo(receiverUser.id);

  return (
    <div className="mx-auto max-w-5xl bg-white p-6 text-black print:p-0">
      {/* KOP */}
      <div className="border-b-4 border-emerald-700 pb-4 mb-6 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tight">Lembar Kerja Taaruf Offline</h1>
        <div className="mt-3 flex items-center justify-center gap-8 text-sm">
          <div><span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Meja</span><br /><span className="text-3xl font-black">{match.tableNumber ?? "-"}</span></div>
          <div className="h-10 w-px bg-gray-300" />
          <div><span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Status</span><br /><span className="text-lg font-black">{match.status}</span></div>
          <div className="h-10 w-px bg-gray-300" />
          <div><span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Kode</span><br /><span className="font-mono text-lg font-black">{match.id.slice(-6).toUpperCase()}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* ─── Biodata 1 ─── */}
        <BiodataSection label="Biodata 1" profile={p1} noPeserta={no1} gender={p1?.jenisKelamin} />
        {/* ─── Biodata 2 ─── */}
        <BiodataSection label="Biodata 2" profile={p2} noPeserta={no2} gender={p2?.jenisKelamin} />
      </div>

      {/* Keputusan */}
      <div className="mt-8 border-2 border-black rounded-xl p-5">
        <h3 className="text-center text-lg font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Hasil Keputusan Taaruf</h3>
        <div className="flex justify-around items-center">
          {["Lanjut", "Lamaran (SL)", "Tidak Lanjut"].map(label => (
            <div key={label} className="flex items-center gap-3">
              <div className="h-8 w-8 border-4 border-black rounded" />
              <span className="text-lg font-bold">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t pt-3 text-[9px] text-gray-400 font-mono flex justify-between">
        <span>ID: {match.id}</span>
        <span>Dicetak: {new Date().toLocaleString("id-ID")} &middot; TaarufYuk</span>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `window.onload=()=>setTimeout(()=>window.print(),500);` }} />
    </div>
  );
}

function BiodataSection({ label, profile: p, noPeserta, gender }: any) {
  if (!p) return <div className="rounded-xl border-2 border-dashed p-8 text-center text-gray-400 font-bold">{label}: Data tidak tersedia</div>;
  const age = p.tanggalLahir ? Math.abs(new Date().getFullYear() - new Date(p.tanggalLahir).getFullYear()) : "-";

  return (
    <div className="rounded-xl border-2 border-black p-5 relative">
      <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full border-2 border-black bg-white flex items-center justify-center font-black text-xl shadow-sm">
        {noPeserta}
      </div>
      <h2 className="text-lg font-black uppercase mb-4 border-b-2 border-black pb-1">{label} <span className="text-sm font-normal lowercase">({gender === "IKHWAN" ? "Laki-Laki" : "Perempuan"})</span></h2>

      {/* Foto + Nama */}
      <div className="flex gap-4 mb-4">
        <div className="h-28 w-24 shrink-0 border-2 border-black rounded-md overflow-hidden bg-gray-50 flex items-center justify-center shadow-sm">
          {photoUrl(p.fotoProfil) ? (
            <img src={photoUrl(p.fotoProfil)!} alt={p.namaLengkap} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[9px] text-gray-400 font-bold text-center px-1">Pas Foto</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xl font-black">{p.namaLengkap}</p>
          <p className="text-sm text-gray-500">{gender === "IKHWAN" ? "Laki-Laki" : "Perempuan"} &middot; {age} Tahun</p>
          <p className="text-sm font-bold mt-1">No. Peserta: {noPeserta}</p>
        </div>
      </div>

      <table className="w-full text-xs border-collapse">
        <tbody>
          <PrintRow label="Tanggal Lahir" value={p.tanggalLahir ? new Date(p.tanggalLahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} />
          <PrintRow label="Status Pernikahan" value={p.statusPernikahan || "Lajang"} />
          <PrintRow label="Asal Daerah" value={p.asalDaerah} />
          <PrintRow label="Asal Desa" value={p.asalDesa} />
          <PrintRow label="Asal Kelompok" value={p.asalKelompok} />
          {p.statusMubaligh && <PrintRow label="Mubaligh" value={p.statusMubaligh} />}
          {p.pendidikanTerakhir && <PrintRow label="Pendidikan" value={p.pendidikanTerakhir} />}
          {p.pekerjaan && <PrintRow label="Pekerjaan" value={p.pekerjaan} />}
          {p.anakKe && <PrintRow label="Anak Ke" value={String(p.anakKe)} />}
          {p.jumlahSaudara && <PrintRow label="Jumlah Saudara" value={String(p.jumlahSaudara)} />}
          {(p.daerahSambung || p.desaSambung || p.kelompokSambung) && (
            <PrintRow label="Sambung" value={[p.daerahSambung, p.desaSambung, p.kelompokSambung].filter(Boolean).join(" / ")} />
          )}
          {(p.dapukanDaerah || p.dapukanDesa || p.dapukanKelompok) && (
            <PrintRow label="Dapukan" value={[p.dapukanDaerah, p.dapukanDesa, p.dapukanKelompok].filter(Boolean).join(" / ")} />
          )}
          {p.kondisiIbu && <PrintRow label="Ibu" value={`${p.kondisiIbu}${p.statusJamaahIbu ? ` (${p.statusJamaahIbu})` : ""}`} />}
          {p.kondisiAyah && <PrintRow label="Bapak" value={`${p.kondisiAyah}${p.statusJamaahAyah ? ` (${p.statusJamaahAyah})` : ""}`} last />}
        </tbody>
      </table>
    </div>
  );
}

function PrintRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <tr className={last ? "" : "border-b border-black/10"}>
      <td className="py-1 pr-2 text-gray-500 font-medium w-[110px]">{label}</td>
      <td className="py-1 font-bold">{value || "-"}</td>
    </tr>
  );
}
