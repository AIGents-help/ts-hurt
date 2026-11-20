'use client';
import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {supabaseBrowser, authEnabled} from '../lib/supabase/client';

type Me = {email: string; name: string | null; admin: boolean} | null;

export function ProfileMenu() {
  const [me, setMe] = useState<Me | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authEnabled()) return setMe(null);
    const sb = supabaseBrowser();
    const load = async () => {
      const {data: {user}} = await sb.auth.getUser();
      if (!user) return setMe(null);
      const {data} = await sb.from('profiles').select('full_name, role').eq('id', user.id).single();
      setMe({email: user.email ?? '', name: data?.full_name ?? null, admin: data?.role === 'admin'});
    };
    load();
    const {data: sub} = sb.auth.onAuthStateChange(() => { load(); });
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => { sub.subscription.unsubscribe(); document.removeEventListener('mousedown', close); };
  }, []);

  if (me === undefined) return <span className="profileBtn" aria-hidden="true" />;
  if (!me) return <Link className="profileBtn" href="/account/login">SIGN IN</Link>;
  const label = (me.name?.split(' ')[0] || me.email.split('@')[0]).toUpperCase().slice(0, 12);
  return (
    <div className="profileMenu" ref={ref}>
      <button className="profileBtn" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu">{label} ▾</button>
      {open && (
        <nav className="profileDrop" role="menu" onClick={() => setOpen(false)}>
          <Link role="menuitem" href="/account">MY PROFILE</Link>
          <Link role="menuitem" href="/account#orders">MY ORDERS</Link>
          {me.admin && <Link role="menuitem" className="adminLink" href="/admin">⚙ ADMIN / COMMAND CENTER</Link>}
          <form action="/auth/signout" method="post"><button role="menuitem">SIGN OUT</button></form>
        </nav>
      )}
    </div>
  );
}
