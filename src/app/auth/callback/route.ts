import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = createClient();
  const { error, data } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('Supabase Auth Error:', error?.message);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const userEmail = data.user.email!;
  const userName = data.user.user_metadata?.full_name || '';

  try {
    // 1. Sync user ke database via Supabase Client REST API
    const { data: dbUser, error: dbError } = await supabase
      .from('User')
      .select('id, role')
      .eq('email', userEmail)
      .single();

    if (dbError && dbError.code === 'PGRST116') { // Case: User not found
      const { data: newUser } = await supabase
        .from('User')
        .insert({
          id: data.user.id,
          email: userEmail,
          name: userName,
          role: 'MEMBER'
        })
        .select()
        .single();

      const reg = next !== '/dashboard' ? `/register-profile?next=${encodeURIComponent(next)}` : '/register-profile';
      return NextResponse.redirect(`${origin}${reg}`);
    }

    // PENTING: Mencegah user login via Google jika role mereka ADMIN
    if (dbUser.role === 'ADMIN' || dbUser.role === 'PHOTOGRAPHER') {
       await supabase.auth.signOut()
       return NextResponse.redirect(`${origin}/login?error=AdminAccessDeniedViaGoogle`);
    }

    // 3. Routing untuk MEMBER
    const { data: profile } = await supabase
      .from('Profile')
      .select('id')
      .eq('userId', dbUser.id)
      .single();

    if (!profile) {
      const reg = next !== '/dashboard' ? `/register-profile?next=${encodeURIComponent(next)}` : '/register-profile';
      return NextResponse.redirect(`${origin}${reg}`);
    }

    return NextResponse.redirect(`${origin}${next}`);

  } catch (err) {
    console.error('Auth Callback Error:', err);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }
}
