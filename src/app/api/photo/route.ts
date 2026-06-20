import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rawPath = searchParams.get("path")
  if (!rawPath) return new NextResponse("Missing path", { status: 400 })

  let path = rawPath.split("?")[0]

  // Coba download path yang diminta (.jpg hasil rewrite dari HEIC)
  let { data, error } = await supabase.storage.from("pnkb").download(path)

  // Jika 404 dan path berakhiran .jpg, coba .heic (fallback untuk foto lama)
  if ((error || !data) && /\.jpg$/i.test(path)) {
    const heicPath = path.replace(/\.jpg$/i, ".heic")
    const result = await supabase.storage.from("pnkb").download(heicPath)
    data = result.data
    error = result.error
    if (data) path = heicPath
  }

  // Jika masih 404, coba .heif
  if ((error || !data) && /\.jpg$/i.test(path)) {
    const heifPath = path.replace(/\.jpg$/i, ".heif")
    const result = await supabase.storage.from("pnkb").download(heifPath)
    data = result.data
    error = result.error
    if (data) path = heifPath
  }

  if (error || !data) {
    return new NextResponse("Not found", { status: 404 })
  }

  const buffer = Buffer.from(await data.arrayBuffer())
  // Paksa content type JPEG untuk HEIC/HEIF agar browser render
  const contentType = /\.(heic|heif)$/i.test(path) ? "image/jpeg" : (data.type || "image/jpeg")

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=86400, stale-while-revalidate=3600",
      "ETag": `"${Buffer.from(path).toString("base64")}"`,
    },
  })
}
