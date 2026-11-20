import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {products, getProduct, siteUrl} from '../../../lib/products';
import {BuyBox} from '../../../components/BuyBox';
import {Shirt} from '../../../components/ProductGrid';

export const generateStaticParams = () => products.map(p => ({id: p.id}));

export async function generateMetadata({params}: {params: Promise<{id: string}>}): Promise<Metadata> {
  const p = getProduct((await params).id);
  if (!p) return {};
  const title = `${p.name} T-Shirt`;
  return {
    title, description: `${p.description} Funny, offensive ${p.category.toLowerCase()} tee by TS-HURT. Printed on demand, ships in 2–5 days.`,
    keywords: p.keywords, alternates: {canonical: `/shirts/${p.id}`},
    openGraph: {title, images: [`/designs/${p.id}.png`]},
  };
}

export default async function ShirtPage({params}: {params: Promise<{id: string}>}) {
  const p = getProduct((await params).id);
  if (!p) notFound();
  const related = products.filter(x => x.id !== p.id).sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category)).slice(0, 3);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: `${p.name} T-Shirt`, description: p.description, brand: {'@type': 'Brand', name: 'TS-HURT'},
    image: `${siteUrl()}/designs/${p.id}.png`, sku: `TSH-${p.id}`,
    offers: {'@type': 'Offer', price: p.price.toFixed(2), priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `${siteUrl()}/shirts/${p.id}`},
  };
  return (
    <main className="casefile">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <section className="caseGrid">
        <div className="modalPreview"><Shirt id={p.id} name={p.name} sizes="(max-width:860px) 80vw, 40vw" /></div>
        <div className="modalInfo">
          <p className="eyebrow"><Link href="/#inventory">INVENTORY</Link> / {p.category} / {p.tag}</p>
          <h1>{p.name}</h1>
          <p>{p.description}</p>
          <BuyBox product={p} />
          <ul className="facts"><li>Printed to order in the USA or EU, whichever is closer to you</li><li>Ships in 2–5 business days, tracking emailed</li><li>Misprint or damage? We replace it free</li><li>Free shipping over $60</li></ul>
        </div>
      </section>
      <section className="inventory"><p className="eyebrow">RELATED EVIDENCE</p>
        <div className="products">{related.map(r => <article className="product" key={r.id}><Link className="preview" href={`/shirts/${r.id}`}><Shirt id={r.id} name={r.name} sizes="(max-width:600px) 60vw, 20vw" /><span className="productTag">{r.tag}</span></Link><div className="productLine"><div><small>{r.category}</small><h3><Link href={`/shirts/${r.id}`}>{r.name}</Link></h3></div><b>${r.price}.00</b></div></article>)}</div>
      </section>
    </main>
  );
}
