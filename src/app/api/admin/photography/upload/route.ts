import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

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

    // Ambil nama lengkap untuk penamaan file
    const { data: profile } = await supabase
      .from("Profile")
      .select("namaLengkap")
      .eq("id", profileId)
      .single()

    const safeName = profile?.namaLengkap
      ? profile.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, "-")
      : profileId

    const path = `profiles/${safeName}.jpg`

    // Upload (timpa file lama)
    const { error: uploadError } = await supabase.storage
      .from("pnkb")
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      return NextResponse.json(
        { ok: false, message: `Storage: ${uploadError.message}` },
        { status: 400 }
      )
    }

    const { data: pub } = supabase.storage.from("pnkb").getPublicUrl(path)

    // PENTING: tambahkan cache-buster agar URL berubah tiap upload,
    // sehingga React re-render & browser ambil foto terbaru.
    const versionedUrl = `${pub.publicUrl}?v=${Date.now()}`

    const { data: updated, error: updateError } = await supabase
      .from("Profile")
      .update({ fotoEvent: versionedUrl }) // Update kolom fotoEvent khusus studio
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
        { ok: false, message: "Profil tidak ter-update (RLS / id salah). Cek policy tabel Profile." },
        { status: 400 }
      )
    }

    // Revalidate semua halaman admin yang menampilkan foto
    revalidatePath("/admin", "layout")
    revalidatePath("/dashboard", "layout")

    return NextResponse.json({ ok: true, url: versionedUrl })
  } catch (err) {
    console.error("Upload error:", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
