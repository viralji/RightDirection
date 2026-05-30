import type { NextRequest } from 'next/server';

/** Origin as seen by the browser (respects nginx X-Forwarded-*). */
export function getPublicOrigin(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!host) return request.nextUrl.origin;

  const proto =
    request.headers.get('x-forwarded-proto') ??
    (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');

  return `${proto}://${host}`;
}

export function publicUrl(request: NextRequest, pathname: string): URL {
  return new URL(pathname, `${getPublicOrigin(request)}/`);
}
