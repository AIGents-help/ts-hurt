'use client';
import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {track} from '@vercel/analytics';
import {products, unitPrice, isSize, SHIPPING, type Product, type Size} from '../lib/products';

type Line = {id: string; size: string; quantity: number};
type Ctx = {cart: Line[]; count: number; add: (p: Product, size: Size) => void; adjust: (id: string, size: string, d: number) => void; clear: () => void; setOpen: (o: boolean) => void};
const CartCtx = createContext<Ctx | null>(null);
export const useCart = () => useContext(CartCtx)!;

const linePrice = (l: Line) => {
  const p = products.find(p => p.id === l.id);
  return p && isSize(l.size) ? unitPrice(p, l.size) : 0;
};

export function CartProvider({children}: {children: ReactNode}) {
  const [cart, setCart] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'closed' | 'error'>('idle');

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem('tshurt-cart') || '[]');
      if (Array.isArray(v)) setCart(v.filter(l => products.some(p => p.id === l.id)));
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) try { localStorage.setItem('tshurt-cart', JSON.stringify(cart)); } catch {}
  }, [cart, hydrated]);

  const count = cart.reduce((n, l) => n + l.quantity, 0);
  const subtotal = cart.reduce((n, l) => n + linePrice(l) * l.quantity, 0);
  const toFree = SHIPPING.freeOverCents / 100 - subtotal;

  const add = (p: Product, size: Size) => {
    setCart(prev => {
      const k = prev.findIndex(l => l.id === p.id && l.size === size);
      return k < 0 ? [...prev, {id: p.id, size, quantity: 1}] : prev.map((l, i) => (i === k ? {...l, quantity: l.quantity + 1} : l));
    });
    track('add_to_cart', {product: p.id, size});
    setOpen(true);
  };
  const adjust = (id: string, size: string, d: number) => setCart(prev => prev.map(l => (l.id === id && l.size === size ? {...l, quantity: l.quantity + d} : l)).filter(l => l.quantity > 0));
  const clear = () => setCart([]);

  async function checkout() {
    setState('loading');
    track('begin_checkout', {items: count, value: subtotal});
    try {
      const res = await fetch('/api/checkout', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({items: cart})});
      if (res.status === 503) return setState('closed');
      const json = await res.json();
      if (json.url) return void (window.location.href = json.url);
      setState('error');
    } catch {
      setState('error');
    }
  }

  return (
    <CartCtx.Provider value={{cart, count, add, adjust, clear, setOpen}}>
      {children}
      {open && (
        <div className="shade" onMouseDown={() => setOpen(false)}>
          <aside className="drawer" onMouseDown={e => e.stopPropagation()}>
            <div className="drawerHead"><h2>EVIDENCE BAG [{count}]</h2><button onClick={() => setOpen(false)} aria-label="Close bag">✕</button></div>
            <div className="cartItems">
              {cart.length === 0 ? <p>NOTHING TO CONFISCATE. YET.</p> : cart.map(l => {
                const p = products.find(p => p.id === l.id);
                return p ? (
                  <div className="cartItem" key={l.id + l.size}>
                    <div><strong>{p.name}</strong><p>BLACK / {l.size}</p><small>${linePrice(l)}.00</small></div>
                    <div className="quantity"><button onClick={() => adjust(l.id, l.size, -1)} aria-label="Remove one">−</button>{l.quantity}<button onClick={() => adjust(l.id, l.size, 1)} aria-label="Add one">+</button></div>
                  </div>
                ) : null;
              })}
            </div>
            <div className="cartFooter">
              {cart.length > 0 && <p className="shipNote">{toFree > 0 ? <>ADD <b>${toFree.toFixed(0)}</b> MORE FOR FREE SHIPPING</> : <b>FREE SHIPPING UNLOCKED</b>}</p>}
              <div>SUBTOTAL <b>${subtotal.toFixed(2)}</b></div>
              <button disabled={!cart.length || state === 'loading'} className="action" onClick={checkout}>{state === 'loading' ? 'OPENING THE VAULT…' : 'CHECKOUT ↗'}</button>
              {state === 'closed' && <small>The press is warming up. Checkout opens soon. Grab 10% off below and we&apos;ll tell you first.</small>}
              {state === 'error' && <small>Something jammed. Try again in a second.</small>}
              <small>Printed on demand. Ships in 2–5 business days. Taxes calculated at checkout.</small>
            </div>
          </aside>
        </div>
      )}
    </CartCtx.Provider>
  );
}

export function BagButton() {
  const {count, setOpen} = useCart();
  return <button onClick={() => setOpen(true)}>EVIDENCE BAG [{count}]</button>;
}
