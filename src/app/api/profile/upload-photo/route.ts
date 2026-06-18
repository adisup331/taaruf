import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const file = formData.get("photo") as File;

  if (!file || file.size === 0) {
    return NextResponse.json({ ok: false, message: "File tidak valid." }, { status: 400 });
  }

  // Nama file unik per user
  const fileExt = file.name.split(".").pop();
  const fileName = `member-${user.id}-${Date.now()}.${fileExt}`;
  const path = `profiles/${fileName}`;

  // Use admin client for storage upload (bypass RLS)
  const adminClient = createAdminClient();
  const { error: uploadError } = await adminClient.storage
    .from("pnkb")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ ok: false, message: `Upload gagal: ${uploadError.message}` }, { status: 500 });
  }

  const { data: pub } = adminClient.storage.from("pnkb").getPublicUrl(path);
  const versionedUrl = `${pub.publicUrl}?v=${Date.now()}`;

  // Update HANYA fotoProfil, bukan fotoEvent
  const { error: dbError } = await adminClient
    .from("Profile")
    .update({ fotoProfil: versionedUrl })
    .eq("userId", user.id);

  if (dbError) {
    return NextResponse.json({ ok: false, message: `DB error: ${dbError.message}` }, { status: 500 });
  }

  revalidatePath("/profil");
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true, url: versionedUrl });
}
