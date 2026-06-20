import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export default async function PrintEventPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: event } = await supabase
    .from("Event")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) notFound();

  const appUrl = "https://taarufyuk.vercel.app";
  const liveUrl = `${appUrl}/e/${event.slug}`;

  return (
    <div className="mx-auto max-w-md bg-white p-8 text-black print:p-0 min-h-screen flex flex-col items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-black uppercase tracking-tight">{event.title}</h1>
        <p className="text-gray-500 text-sm">{event.location}</p>
        <p className="text-gray-400 text-xs">
          {new Date(event.date).toLocaleDateString("id-ID", { dateStyle: "full" })}
        </p>

        <div className="rounded-xl border-2 border-black p-6 inline-block bg-white">
          <QRCodeSVG value={liveUrl} size={450} level="H" />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Scan untuk bergabung</p>
          <p className="text-sm font-bold break-all">{liveUrl}</p>
        </div>

        <div className="border-t pt-6 text-[10px] text-gray-400 font-mono">
          <p>Dicetak: {new Date().toLocaleString("id-ID")}</p>
          <p>TaarufYuk</p>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `window.onload=()=>setTimeout(()=>window.print(),500);` }} />
    </div>
  );
}
