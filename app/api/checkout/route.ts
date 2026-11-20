import {NextResponse} from 'next/server';
import {getProduct, isSize, unitPrice, siteUrl, SHIPPING} from '../../../lib/products';
import {stripe, stripeConfigured, encodeCart} from '../../../lib/stripe';
import {currentUser} from '../../../lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!stripeConfigured()) return NextResponse.json({error: 'checkout_not_configured'}, {status: 503});
  const body = await req.json().catch(() => null);
  const raw = Array.isArray(body?.items) ? body.items : [];

  // Never trust client prices: rebuild every line from the catalog.
  const lines: {id: string; size: string; quantity: number}[] = [];
  const lineItems = [];
  let subtotal = 0;
  for (const it of raw.slice(0, 20)) {
    const p = getProduct(String(it?.id));
    const size = String(it?.size);
    const quantity = Math.min(Math.max(Math.floor(Number(it?.quantity) || 0), 0), 10);
    if (!p || !isSize(size) || quantity < 1) continue;
    const cents = unitPrice(p, size) * 100;
    subtotal += cents * quantity;
    lines.push({id: p.id, size, quantity});
    lineItems.push({
      quantity,
      price_data: {
        currency: 'usd',
        unit_amount: cents,
        product_data: {name: `${p.name} — Black / ${size}`, images: [`${siteUrl()}/designs/${p.id}.png`], metadata: {product_id: p.id, size}},
      },
    });
  }
  if (!lineItems.length) return NextResponse.json({error: 'empty_cart'}, {status: 400});

  const freeShip = subtotal >= SHIPPING.freeOverCents;
  // Signed-in customers get their email prefilled and the order linked to their account.
  const {user} = await currentUser().catch(() => ({user: null}));
  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    allow_promotion_codes: true,
    shipping_address_collection: {allowed_countries: ['US', 'CA']},
    phone_number_collection: {enabled: false},
    shipping_options: [{shipping_rate_data: {
      type: 'fixed_amount',
      display_name: freeShip ? 'Free shipping' : 'Standard shipping',
      fixed_amount: {amount: freeShip ? 0 : SHIPPING.flatCents, currency: 'usd'},
      delivery_estimate: {minimum: {unit: 'business_day', value: 5}, maximum: {unit: 'business_day', value: 10}},
    }}],
    automatic_tax: {enabled: process.env.STRIPE_AUTOMATIC_TAX === 'true'},
    // Lets the webhook email an abandoned-cart recovery link when the session expires.
    after_expiration: {recovery: {enabled: true, allow_promotion_codes: true}},
    consent_collection: {promotions: 'auto'},
    ...(user?.email ? {customer_email: user.email} : {}),
    metadata: {cart: encodeCart(lines), brand: 'ts-hurt', ...(user ? {user_id: user.id} : {})},
    payment_intent_data: {metadata: {cart: encodeCart(lines), brand: 'ts-hurt'}},
    success_url: `${siteUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/#inventory`,
  });
  return NextResponse.json({url: session.url});
}
