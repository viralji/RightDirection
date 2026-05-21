import { NextRequest, NextResponse } from 'next/server';

const PORTAL_PREFIXES = ['/agent', '/admin', '/university', '/student'];

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'rightdirection.com';

  const subdomain = hostname.replace(`.${baseDomain}`, '').replace(`:3000`, '');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-subdomain', subdomain);
  requestHeaders.set('x-pathname', url.pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const isAuthPage =
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/verify-otp');
  const hasToken = request.cookies.get('access_token');

  const isProtected =
    url.pathname === '/dashboard' ||
    PORTAL_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

  if (isProtected && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && hasToken) {
    return NextResponse.redirect(new URL('/agent/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
