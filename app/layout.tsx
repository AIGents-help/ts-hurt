import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {Analytics} from '@vercel/analytics/next';
import {CartProvider, BagButton} from '../components/CartProvider';
import {PopupCapture} from '../components/EmailCapture';
import {siteUrl} from '../lib/products';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {default: 'TS-HURT | Offensive Funny T-Shirts. Feelings Sold Separately.', template: '%s | TS-HURT'},
  description: 'Politically incorrect, crude and dark-humor t-shirts for bikers, tattoo collectors and anyone tired of being polite. Printed on demand. Feelings sold separately.',
  openGraph: {siteName: 'TS-HURT', type: 'website', images: ['/brand/ts-hurt-primary.png']},
  twitter: {card: 'summary_large_image'},
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@ts-hurt.com';
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <div className="warning"><span>AUTHORIZED PERSONNEL ONLY <b> // OPEN TO THE PUBLIC</b></span><span>FREE SHIPPING OVER $60</span></div>
          <header className="siteHeader">
            <Link href="/" className="wordmark"><Image className="headerBrandLogo" src="/brand/ts-hurt-primary.png" alt="TS-HURT" width={1536} height={1024} priority sizes="155px" /><small>FEELINGS SOLD SEPARATELY</small></Link>
            <nav><Link href="/#inventory">THE INVENTORY</Link><Link href="/#operation">THE OPERATION</Link><Link href="/#manifesto">MANIFESTO</Link></nav>
            <BagButton />
          </header>
          {children}
          <footer>
            <div><strong>TS-HURT</strong><p>FEELINGS SOLD SEPARATELY.</p><small>AN UNDERGROUND PRINT OPERATION</small></div>
            <div>
              <small><Link href="/policies">SHIPPING · RETURNS · PRIVACY</Link></small>
              <small>CONTACT: <a href={`mailto:${support}`}>{support.toUpperCase()}</a></small>
              <small>© {new Date().getFullYear()} TS-HURT. ALL SLOGANS ARE SATIRE. RELAX.</small>
            </div>
          </footer>
          <PopupCapture />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
