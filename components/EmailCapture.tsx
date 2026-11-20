'use client';
import {useEffect, useState, type FormEvent} from 'react';
import {track} from '@vercel/analytics';

function Form({source, onDone}: {source: string; onDone?: () => void}) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [code, setCode] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState('sending');
    const res = await fetch('/api/subscribe', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email: f.get('email'), company: f.get('company'), source})}).catch(() => null);
    if (res?.ok) {
      const j = await res.json();
      setCode(j.code); setState('done'); track('email_signup', {source});
      try { localStorage.setItem('tshurt-subscribed', '1'); } catch {}
      setTimeout(() => onDone?.(), 6000);
    } else setState('error');
  }
  if (state === 'done') return <p className="captureDone">YOU&apos;RE IN. CODE <b>{code}</b> IS ALSO IN YOUR INBOX.</p>;
  return (
    <form className="captureForm" onSubmit={submit}>
      <input name="email" type="email" required placeholder="YOUR EMAIL (WE WON'T CRY IF YOU UNSUBSCRIBE)" aria-label="Email" />
      <input name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <button className="action" disabled={state === 'sending'}>{state === 'sending' ? '…' : 'GIVE ME 10% OFF'}</button>
      {state === 'error' && <small>That email looks fake. Try a real one.</small>}
    </form>
  );
}

export function InlineCapture() {
  return <section className="capture"><div><p className="eyebrow">DEPARTMENT 04 / THE LIST</p><h2>10% OFF. <span>NO HUGS.</span></h2><p>New drops every week. First dibs, dirty jokes, zero spam.</p></div><Form source="inline" /></section>;
}

export function PopupCapture() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem('tshurt-subscribed') || sessionStorage.getItem('tshurt-popup')) return; } catch {}
    const t = setTimeout(() => setShow(true), 15000);
    const exit = (e: MouseEvent) => { if (e.clientY < 5) setShow(true); };
    document.addEventListener('mouseout', exit);
    return () => { clearTimeout(t); document.removeEventListener('mouseout', exit); };
  }, []);
  const close = () => { setShow(false); try { sessionStorage.setItem('tshurt-popup', '1'); } catch {} };
  if (!show) return null;
  return (
    <div className="shade" onMouseDown={close}>
      <section className="popup" onMouseDown={e => e.stopPropagation()}>
        <button className="close" onClick={close} aria-label="Close">✕</button>
        <p className="eyebrow">● INTERCEPTED TRANSMISSION</p>
        <h2>LEAVING ALREADY?<br /><span>TAKE 10% WITH YOU.</span></h2>
        <p>Join the list. Get first dibs on drops that make HR nervous.</p>
        <Form source="popup" onDone={close} />
      </section>
    </div>
  );
}
