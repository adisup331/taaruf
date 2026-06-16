import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Proxy foto privat dengan caching agresif.
 * Auth check sekali, gambar di-cache browser 24 jam.
 */
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rawPath = searchParams.get("path")
  if (!rawPath) return new NextResponse("Missing path", { status: 400 })

  const path = rawPath.split("?")[0]

  const { data, error } = await supabase.storage.from("pnkb").download(path)

  if (error || !data) {
    return new NextResponse("Not found", { status: 404 })
  }

  const buffer = Buffer.from(await data.arrayBuffer())
  const contentType = data.type || "image/jpeg"

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // Cache 24 jam di browser + 1 jam stale-while-revalidate
      "Cache-Control": "private, max-age=86400, stale-while-revalidate=3600",
      // ETag untuk conditional requests
      "ETag": `"${Buffer.from(path).toString("base64")}"`,
    },
  })
}
