import Link from 'next/link';
import {getMetrics} from '../../lib/metrics';
import {products} from '../../lib/products';

export const dynamic = 'force-dynamic';
export const metadata = {title: 'Command Center', robots: {index: false}};

const usd = (n: number) => n.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
const pct = (n: number | null) => (n == null ? '—' : `${(n * 100).toFixed(1)}%`);

function readiness() {
  const has = (k: string) => Boolean(process.env[k]);
  return [
    ['Stripe payments', has('STRIPE_SECRET_KEY')], ['Stripe webhook', has('STRIPE_WEBHOOK_SECRET')],
    ['Printful fulfillment', has('PRINTFUL_API_TOKEN')], ['Printful auto-confirm', process.env.PRINTFUL_AUTO_CONFIRM === 'true'],
    ['Email (Resend)', has('RESEND_API_KEY')], ['Email list', has('RESEND_AUDIENCE_ID')], ['Sale alerts to owner', has('OWNER_EMAIL')],
    ['Metrics feed (DJINN)', has('METRICS_TOKEN')], ['Auto sales tax', process.env.STRIPE_AUTOMATIC_TAX === 'true'],
  ] as const;
}

export default async function Admin({searchParams}: {searchParams: Promise<{days?: string}>}) {
  const days = Number((await searchParams).days) || 30;
  let m: Awaited<ReturnType<typeof getMetrics>> | {configured: false; error: string};
  try { m = await getMetrics(days); } catch (e) { m = {configured: false, error: e instanceof Error ? e.message : String(e)}; }
  const checks = readiness();
  const live = checks.slice(0, 3).every(c => c[1]);
  return (
    <main className="admin">
      <p className="eyebrow">AIGENTS // COMMAND CENTER</p>
      <h1>TS-HURT <span>OPERATIONS</span></h1>
      <p className={live ? 'status ok' : 'status warn'}>{live ? '● STORE IS LIVE AND AUTO-FULFILLING' : '● NOT TAKING ORDERS YET: finish the red items below'}</p>
      <nav className="adminTabs">{[7, 30, 90, 365].map(d => <Link key={d} className={d === days ? 'active' : ''} href={`/admin?days=${d}`}>{d}D</Link>)}</nav>

      {m.configured ? (
        <>
          <div className="kpis">
            {[['Revenue', usd(m.gross)], ['Est. net profit', usd(m.estNetProfit)], ['Orders', m.orders], ['Units', m.units], ['AOV', usd(m.aov)], ['Est. margin', pct(m.estMargin)], ['Checkout conv.', pct(m.checkoutConversion)], ['Abandoned', m.abandonedCheckouts]].map(([k, v]) => <div className="kpi" key={k}><small>{k}</small><b>{v}</b></div>)}
          </div>
          <div className="adminGrid">
            <section><h2>Top sellers</h2>{m.topSellers.length ? <table><tbody>{m.topSellers.map(t => <tr key={t.id}><td>{t.name}</td><td>{t.units}u</td><td>{usd(t.revenue)}</td></tr>)}</tbody></table> : <p>No sales in window.</p>}
              {m.unsoldDesigns.length > 0 && <p className="muted">Zero sales: {m.unsoldDesigns.join(', ')}</p>}</section>
            <section><h2>P&amp;L breakdown</h2><table><tbody>
              <tr><td>Gross collected</td><td>{usd(m.gross)}</td></tr><tr><td>– Sales tax (pass-through)</td><td>{usd(m.tax)}</td></tr>
              <tr><td>– Printful est.</td><td>{usd(m.estFulfillmentCost)}</td></tr><tr><td>– Stripe fees est.</td><td>{usd(m.estStripeFees)}</td></tr>
              <tr><td><b>Est. net</b></td><td><b>{usd(m.estNetProfit)}</b></td></tr><tr><td>Discounts given</td><td>{usd(m.discounts)}</td></tr>
            </tbody></table></section>
          </div>
          <section><h2>Recent orders</h2>{m.recentOrders.length ? <table><thead><tr><th>When</th><th>Customer</th><th>Items</th><th>Total</th><th>Printful</th></tr></thead><tbody>{m.recentOrders.map(o => <tr key={o.at + o.email}><td>{o.at.slice(0, 16).replace('T', ' ')}</td><td>{o.email}</td><td>{o.items}</td><td>{usd(o.total)}</td><td>{o.printful ? `#${o.printful} ${o.printfulStatus}` : '⚠ not sent'}</td></tr>)}</tbody></table> : <p>No orders yet.</p>}</section>
        </>
      ) : <p className="muted">{'error' in m ? `Stripe error: ${m.error}` : 'Sales data appears once Stripe is connected.'}</p>}

      <div className="adminGrid">
        <section><h2>System readiness</h2><ul className="checks">{checks.map(([k, ok]) => <li key={k} className={ok ? 'ok' : 'bad'}>{ok ? '✓' : '✕'} {k}</li>)}</ul></section>
        <section><h2>Catalog</h2><p>{products.length} designs live. New drops arrive as weekly GitHub pull requests: merge = publish, close = reject.</p>
          <p><a href="https://github.com/AIGents-help/ts-hurt/pulls?q=is%3Apr+is%3Aopen+label%3Adesign-drop" target="_blank">Review pending design drops ↗</a></p>
          <p><a href="https://www.printful.com/dashboard/default/orders" target="_blank">Printful orders ↗</a> · <a href="https://dashboard.stripe.com/payments" target="_blank">Stripe ↗</a> · <a href="https://vercel.com/aigentsprojects/ts-hurt/analytics" target="_blank">Traffic ↗</a></p></section>
      </div>
    </main>
  );
}
