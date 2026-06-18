import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Helper: extract storage path from publicUrl
function extractStoragePath(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/pnkb\/(.+?)(\?|$)/);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return new NextResponse("Unauthorized", { status: 401 })

    const formData = await request.formData()
    const file = formData.get("photo") as File
    const eventId = formData.get("eventId") as string
    const profileId = formData.get("profileId") as string

    if (!file || !profileId) {
      return new NextResponse("Missing data", { status: 400 })
    }

    const adminClient = createAdminClient()

    // Get current fotoEvent URL + nama for file naming
    const { data: profile } = await adminClient
      .from("Profile")
      .select("namaLengkap, fotoEvent")
      .eq("id", profileId)
      .single()

    const oldPhotoPath = extractStoragePath(profile?.fotoEvent)

    const safeName = profile?.namaLengkap
      ? profile.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, "-")
      : profileId

    const path = `profiles/${safeName}.jpg`

    // Upload new (timpa file lama jika nama sama)
    const { error: uploadError } = await adminClient.storage
      .from("pnkb")
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      return NextResponse.json(
        { ok: false, message: `Storage: ${uploadError.message}` },
        { status: 400 }
      )
    }

    // Delete old photo if path different from new (cleanup storage)
    if (oldPhotoPath && oldPhotoPath !== path) {
      await adminClient.storage.from("pnkb").remove([oldPhotoPath])
    }

    const { data: pub } = adminClient.storage.from("pnkb").getPublicUrl(path)
    const versionedUrl = `${pub.publicUrl}?v=${Date.now()}`

    const { data: updated, error: updateError } = await adminClient
      .from("Profile")
      .update({ fotoEvent: versionedUrl })
      .eq("id", profileId)
      .select("id")

    if (updateError) {
      return NextResponse.json(
        { ok: false, message: `DB update: ${updateError.message}` },
        { status: 400 }
      )
    }

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Profil tidak ter-update (id salah)." },
        { status: 400 }
      )
    }

    revalidatePath("/admin", "layout")
    revalidatePath("/dashboard", "layout")

    return NextResponse.json({ ok: true, url: versionedUrl })
  } catch (err) {
    console.error("Upload error:", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
