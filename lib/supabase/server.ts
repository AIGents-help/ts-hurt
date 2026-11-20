import 'server-only';
import {cookies} from 'next/headers';
import {createServerClient} from '@supabase/ssr';

export const authConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: list => {
        try { list.forEach(({name, value, options}) => store.set(name, value, options)); } catch { /* called from a Server Component: middleware refreshes instead */ }
      },
    },
  });
}

export type Profile = {
  id: string; email: string; full_name: string | null; phone: string | null;
  address_line1: string | null; address_line2: string | null; city: string | null; state: string | null; postal_code: string | null; country: string;
  shirt_size: string | null; marketing_opt_in: boolean; role: 'customer' | 'admin';
};

/** Current user + profile, verified with the auth server (never trusts the cookie alone). */
export async function currentUser() {
  if (!authConfigured()) return {user: null, profile: null};
  const sb = await supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  if (!user) return {user: null, profile: null};
  const {data: profile} = await sb.from('profiles').select('*').eq('id', user.id).single<Profile>();
  return {user, profile};
}
