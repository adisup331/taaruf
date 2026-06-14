import { createClient } from "@/lib/supabase/server";
import { statusLabel } from "@/lib/utils";

export default async function PrintAllMatchesPage({
  searchParams,
}: {
  searchParams: { eventId?: string };
}) {
  const supabase = createClient();
  const eventId = searchParams.eventId;

  if (!eventId) {
    return <div className="p-8 text-center font-bold">Pilih event terlebih dahulu.</div>;
  }

  const { data: event } = await supabase
    .from("Event")
    .select("title, date, location")
    .eq("id", eventId)
    .single();

  const { data: requestsRaw } = await supabase
    .from("TaarufRequest")
    .select(`
      id, status, tableNumber,
      sender:User!TaarufRequest_senderId_fkey ( Profile ( namaLengkap, asalKelompok, asalDaerah ) ),
      receiver:User!TaarufRequest_receiverId_fkey ( Profile ( namaLengkap, asalKelompok, asalDaerah ) )
    `)
    .eq("eventId", eventId)
    .order("tableNumber", { ascending: true })
    .order("id", { ascending: true });

  const requests = requestsRaw?.map((req: any) => {
    const senderUser = Array.isArray(req.sender) ? req.sender[0] : req.sender;
    const receiverUser = Array.isArray(req.receiver) ? req.receiver[0] : req.receiver;

    return {
      ...req,
      senderProfile: Array.isArray(senderUser?.Profile) ? senderUser.Profile[0] : senderUser?.Profile,
      receiverProfile: Array.isArray(receiverUser?.Profile) ? receiverUser.Profile[0] : receiverUser?.Profile,
    };
  }) || [];

  return (
    <div className="mx-auto max-w-5xl bg-white p-8 text-black print:p-0">
      <div className="mb-6 border-b-2 border-black pb-4 text-center">
        <h1 className="text-2xl font-black uppercase">Daftar Pasangan Taaruf</h1>
        <p className="text-lg font-semibold">{event?.title}</p>
        <p className="text-sm text-gray-600">
          {event?.date ? new Date(event.date).toLocaleDateString("id-ID", { dateStyle: "long" }) : ""} — {event?.location}
        </p>
      </div>

      <table className="w-full border-collapse border border-gray-400 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 p-2 text-center w-16">Meja</th>
            <th className="border border-gray-400 p-2 text-left">Laki-Laki (Asal)</th>
            <th className="border border-gray-400 p-2 text-center w-12"></th>
            <th className="border border-gray-400 p-2 text-left">Perempuan (Asal)</th>
            <th className="border border-gray-400 p-2 text-center w-32">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, idx) => (
            <tr key={req.id} className="border-b border-gray-400">
              <td className="border border-gray-400 p-2 text-center font-bold text-lg">
                {req.tableNumber || "-"}
              </td>
              <td className="border border-gray-400 p-2">
                <div className="font-bold">{req.senderProfile?.namaLengkap || "-"}</div>
                <div className="text-xs text-gray-600">
                  {req.senderProfile?.asalKelompok} - {req.senderProfile?.asalDaerah}
                </div>
              </td>
              <td className="border border-gray-400 p-2 text-center font-bold text-gray-400">
                →
              </td>
              <td className="border border-gray-400 p-2">
                <div className="font-bold">{req.receiverProfile?.namaLengkap || "-"}</div>
                <div className="text-xs text-gray-600">
                  {req.receiverProfile?.asalKelompok} - {req.receiverProfile?.asalDaerah}
                </div>
              </td>
              <td className="border border-gray-400 p-2 text-center font-semibold">
                {statusLabel(req.status)}
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center italic text-gray-500">
                Belum ada data pasangan di event ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-8 text-right text-xs text-gray-500 italic">
        Dicetak pada {new Date().toLocaleString("id-ID")}
      </div>

      <script dangerouslySetInnerHTML={{ __html: "window.print()" }} />
    </div>
  );
}
