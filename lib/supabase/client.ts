'use client';
import {createBrowserClient} from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;
export const authEnabled = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export function supabaseBrowser() {
  return (client ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!));
}
