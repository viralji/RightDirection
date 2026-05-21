import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PORTALS = ['(agent)', '(student)', '(university)', '(admin)'];

const PORTAL_MAP: Record<string, string> = {
  admin: '/(admin)',
  university: '/(university)',
  app: '/(student)',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'rightdirection.com';

  // Extract subdomain
  const subdomain = hostname.replace(`.${baseDomain}`, '').replace(`:3000`, '');

  // Pass subdomain to all pages via header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-subdomain', subdomain);
  requestHeaders.set('x-pathname', url.pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Auth check for protected routes
  const isAuthPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/register');
  const hasToken = request.cookies.get('access_token');

  const isProtected =
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/students') ||
    url.pathname.startsWith('/applications') ||
    url.pathname.startsWith('/universities') ||
    url.pathname.startsWith('/profile') ||
    url.pathname.startsWith('/proposals') ||
    url.pathname.startsWith('/documents') ||
    url.pathname.startsWith('/commission') ||
    url.pathname.startsWith('/team') ||
    url.pathname.startsWith('/admin');

  if (isProtected && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
