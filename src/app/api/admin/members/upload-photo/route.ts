import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Helper: extract storage path from publicUrl
function extractStoragePath(url: string | null): string | null {
  if (!url) return null;
  // URL format: https://xxx.supabase.co/storage/v1/object/public/pnkb/profiles/xxx.jpg?v=123
  const match = url.match(/\/pnkb\/(.+?)(\?|$)/);
  return match ? match[1] : null;
}

// POST: upload foto profil atau foto event untuk member (oleh admin)
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

  const formData = await request.formData();
  const file = formData.get("photo") as File;
  const profileId = formData.get("profileId") as string;
  const type = (formData.get("type") as string) || "fotoProfil"; // "fotoProfil" | "fotoEvent"

  if (!file || !profileId) {
    return NextResponse.json({ ok: false, message: "File dan profileId wajib." }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Get current photo URL to delete later
  const { data: profile } = await adminClient
    .from("Profile")
    .select(type)
    .eq("id", profileId)
    .single();

  const oldPhotoPath = extractStoragePath(profile?.[type]);

  // Nama file unik
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `admin-${profileId}-${type}-${Date.now()}.${fileExt}`;
  const path = `profiles/${fileName}`;

  // Upload new file
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

  // DB update
  const { error: dbError } = await adminClient
    .from("Profile")
    .update({ [type]: versionedUrl })
    .eq("id", profileId);

  if (dbError) {
    return NextResponse.json({ ok: false, message: `DB error: ${dbError.message}` }, { status: 500 });
  }

  revalidatePath("/admin/members");
  return NextResponse.json({ ok: true, url: versionedUrl });
}
