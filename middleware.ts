import {NextResponse, type NextRequest} from 'next/server';

// Basic-auth wall for the Command Center. Username anything, password = ADMIN_PASSWORD.
export function middleware(req: NextRequest) {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return new NextResponse('Command Center locked: set ADMIN_PASSWORD in Vercel.', {status: 503});
  const auth = req.headers.get('authorization') ?? '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme === 'Basic' && encoded) {
    const decoded = atob(encoded);
    if (decoded.slice(decoded.indexOf(':') + 1) === pass) return NextResponse.next();
  }
  return new NextResponse('Authorized personnel only.', {status: 401, headers: {'WWW-Authenticate': 'Basic realm="TS-HURT Command Center"'}});
}

export const config = {matcher: ['/admin/:path*']};
