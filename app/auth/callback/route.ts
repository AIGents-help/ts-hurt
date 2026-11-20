import {NextResponse} from 'next/server';
import {supabaseServer} from '../../../lib/supabase/server';

// Lands here from the email sign-in link; swaps the one-time code for a session cookie.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const nextParam = url.searchParams.get('next') ?? '/account';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/account';
  if (code) {
    const sb = await supabaseServer();
    const {error} = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL('/account/login?error=link', url.origin));
}
