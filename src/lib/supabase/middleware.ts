import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set di request DAN response agar token refresh tersimpan
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // PENTING: getUser() WAJIB dipanggil agar token auto-refresh
  // Jika tidak dipanggil, session expired dan user harus relogin
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Route yang TIDAK perlu proteksi → skip semua logic
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/')

  if (isPublicRoute) return response

  const isAdminPath = pathname.startsWith('/admin')
  const isDashboardPath = pathname.startsWith('/dashboard')
  const isTaarufPath = pathname.startsWith('/taaruf')
  const isProfilPath = pathname.startsWith('/profil')
  const isPhotoPath = pathname.startsWith('/admin/events/photography')
  const isMemberArea = pathname.startsWith('/e/') || pathname.startsWith('/register-profile')

  // Belum login → redirect ke login (kecuali /e/ yang handle sendiri)
  if (!user) {
    if (isAdminPath || isDashboardPath || isTaarufPath || isProfilPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return response
  }

  // User sudah login → cek role hanya untuk admin path atau member-block
  const needsRoleCheck = isAdminPath || isDashboardPath || isMemberArea
  if (!needsRoleCheck) return response

  const { data: dbUser } = await supabase
    .from('User')
    .select('role')
    .eq('email', user.email)
    .single()

  const isStaff = dbUser?.role === 'ADMIN' || dbUser?.role === 'PHOTOGRAPHER'

  if (isAdminPath) {
    if (dbUser?.role === 'PHOTOGRAPHER' && !isPhotoPath) {
      return NextResponse.redirect(new URL('/admin/events/photography', request.url))
    }
    if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'PHOTOGRAPHER') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Staff tidak boleh masuk area member
  if (isStaff && (isDashboardPath || isMemberArea)) {
    const target = dbUser?.role === 'PHOTOGRAPHER' ? '/admin/events/photography' : '/admin/dashboard'
    return NextResponse.redirect(new URL(target, request.url))
  }

  return response
}
