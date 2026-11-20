import {NextResponse} from 'next/server';
import {getMetrics} from '../../../../lib/metrics';
import {sendEmail, shell, button} from '../../../../lib/email';
import {siteUrl} from '../../../../lib/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const usd = (n: number) => n.toLocaleString('en-US', {style: 'currency', currency: 'USD'});

// Vercel Cron, Mondays. Blunt weekly P&L to the owner, plus the one thing to fix.
export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error: 'unauthorized'}, {status: 401});
  const to = process.env.OWNER_EMAIL;
  if (!to) return NextResponse.json({skipped: 'no OWNER_EMAIL'});
  const m = await getMetrics(7);
  let body: string;
  if (!m.configured) {
    body = `<h1 style="font-size:26px">STORE NOT TAKING MONEY YET.</h1><p>Stripe isn't connected, so this week made $0 by design. Finish setup in the Command Center.</p>`;
  } else {
    const verdict = m.orders === 0
      ? 'Zero orders. Traffic or conversion problem, not a product problem yet. Push the new drop to TikTok/IG and check Vercel Analytics for visitors.'
      : (m.checkoutConversion ?? 1) < 0.35 ? `${m.abandonedCheckouts} people bailed at checkout. Shipping cost is the usual culprit. Consider lowering the free-ship threshold.`
      : `Best seller: ${m.topSellers[0]?.name}. Next drop should riff on that angle.`;
    body = `<h1 style="font-size:26px;margin:0">LAST 7 DAYS</h1>
<table style="width:100%;font-size:15px;margin:16px 0" cellpadding="6">
<tr><td>Revenue</td><td align="right"><b>${usd(m.gross)}</b></td></tr><tr><td>Est. net profit</td><td align="right"><b style="color:#d52a24">${usd(m.estNetProfit)}</b></td></tr>
<tr><td>Orders / units</td><td align="right">${m.orders} / ${m.units}</td></tr><tr><td>AOV</td><td align="right">${usd(m.aov)}</td></tr>
<tr><td>Abandoned checkouts</td><td align="right">${m.abandonedCheckouts}</td></tr></table>
<p><b>Verdict:</b> ${verdict}</p>
${m.unsoldDesigns.length ? `<p style="color:#a6a197">Designs with zero sales in 7d: ${m.unsoldDesigns.join(', ')}</p>` : ''}`;
  }
  await sendEmail(to, `TS-HURT weekly: ${m.configured ? usd(m.gross) : 'not live'}`, shell(body + button(`${siteUrl()}/admin`, 'OPEN COMMAND CENTER ↗')));
  return NextResponse.json({sent: true});
}
