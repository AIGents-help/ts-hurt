'use client';
import {useState} from 'react';
import {useCart} from './CartProvider';
import {SIZES, unitPrice, type Product, type Size} from '../lib/products';

export function BuyBox({product, onAdded}: {product: Product; onAdded?: () => void}) {
  const {add} = useCart();
  const [size, setSize] = useState<Size>('L');
  return (
    <>
      <h3>${unitPrice(product, size)}.00</h3>
      <p className="eyebrow">SELECT SIZE</p>
      <div className="sizes">
        {SIZES.map(s => <button className={s === size ? 'active' : ''} key={s} onClick={() => setSize(s)} aria-pressed={s === size}>{s}</button>)}
      </div>
      <button className="action" onClick={() => { add(product, size); onAdded?.(); }}>ADD TO EVIDENCE BAG</button>
      <small>Bella+Canvas 3001 · 100% airlume combed cotton · Black · Unisex fit. Printed to order, so it&apos;s yours and nobody else&apos;s mistake.</small>
    </>
  );
}
