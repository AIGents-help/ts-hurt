import {NextResponse} from 'next/server';
import {getMetrics} from '../../../lib/metrics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Machine feed for DJINN / Brand Command Center / weekly report task.
// GET /api/metrics?days=7  with header  Authorization: Bearer <METRICS_TOKEN>
export async function GET(req: Request) {
  const token = process.env.METRICS_TOKEN;
  if (!token || req.headers.get('authorization') !== `Bearer ${token}`) return NextResponse.json({error: 'unauthorized'}, {status: 401});
  const days = Math.min(Math.max(Number(new URL(req.url).searchParams.get('days')) || 30, 1), 365);
  const m = await getMetrics(days);
  if ('recentOrders' in m) m.recentOrders = m.recentOrders.map(o => ({...o, email: o.email.replace(/^(.).*@/, '$1***@')}));
  return NextResponse.json(m);
}
