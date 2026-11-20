'use client';
import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {products, categories, type Product} from '../lib/products';
import {BuyBox} from './BuyBox';

export function Shirt({id, name, sizes}: {id: string; name: string; sizes: string}) {
  return <div className="shirt"><Image className="printArtwork" src={`/designs/${id}.png`} alt={`${name} t-shirt design`} width={900} height={1050} sizes={sizes} /></div>;
}

export function ProductGrid() {
  const [filter, setFilter] = useState('ALL INVENTORY');
  const [selected, setSelected] = useState<Product | null>(null);
  const shown = filter === 'ALL INVENTORY' ? products : products.filter(p => p.category === filter);
  return (
    <>
      <div className="sectionHeading">
        <div><p className="eyebrow">DEPARTMENT 01 / ACQUISITIONS</p><h2>THE <span>INVENTORY</span></h2><p>Fresh off the press. Questionable by design.</p></div>
        <b>FILE COUNT / {String(shown.length).padStart(3, '0')}</b>
      </div>
      <div className="filters">{categories.map(c => <button aria-pressed={filter === c} className={filter === c ? 'active' : ''} onClick={() => setFilter(c)} key={c}>{c}</button>)}</div>
      <div className="products">
        {shown.map((p, i) => (
          <article className="product" key={p.id}>
            <button className="preview" onClick={() => setSelected(p)} aria-label={'Inspect ' + p.name}>
              <span className="file">FILE {String(i + 1).padStart(3, '0')}</span>
              <Shirt id={p.id} name={p.name} sizes="(max-width:600px) 60vw, 20vw" />
              <span className="productTag">{p.tag}</span>
            </button>
            <div className="productLine"><div><small>{p.category}</small><h3><Link href={`/shirts/${p.id}`}>{p.name}</Link></h3></div><b>${p.price}.00</b></div>
            <button className="inspect" onClick={() => setSelected(p)}>QUICK INSPECT ↗</button>
          </article>
        ))}
      </div>
      {selected && (
        <div className="shade" onMouseDown={() => setSelected(null)}>
          <section className="modal" onMouseDown={e => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)} aria-label="Close">✕</button>
            <div className="modalPreview"><Shirt id={selected.id} name={selected.name} sizes="(max-width:600px) 60vw, 30vw" /></div>
            <div className="modalInfo">
              <p className="eyebrow">{selected.category}</p><h2>{selected.name}</h2><p>{selected.description}</p>
              <BuyBox product={selected} onAdded={() => setSelected(null)} />
              <Link className="inspect" href={`/shirts/${selected.id}`}>FULL CASE FILE ↗</Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
