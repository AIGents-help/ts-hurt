import type {Metadata} from 'next';

export const metadata: Metadata = {title: 'Shipping, Returns & Privacy'};

export default function Policies() {
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@ts-hurt.com';
  return (
    <main className="policies">
      <p className="eyebrow">DEPARTMENT 99 / THE FINE PRINT</p>
      <h1>SHIPPING, RETURNS &amp; PRIVACY</h1>
      <h2>Shipping</h2>
      <p>Every shirt is printed to order by our fulfillment partner (Printful). Production takes 2–5 business days, then transit time depending on your location. US and Canada only for now. Flat $5.99 shipping, free on orders over $60. Tracking is emailed when your order ships.</p>
      <h2>Returns &amp; replacements</h2>
      <p>Because each item is printed just for you, we don&apos;t accept returns for change of mind or wrong size. Check the size before you order. If your item arrives damaged, misprinted or defective, email {support} within 30 days of delivery with your order email and a photo, and we&apos;ll send a free replacement or refund.</p>
      <h2>Privacy</h2>
      <p>We collect what we need to ship your order (name, address, email). Payments are processed by Stripe; we never see or store your card number. Your shipping details are shared only with our print partner to fulfill the order. If you join the email list, you can unsubscribe anytime from any email. We use privacy-friendly, cookie-free analytics.</p>
      <h2>The content</h2>
      <p>All slogans are satire and adult humor. If you&apos;re easily offended, this is your warning.</p>
      <h2>Contact</h2>
      <p><a href={`mailto:${support}`}>{support}</a></p>
    </main>
  );
}
