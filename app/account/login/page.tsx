'use client';
import {useState, type FormEvent} from 'react';
import {useSearchParams} from 'next/navigation';
import {Suspense} from 'react';
import {supabaseBrowser, authEnabled} from '../../../lib/supabase/client';

function LoginForm() {
  const params = useSearchParams();
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const next = params.get('next') || '/account';

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') || '').trim();
    setState('sending');
    const {error} = await supabaseBrowser().auth.signInWithOtp({
      email,
      options: {emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`, shouldCreateUser: true},
    });
    if (error) { setMsg(error.message); setState('error'); } else setState('sent');
  }

  if (!authEnabled()) return <p>Accounts are coming online shortly.</p>;
  if (state === 'sent') return <p className="captureDone">CHECK YOUR INBOX. TAP THE LINK ON THIS DEVICE AND YOU&apos;RE IN.</p>;
  return (
    <form className="captureForm" onSubmit={submit}>
      {params.get('error') && <small>That link expired or was already used. Get a fresh one.</small>}
      <input name="email" type="email" required autoComplete="email" placeholder="YOUR EMAIL" aria-label="Email" />
      <button className="action" disabled={state === 'sending'}>{state === 'sending' ? 'SENDING…' : 'EMAIL ME A SIGN-IN LINK'}</button>
      {state === 'error' && <small>{msg}</small>}
      <small style={{color: 'var(--muted)'}}>No passwords. New here? Same button creates your account.</small>
    </form>
  );
}

export default function Login() {
  return (
    <main className="policies">
      <p className="eyebrow">CHECKPOINT / IDENTIFY YOURSELF</p>
      <h1>SIGN IN OR <span style={{color: 'var(--red)'}}>JOIN</span></h1>
      <p>Track orders, save your address and size, and get first dibs on drops.</p>
      <Suspense><LoginForm /></Suspense>
    </main>
  );
}
