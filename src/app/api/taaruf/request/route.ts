import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, message: "Sesi habis. Silakan login lagi." }, { status: 401 });

    const { receiverId, eventId } = await request.json();
    if (!receiverId || !eventId) {
      return NextResponse.json({ ok: false, message: "Data tidak lengkap." }, { status: 400 });
    }

    // Resolve sender's DB user id
    const { data: dbUser } = await supabase
      .from("User")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!dbUser) return NextResponse.json({ ok: false, message: "Akun tidak ditemukan." }, { status: 404 });

    // Block jika sender sudah punya PENDING request ke siapapun di event ini
    const { data: pendingExists } = await supabase
      .from("TaarufRequest")
      .select("id")
      .eq("senderId", dbUser.id)
      .eq("eventId", eventId)
      .eq("status", "PENDING")
      .maybeSingle();

    if (pendingExists) {
      return NextResponse.json(
        { ok: false, message: "Kamu masih punya permintaan yang menunggu. Tunggu sampai diproses sebelum mengajukan ke orang lain." },
        { status: 400 }
      );
    }

    // Avoid duplicate pending/active request to same receiver in same event
    const { data: existing } = await supabase
      .from("TaarufRequest")
      .select("id")
      .eq("senderId", dbUser.id)
      .eq("receiverId", receiverId)
      .eq("eventId", eventId)
      .in("status", ["PENDING", "APPROVED", "LANJUT", "SL", "DISERAHKAN_PENGURUS"])
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const { error } = await supabase.from("TaarufRequest").insert({
      senderId: dbUser.id,
      receiverId,
      eventId,
      status: "PENDING",
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ ok: false, message: "Gagal menyimpan permintaan." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Terjadi kesalahan server." }, { status: 500 });
  }
}
