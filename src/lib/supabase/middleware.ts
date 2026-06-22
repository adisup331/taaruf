import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          const opts = { ...options, maxAge: 365 * 24 * 60 * 60 }
          request.cookies.set({ name, value, ...opts })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...opts })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // Public routes → hanya refresh session token, tidak perlu proteksi
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/bio/') ||
    pathname.startsWith('/b/')

  // getUser() WAJIB dipanggil untuk refresh token — tapi hanya sekali
  const { data: { user } } = await supabase.auth.getUser()

  if (isPublicRoute) return response

  const isAdminPath = pathname.startsWith('/admin')
  const isDashboardPath = pathname.startsWith('/dashboard')
  const isTaarufPath = pathname.startsWith('/taaruf')
  const isProfilPath = pathname.startsWith('/profil')
  const isPhotoPath = pathname.startsWith('/admin/events/photography')
  const isPerantaraPath = pathname.startsWith('/admin/perantara')
  const isMemberArea = pathname.startsWith('/e/') || pathname.startsWith('/register-profile')

  if (!user) {
    if (isAdminPath || isDashboardPath || isTaarufPath || isProfilPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return response
  }

  // ⚡ OPTIMASI: baca role dari user_metadata (tidak perlu query DB)
  // Role disimpan ke metadata saat login di handleLogin (login/page.tsx)
  const roleFromMeta = user.user_metadata?.role as string | undefined

  // Jika metadata tidak punya role (akun lama / Google login),
  // fallback ke DB query HANYA saat masuk admin atau member area
  const needsRoleCheck = isAdminPath || isDashboardPath || isMemberArea

  let role = roleFromMeta

  if (!role && needsRoleCheck) {
    // Query DB hanya jika metadata kosong
    const { data: dbUser } = await supabase
      .from('User')
      .select('role')
      .eq('email', user.email)
      .single()
    role = dbUser?.role
  }

  if (!role && !needsRoleCheck) return response

  const isStaff = role === 'ADMIN' || role === 'PHOTOGRAPHER' || role === 'PERANTARA'

  if (isAdminPath) {
    if (role === 'PHOTOGRAPHER' && !isPhotoPath) {
      return NextResponse.redirect(new URL('/admin/events/photography', request.url))
    }
    if (role === 'PERANTARA' && !isPerantaraPath) {
      return NextResponse.redirect(new URL('/admin/perantara', request.url))
    }
    if (role !== 'ADMIN' && role !== 'PHOTOGRAPHER' && role !== 'PERANTARA') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (isStaff && (isDashboardPath || isMemberArea)) {
    const target = role === 'PHOTOGRAPHER' ? '/admin/events/photography' : role === 'PERANTARA' ? '/admin/perantara' : '/admin/dashboard'
    return NextResponse.redirect(new URL(target, request.url))
  }

  return response
}
