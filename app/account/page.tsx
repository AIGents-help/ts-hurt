import Link from 'next/link';
import {redirect} from 'next/navigation';
import {currentUser} from '../../lib/supabase/server';
import {stripe, stripeConfigured, decodeCart} from '../../lib/stripe';
import {getProduct} from '../../lib/products';
import {ProfileForm} from '../../components/ProfileForm';

export const dynamic = 'force-dynamic';
export const metadata = {title: 'Your Account', robots: {index: false}};

async function ordersFor(email: string) {
  if (!stripeConfigured()) return [];
  try {
    const list = await stripe().checkout.sessions.list({customer_details: {email}, limit: 20, expand: ['data.payment_intent']});
    return list.data.filter(s => s.payment_status === 'paid' && s.metadata?.brand === 'ts-hurt').map(s => {
      const pi = typeof s.payment_intent === 'object' ? s.payment_intent : null;
      return {
        id: s.id, at: new Date(s.created * 1000).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}),
        total: (s.amount_total ?? 0) / 100, status: pi?.metadata?.printful_status ?? 'received',
        items: decodeCart(s.metadata?.cart ?? '').map(l => `${l.quantity}× ${getProduct(l.id)?.name ?? l.id} (${l.size})`),
      };
    });
  } catch { return []; }
}

export default async function Account() {
  const {user, profile} = await currentUser();
  if (!user || !profile) redirect('/account/login?next=/account');
  const orders = await ordersFor(user.email!);
  return (
    <main className="admin account">
      <p className="eyebrow">YOUR FILE</p>
      <h1>{profile.full_name ? <>{profile.full_name.split(' ')[0].toUpperCase()}&apos;S <span>FILE</span></> : <>YOUR <span>FILE</span></>}</h1>
      {profile.role === 'admin' && <p className="status ok">● ADMIN CLEARANCE — <Link href="/admin">OPEN COMMAND CENTER ↗</Link></p>}
      <div className="adminGrid">
        <section><h2>Profile</h2><ProfileForm profile={profile} /></section>
        <section id="orders"><h2>Your orders</h2>
          {orders.length ? <table><tbody>{orders.map(o => <tr key={o.id}><td>{o.at}</td><td>{o.items.join(', ')}</td><td>${o.total.toFixed(2)}</td><td>{o.status}</td></tr>)}</tbody></table>
            : <p>No orders yet. <Link href="/#inventory">Fix that ↗</Link></p>}
          <p className="muted">Orders placed with {user.email} show up here automatically.</p>
        </section>
      </div>
      <form action="/auth/signout" method="post"><button className="inspect">SIGN OUT ↗</button></form>
    </main>
  );
}
