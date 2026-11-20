#!/usr/bin/env node
// One-time setup for the NEW, Ts-Hurt-only Stripe account. Safe to re-run (skips what exists).
// Usage: STRIPE_SECRET_KEY=sk_live_... node scripts/setup-stripe.mjs
// Prints the webhook signing secret to paste into Vercel as STRIPE_WEBHOOK_SECRET.
import Stripe from 'stripe';
const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error('Set STRIPE_SECRET_KEY'); process.exit(1); }
const stripe = new Stripe(key);
const site = (process.env.SITE_URL || 'https://ts-hurt.com').replace(/\/$/, '');

async function promo(code, percent, firstTimeOnly) {
  const existing = await stripe.promotionCodes.list({code, limit: 1});
  if (existing.data.length) return console.log(`• promo ${code} exists`);
  const coupon = await stripe.coupons.create({percent_off: percent, duration: 'once', name: `${code} (${percent}% off)`});
  await stripe.promotionCodes.create({coupon: coupon.id, code, restrictions: {first_time_transaction: firstTimeOnly}});
  console.log(`✓ promo ${code} created`);
}

await promo('WELCOME10', 10, true);
await promo('COMEBACK10', 10, false);

const url = `${site}/api/stripe/webhook`;
const hooks = await stripe.webhookEndpoints.list({limit: 100});
if (hooks.data.some(h => h.url === url)) {
  console.log(`• webhook ${url} already exists (secret only shown at creation; roll it in the dashboard if lost)`);
} else {
  const h = await stripe.webhookEndpoints.create({url, enabled_events: ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.expired'], description: 'TS-HURT fulfillment'});
  console.log(`✓ webhook created → set in Vercel:\n\n  STRIPE_WEBHOOK_SECRET=${h.secret}\n`);
}
