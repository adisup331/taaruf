import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST: Reset password member ke 354313 (by admin)
export async function POST(request: Request) {
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

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ ok: false, message: "userId wajib." }, { status: 400 });
  }

  // Update password via admin API
  const adminClient = createAdminClient();
  try {
    const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
      password: "354313",
    });

    if (error) {
      return NextResponse.json({ ok: false, message: `Reset gagal: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: `Password berhasil direset ke 354313` });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: `Error: ${err.message}` }, { status: 500 });
  }
}
