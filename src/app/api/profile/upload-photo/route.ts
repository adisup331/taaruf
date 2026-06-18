import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Helper: extract storage path from publicUrl
function extractStoragePath(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/pnkb\/(.+?)(\?|$)/);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const file = formData.get("photo") as File;

  if (!file || file.size === 0) {
    return NextResponse.json({ ok: false, message: "File tidak valid." }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Get current fotoProfil to delete later
  const { data: profile } = await adminClient
    .from("Profile")
    .select("fotoProfil")
    .eq("userId", user.id)
    .single();

  const oldPhotoPath = extractStoragePath(profile?.fotoProfil);

  // Nama file unik per user
  const fileExt = file.name.split(".").pop();
  const fileName = `member-${user.id}-${Date.now()}.${fileExt}`;
  const path = `profiles/${fileName}`;

  // Upload new
  const { error: uploadError } = await adminClient.storage
    .from("pnkb")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ ok: false, message: `Upload gagal: ${uploadError.message}` }, { status: 500 });
  }

  // Delete old photo if exists (cleanup storage)
  if (oldPhotoPath) {
    await adminClient.storage.from("pnkb").remove([oldPhotoPath]);
  }

  const { data: pub } = adminClient.storage.from("pnkb").getPublicUrl(path);
  const versionedUrl = `${pub.publicUrl}?v=${Date.now()}`;

  // Update HANYA fotoProfil
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
