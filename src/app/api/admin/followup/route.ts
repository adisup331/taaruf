import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function POST(req: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { to, message, matchId } = body as {
    to: string;
    message: string;
    matchId?: string;
  };

  if (!to || !message) {
    return NextResponse.json({ error: "to dan message wajib diisi" }, { status: 400 });
  }

  const { data: settings } = await supabase
    .from("AppSetting")
    .select("key, value")
    .in("key", ["starsender_api_key", "starsender_device_id"]);

  const map: Record<string, string> = {};
  settings?.forEach((s: any) => {
    if (s.key && s.value) map[s.key] = s.value;
  });

  const apiKey = map["starsender_api_key"];
  const deviceId = map["starsender_device_id"];

  if (!apiKey || !deviceId) {
    return NextResponse.json({ error: "StarSender belum dikonfigurasi. Buka menu Pengaturan." }, { status: 400 });
  }

  // Generate PIN if matchId provided and no PIN yet
  let pin = "";
  if (matchId) {
    const { data: match } = await supabase
      .from("TaarufRequest")
      .select("bioPin")
      .eq("id", matchId)
      .single();

    if (match?.bioPin) {
      pin = match.bioPin;
    } else {
      pin = generatePin();
      await supabase.from("TaarufRequest").update({ bioPin: pin }).eq("id", matchId);
    }
  }

  // Replace {pin} and {link_bio} in message
  const origin = req.nextUrl.origin;
  let finalMessage = message;
  if (pin) {
    finalMessage = finalMessage.replace("{pin}", pin);
  }
  if (matchId) {
    const shortCode = matchId.slice(-6).toLowerCase();
    finalMessage = finalMessage.replace("{link_bio}", `${origin}/b/${shortCode}`);
  }

  const cleanPhone = to.replace(/[^0-9]/g, "");

  try {
    const res = await fetch("https://api.starsender.online/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": apiKey },
      body: JSON.stringify({
        messageType: "text",
        to: cleanPhone,
        body: finalMessage,
        delay: 5,
      }),
    });

    const data = await res.json();

    if (res.ok || data.success || data.status === true) {
      return NextResponse.json({ ok: true, message: "Pesan berhasil dikirim!" });
    }

    return NextResponse.json({ error: `Gagal kirim: ${data.message || JSON.stringify(data)}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: `Error: ${err.message}` }, { status: 500 });
  }
}
