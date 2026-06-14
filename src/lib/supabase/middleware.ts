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
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard')
  const isPhotoPath = request.nextUrl.pathname.startsWith('/admin/events/photography')
  // Area khusus member (selain dashboard) yang staff tidak boleh akses
  const isMemberArea =
    request.nextUrl.pathname.startsWith('/e/') ||
    request.nextUrl.pathname.startsWith('/register-profile')

  if (user) {
    // Sync with Supabase DB instead of Prisma
    const { data: dbUser } = await supabase
      .from('User')
      .select('role')
      .eq('email', user.email)
      .single()

    const isStaff = dbUser?.role === 'ADMIN' || dbUser?.role === 'PHOTOGRAPHER'

    if (isAdminPath) {
      if (dbUser?.role === 'PHOTOGRAPHER') {
        if (!isPhotoPath) {
          return NextResponse.redirect(new URL('/admin/events/photography', request.url))
        }
      } else if (dbUser?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Staff (admin/fotografer) tidak boleh masuk area member
    if (isStaff && (isDashboardPath || isMemberArea)) {
      const target = dbUser?.role === 'PHOTOGRAPHER' ? '/admin/events/photography' : '/admin/dashboard'
      return NextResponse.redirect(new URL(target, request.url))
    }
  } else if (isAdminPath || isDashboardPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
