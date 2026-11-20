import {NextResponse} from 'next/server';
import type Stripe from 'stripe';
import {stripe, decodeCart} from '../../../../lib/stripe';
import {createOrder, type FulfillmentItem} from '../../../../lib/printful';
import {getProduct, isSize, unitPrice, siteUrl} from '../../../../lib/products';
import {sendEmail, shell, button} from '../../../../lib/email';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({error: 'webhook_not_configured'}, {status: 503});
  const sig = req.headers.get('stripe-signature');
  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, sig ?? '', secret);
  } catch {
    return NextResponse.json({error: 'bad_signature'}, {status: 400});
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.payment_status === 'paid' && s.metadata?.brand === 'ts-hurt') await fulfill(s);
        break;
      }
      case 'checkout.session.expired': {
        const s = event.data.object as Stripe.Checkout.Session;
        await recoverAbandoned(s);
        break;
      }
    }
  } catch (err) {
    // Non-2xx makes Stripe retry with backoff for ~3 days; Printful external_id keeps retries idempotent.
    console.error('webhook handler failed', event.type, err);
    await alertOwner(`⚠️ TS-HURT fulfillment error`, `<p>Event <b>${event.type}</b> (${event.id}) failed:</p><pre style="white-space:pre-wrap">${String(err).slice(0, 1500)}</pre><p>Stripe will retry automatically. If it keeps failing, check the Printful dashboard.</p>`);
    return NextResponse.json({error: 'handler_failed'}, {status: 500});
  }
  return NextResponse.json({received: true});
}

async function fulfill(s: Stripe.Checkout.Session) {
  const details = s.collected_information?.shipping_details ?? (s as unknown as {shipping_details?: Stripe.Checkout.Session.CollectedInformation.ShippingDetails}).shipping_details;
  const addr = details?.address;
  if (!addr?.line1 || !addr.country) throw new Error(`No shipping address on ${s.id}`);

  const items: FulfillmentItem[] = decodeCart(s.metadata?.cart ?? '').flatMap(l => {
    const p = getProduct(l.id);
    return p && isSize(l.size) ? [{productId: p.id, name: p.name, size: l.size, quantity: l.quantity, retailPrice: unitPrice(p, l.size)}] : [];
  });
  if (!items.length) throw new Error(`Empty/unknown cart on ${s.id}: ${s.metadata?.cart}`);

  const externalId = String(s.payment_intent ?? s.id).slice(0, 32);
  const order = await createOrder(externalId, {
    name: details?.name ?? s.customer_details?.name ?? 'Customer',
    address1: addr.line1, address2: addr.line2 ?? undefined, city: addr.city ?? '', state_code: addr.state ?? undefined,
    country_code: addr.country, zip: addr.postal_code ?? '', email: s.customer_details?.email ?? undefined,
  }, items, s.shipping_cost?.amount_total ?? 0);

  if (typeof s.payment_intent === 'string' && order.id) {
    await stripe().paymentIntents.update(s.payment_intent, {metadata: {printful_order_id: String(order.id), printful_status: order.status}});
  }

  const total = ((s.amount_total ?? 0) / 100).toFixed(2);
  const list = items.map(i => `${i.quantity}× ${i.name} (${i.size})`).join('<br/>');
  if (order.status !== 'duplicate') {
    await alertOwner(`💰 TS-HURT sale: $${total}`, `<p><b>$${total}</b> from ${s.customer_details?.email ?? 'a customer'}</p><p>${list}</p><p>Printful order <b>#${order.id}</b> — ${order.confirmed ? 'sent to production automatically' : '<b>DRAFT: confirm it in Printful</b> (auto-confirm is off)'}.</p>`);
    if (s.customer_details?.email) {
      await sendEmail(s.customer_details.email, 'Your TS-HURT order is in the press', shell(`<h1 style="font-size:30px;margin:0 0 12px">EVIDENCE RECEIVED.</h1><p>Your order is being printed. Tracking hits your inbox when it ships, usually within 2–5 business days.</p><p style="color:#a6a197">${list}</p><p>Total: <b>$${total}</b></p>${button(siteUrl(), 'BACK TO THE INVENTORY ↗')}`));
    }
  }
}

async function recoverAbandoned(s: Stripe.Checkout.Session) {
  const email = s.customer_details?.email;
  const url = s.after_expiration?.recovery?.url;
  // Only email people who opted in to promotional messages at checkout.
  if (!email || !url || s.consent?.promotions !== 'opt_in') return;
  await sendEmail(email, 'You left evidence behind', shell(`<h1 style="font-size:30px;margin:0 0 12px">YOU LEFT EVIDENCE BEHIND.</h1><p>Your bag is still sitting here. Feelings still sold separately.</p><p>Use code <b style="color:#d52a24">${process.env.RECOVERY_PROMO_CODE || 'COMEBACK10'}</b> for 10% off. Expires when we feel like it.</p>${button(url, 'FINISH CHECKOUT ↗')}`));
}

async function alertOwner(subject: string, html: string) {
  const to = process.env.OWNER_EMAIL;
  if (to) await sendEmail(to, subject, shell(html));
}
