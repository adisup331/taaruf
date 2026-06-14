import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { receiverId, eventId } = await request.json();
    if (!receiverId || !eventId) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Resolve sender's DB user id
    const { data: dbUser } = await supabase
      .from("User")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!dbUser) return new NextResponse("User not found", { status: 404 });

    // Avoid duplicate pending/active request to same receiver in same event
    const { data: existing } = await supabase
      .from("TaarufRequest")
      .select("id")
      .eq("senderId", dbUser.id)
      .eq("receiverId", receiverId)
      .eq("eventId", eventId)
      .in("status", ["PENDING", "APPROVED", "LANJUT", "SL"])
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
      return new NextResponse("Insert failed", { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
