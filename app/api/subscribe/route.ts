import {NextResponse} from 'next/server';
import {addSubscriber, sendEmail, shell, button} from '../../../lib/email';
import {siteUrl} from '../../../lib/products';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return NextResponse.json({error: 'invalid_email'}, {status: 400});
  // Honeypot: bots fill hidden fields.
  if (body?.company) return NextResponse.json({ok: true});
  await addSubscriber(email, String(body?.source ?? 'popup').slice(0, 40));
  const code = process.env.WELCOME_PROMO_CODE || 'WELCOME10';
  await sendEmail(email, 'Your 10% off. Don\'t get emotional.', shell(`<h1 style="font-size:30px;margin:0 0 12px">YOU'RE ON THE LIST.</h1><p>Code <b style="color:#d52a24;font-size:20px">${code}</b> takes 10% off your first order.</p><p>New drops land every week. Some of them will offend you. That's the point.</p>${button(siteUrl() + '/#inventory', 'ENTER THE INVENTORY ↗')}`));
  return NextResponse.json({ok: true, code});
}
