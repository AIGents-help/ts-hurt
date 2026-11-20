import 'server-only';
import Stripe from 'stripe';

let client: Stripe | null = null;
export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return (client ??= new Stripe(process.env.STRIPE_SECRET_KEY));
}

/** Compact cart encoding that fits Stripe's 500-char metadata limit: "id:size:qty|id:size:qty" */
export const encodeCart = (lines: {id: string; size: string; quantity: number}[]) => lines.map(l => `${l.id}:${l.size}:${l.quantity}`).join('|');
export const decodeCart = (s: string) => s.split('|').filter(Boolean).map(x => {
  const [id, size, q] = x.split(':');
  return {id, size, quantity: Number(q)};
});
