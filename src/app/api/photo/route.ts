import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Proxy foto privat. Hanya pengguna yang sudah login (punya cookie session
 * di domain ini / localhost) yang bisa mengakses. Domain lain yang hotlink
 * tanpa session → 401.
 *
 * Pemakaian: /api/photo?path=profiles/alenovan.jpg
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

  // Buang query cache-buster (?v=) bila ikut terbawa
  const path = rawPath.split("?")[0]

  const { data, error } = await supabase.storage.from("pnkb").download(path)

  if (error || !data) {
    return new NextResponse("Not found", { status: 404 })
  }

  const buffer = Buffer.from(await data.arrayBuffer())

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": data.type || "image/jpeg",
      // private: hanya boleh di-cache browser user, tidak oleh CDN/proxy publik
      "Cache-Control": "private, max-age=3600",
    },
  })
}
