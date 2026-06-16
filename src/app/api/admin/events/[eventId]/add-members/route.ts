import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nextParticipantNumber } from "@/lib/participant";
import { revalidatePath } from "next/cache";

export async function POST(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Cek role admin
    const { data: dbUser } = await supabase
      .from("User")
      .select("role")
      .eq("email", user.email)
      .single();

    if (dbUser?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { userIds } = await request.json();
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ ok: false, message: "Pilih minimal 1 member." }, { status: 400 });
    }

    const eventId = params.eventId;
    let added = 0;
    let skipped = 0;

    for (const userId of userIds) {
      // Cek apakah sudah ada di event ini
      const { data: existing } = await supabase
        .from("EventAttendee")
        .select("id")
        .eq("eventId", eventId)
        .eq("userId", userId)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      const participantNumber = await nextParticipantNumber(supabase, eventId);

      const { error } = await supabase.from("EventAttendee").insert({
        eventId,
        userId,
        participantNumber,
        isVerified: true,
      });

      if (error) {
        console.error(`Gagal insert ${userId}:`, error.message);
        skipped++;
      } else {
        added++;
      }
    }

    revalidatePath(`/admin/events/${eventId}`);
    return NextResponse.json({
      ok: true,
      message: `${added} member berhasil ditambahkan.${skipped > 0 ? ` ${skipped} dilewati (sudah ada).` : ""}`,
    });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
