import { env } from './config/env.config';

/** httpOnly auth cookies — Secure only when FRONTEND_URL uses HTTPS (IP deploy stays HTTP). */
export const AUTH_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.FRONTEND_URL.startsWith('https://'),
  sameSite: 'lax' as const,
  path: '/',
};
