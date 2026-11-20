'use client';
import {useEffect} from 'react';
import Link from 'next/link';
import {track} from '@vercel/analytics';
import {useCart} from '../../components/CartProvider';

export default function Success() {
  const {clear} = useCart();
  useEffect(() => { clear(); track('purchase'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <main className="manifesto" style={{minHeight: '60vh'}}>
      <div>
        <p className="eyebrow">● TRANSACTION LOGGED</p>
        <h2>EVIDENCE <em>RECEIVED.</em></h2>
        <p>Your shirt is headed to the press. Confirmation is in your inbox, and tracking follows when it ships.</p>
        <Link className="action" href="/#inventory">KEEP OFFENDING ↗</Link>
      </div>
    </main>
  );
}
