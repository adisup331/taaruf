import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const matchId = searchParams.get("matchId")
  const pin = searchParams.get("pin")
  const rawPath = searchParams.get("path")

  if (!matchId || !pin || !rawPath) {
    return new NextResponse("Missing params", { status: 400 })
  }

  const supabase = createAdminClient()

  // Validate that this matchId exists and the pin matches
  const { data: match } = await supabase
    .from("TaarufRequest")
    .select("id, bioPin")
    .eq("id", matchId)
    .single()

  if (!match || match.bioPin !== pin) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  let path = rawPath.split("?")[0]

  // Download from storage
  let { data, error } = await supabase.storage.from("pnkb").download(path)

  // Fallback: .jpg -> .heic
  if ((error || !data) && /\.jpg$/i.test(path)) {
    const heicPath = path.replace(/\.jpg$/i, ".heic")
    const result = await supabase.storage.from("pnkb").download(heicPath)
    data = result.data
    error = result.error
    if (data) path = heicPath
  }

  // Fallback: .jpg -> .heif
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
