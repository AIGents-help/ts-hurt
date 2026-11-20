import 'server-only';
import {stripe, stripeConfigured, decodeCart} from './stripe';
import {products, EST_COST, getProduct} from './products';

export type Metrics = Awaited<ReturnType<typeof getMetrics>>;

/** All numbers come from Stripe (source of truth). Costs are ESTIMATES from lib/products EST_COST. */
export async function getMetrics(days = 30) {
  const base = {brand: 'ts-hurt', generatedAt: new Date().toISOString(), windowDays: days, catalogSize: products.length};
  if (!stripeConfigured()) return {...base, configured: false as const};

  const since = Math.floor(Date.now() / 1000) - days * 86400;
  const sessions = [];
  for await (const s of stripe().checkout.sessions.list({created: {gte: since}, limit: 100, expand: ['data.payment_intent']})) {
    if (s.metadata?.brand === 'ts-hurt') sessions.push(s);
  }
  const paid = sessions.filter(s => s.payment_status === 'paid');
  const abandoned = sessions.filter(s => s.status === 'expired').length;

  let gross = 0, shipping = 0, discounts = 0, tax = 0, units = 0, estCost = 0;
  const byProduct = new Map<string, {units: number; revenue: number}>();
  const daily = new Map<string, number>();
  for (const s of paid) {
    gross += s.amount_total ?? 0;
    shipping += s.shipping_cost?.amount_total ?? 0;
    discounts += s.total_details?.amount_discount ?? 0;
    tax += s.total_details?.amount_tax ?? 0;
    const lines = decodeCart(s.metadata?.cart ?? '');
    let first = true;
    for (const l of lines) {
      const p = getProduct(l.id);
      units += l.quantity;
      const plus = l.size === '2XL' || l.size === '3XL';
      estCost += l.quantity * (EST_COST.teeCents + (plus ? EST_COST.plusSizeExtraCents : 0));
      estCost += first ? EST_COST.shipFirstCents + (l.quantity - 1) * EST_COST.shipAddlCents : l.quantity * EST_COST.shipAddlCents;
      first = false;
      const cur = byProduct.get(l.id) ?? {units: 0, revenue: 0};
      byProduct.set(l.id, {units: cur.units + l.quantity, revenue: cur.revenue + l.quantity * (p?.price ?? 0) * 100});
    }
    const day = new Date(s.created * 1000).toISOString().slice(0, 10);
    daily.set(day, (daily.get(day) ?? 0) + (s.amount_total ?? 0));
  }
  // Stripe fee estimate: 2.9% + 30¢ per order.
  const fees = Math.round(gross * 0.029) + paid.length * 30;
  const net = gross - tax - estCost - fees;
  const recent = paid.slice(0, 15).map(s => {
    const pi = typeof s.payment_intent === 'object' ? s.payment_intent : null;
    return {
      at: new Date(s.created * 1000).toISOString(), email: s.customer_details?.email ?? '', total: (s.amount_total ?? 0) / 100,
      items: decodeCart(s.metadata?.cart ?? '').map(l => `${l.quantity}× ${l.id} ${l.size}`).join(', '),
      printful: pi?.metadata?.printful_order_id ?? null, printfulStatus: pi?.metadata?.printful_status ?? 'pending',
    };
  });
  const top = [...byProduct.entries()].sort((a, b) => b[1].units - a[1].units).map(([id, v]) => ({id, name: getProduct(id)?.name ?? id, units: v.units, revenue: v.revenue / 100}));
  const unsold = products.filter(p => !byProduct.has(p.id)).map(p => p.id);

  return {
    ...base, configured: true as const,
    orders: paid.length, units, abandonedCheckouts: abandoned,
    checkoutConversion: sessions.length ? paid.length / sessions.length : null,
    gross: gross / 100, aov: paid.length ? gross / paid.length / 100 : 0,
    shipping: shipping / 100, discounts: discounts / 100, tax: tax / 100,
    estFulfillmentCost: estCost / 100, estStripeFees: fees / 100, estNetProfit: net / 100,
    estMargin: gross ? net / (gross - tax) : null,
    topSellers: top, unsoldDesigns: unsold, recentOrders: recent,
    daily: [...daily.entries()].sort().map(([day, cents]) => ({day, revenue: cents / 100})),
  };
}
