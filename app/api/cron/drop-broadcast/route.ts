import {NextResponse} from 'next/server';
import {products, siteUrl} from '../../../../lib/products';
import {shell, button} from '../../../../lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Vercel Cron, Thursdays. If designs went live in the last 7 days, blast the email list automatically.
export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error: 'unauthorized'}, {status: 401});
  const key = process.env.RESEND_API_KEY, audience = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audience) return NextResponse.json({skipped: 'email not configured'});
  const cutoff = Date.now() - 7 * 86400_000;
  const fresh = products.filter(p => new Date(p.added).getTime() >= cutoff);
  if (!fresh.length) return NextResponse.json({skipped: 'no new designs'});

  const cards = fresh.map(p => `<div style="border:1px solid #38332f;padding:16px;margin:14px 0"><img src="${siteUrl()}/designs/${p.id}.png" width="260" alt="${p.name}" style="display:block;margin:auto;background:#161616"/><h2 style="margin:12px 0 4px">${p.name}</h2><p style="color:#a6a197;margin:0 0 12px">${p.description}</p>${button(`${siteUrl()}/shirts/${p.id}`, `GET IT — $${p.price} ↗`)}</div>`).join('');
  const html = shell(`<h1 style="font-size:30px;margin:0">NEW EVIDENCE JUST DROPPED.</h1><p>${fresh.length} new shirt${fresh.length > 1 ? 's' : ''} this week. HR has not approved any of them.</p>${cards}<p style="font-size:11px;color:#81786f"><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#81786f">Unsubscribe</a>. We'll survive.</p>`);
  const headers = {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'};
  const created = await fetch('https://api.resend.com/broadcasts', {method: 'POST', headers, body: JSON.stringify({
    audience_id: audience, from: process.env.EMAIL_FROM || 'TS-HURT <drops@ts-hurt.com>',
    subject: `New drop: ${fresh[0].name}${fresh.length > 1 ? ` + ${fresh.length - 1} more` : ''}`, html, name: `Drop ${new Date().toISOString().slice(0, 10)}`,
  })}).then(r => r.json());
  if (!created?.id) return NextResponse.json({error: 'broadcast_create_failed', detail: created}, {status: 502});
  const sent = await fetch(`https://api.resend.com/broadcasts/${created.id}/send`, {method: 'POST', headers, body: '{}'});
  return NextResponse.json({sent: sent.ok, designs: fresh.map(p => p.id)});
}
