import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match semua route KECUALI:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - File statis (svg, png, jpg, dll)
     * - api/photo (proxy foto, handle auth sendiri)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/photo|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
