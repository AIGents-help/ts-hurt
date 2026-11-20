import 'server-only';
import {siteUrl, type Size} from './products';

const API = 'https://api.printful.com';
// Bella+Canvas 3001 Unisex Jersey Tee. Override via env if you switch blanks.
const PRODUCT_ID = Number(process.env.PRINTFUL_PRODUCT_ID || 71);
const COLOR = process.env.PRINTFUL_COLOR || 'Black';

function headers() {
  const token = process.env.PRINTFUL_API_TOKEN;
  if (!token) throw new Error('PRINTFUL_API_TOKEN not set');
  const h: Record<string, string> = {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'};
  if (process.env.PRINTFUL_STORE_ID) h['X-PF-Store-Id'] = process.env.PRINTFUL_STORE_ID;
  return h;
}

let variantCache: Map<string, number> | null = null;

/** Resolves catalog variant IDs (size -> id) for the configured blank + color, straight from Printful's catalog. */
export async function variantId(size: Size): Promise<number> {
  if (!variantCache) {
    const res = await fetch(`${API}/products/${PRODUCT_ID}`, {headers: headers(), cache: 'no-store'});
    if (!res.ok) throw new Error(`Printful catalog lookup failed: ${res.status}`);
    const json = await res.json();
    variantCache = new Map();
    for (const v of json.result.variants as {id: number; color: string; size: string}[]) {
      if (v.color.toLowerCase() === COLOR.toLowerCase()) variantCache.set(v.size.toUpperCase(), v.id);
    }
  }
  const id = variantCache.get(size);
  if (!id) throw new Error(`No Printful variant for ${COLOR} / ${size}`);
  return id;
}

export type FulfillmentItem = {productId: string; name: string; size: Size; quantity: number; retailPrice: number};
export type Recipient = {name: string; address1: string; address2?: string; city: string; state_code?: string; country_code: string; zip: string; email?: string; phone?: string};

/**
 * Creates the Printful order. external_id makes it idempotent: Stripe retries the webhook,
 * Printful refuses the duplicate, we treat that as success.
 * PRINTFUL_AUTO_CONFIRM=true sends it straight to production (Printful charges your card on file).
 * Leave false for the first orders to eyeball drafts in the Printful dashboard.
 */
export async function createOrder(externalId: string, recipient: Recipient, items: FulfillmentItem[], shippingCents: number) {
  const confirm = process.env.PRINTFUL_AUTO_CONFIRM === 'true';
  const body = {
    external_id: externalId,
    shipping: 'STANDARD',
    recipient,
    items: await Promise.all(items.map(async i => ({
      variant_id: await variantId(i.size),
      quantity: i.quantity,
      retail_price: i.retailPrice.toFixed(2),
      name: `${i.name} / ${i.size}`,
      files: [{type: 'front', url: `${siteUrl()}/print/${i.productId}.png`}],
    }))),
    retail_costs: {shipping: (shippingCents / 100).toFixed(2)},
    packing_slip: {message: 'Feelings sold separately. Thanks for supporting the operation. — TS-HURT', store_name: 'TS-HURT'},
  };
  const res = await fetch(`${API}/orders?confirm=${confirm}`, {method: 'POST', headers: headers(), body: JSON.stringify(body)});
  const json = await res.json().catch(() => ({}));
  if (res.ok) return {ok: true as const, id: json.result?.id as number, status: json.result?.status as string, confirmed: confirm};
  const msg = JSON.stringify(json?.error ?? json).slice(0, 500);
  if (/external.?id/i.test(msg) && /(exist|duplicate|already|unique)/i.test(msg)) return {ok: true as const, id: null, status: 'duplicate', confirmed: confirm};
  throw new Error(`Printful order failed (${res.status}): ${msg}`);
}
