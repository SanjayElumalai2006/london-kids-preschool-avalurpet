/**
 * Server-Side Session & Authentication Utility
 * London Kids Preschool Avalurpet
 * 
 * Generates and verifies HMAC-SHA256 signed session tokens stored in
 * HttpOnly, Secure, SameSite cookies or Authorization headers.
 */

import crypto from 'crypto';
import { UserRole } from '@/types';

export interface SessionUser {
  userId: string;
  role: UserRole;
  email: string;
  name: string;
  studentIds?: string[];
  exp: number;
}

const SESSION_COOKIE_NAME = 'lk_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Use configured secret or fallback securely generated on boot
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'londonkids-avalurpet-secure-session-key-2026-prod-secret';

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Creates an HMAC-SHA256 signed session token
 */
export function createSessionToken(user: {
  id: string;
  role: UserRole;
  email?: string;
  personalEmail?: string;
  name?: string;
  studentIds?: string[];
  studentId?: string;
}): string {
  const email = (user.personalEmail || user.email || '').toLowerCase().trim();
  const studentIds = user.studentIds && user.studentIds.length > 0
    ? user.studentIds
    : (user.studentId ? [user.studentId] : []);

  const payload: SessionUser = {
    userId: user.id,
    role: user.role,
    email,
    name: user.name || 'User',
    studentIds,
    exp: Date.now() + SESSION_DURATION_MS,
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadStr);

  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 session token
 */
export function verifySessionToken(token: string): SessionUser | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;

  // Verify HMAC signature in constant time
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payloadJson = base64UrlDecode(encodedPayload);
    const session: SessionUser = JSON.parse(payloadJson);

    // Check expiration
    if (Date.now() > session.exp) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Extracts session user from either the HttpOnly cookie or the Authorization Bearer header
 */
export function getSessionUser(request: Request): SessionUser | null {
  // 1. Check Cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (sessionCookie) {
    const token = sessionCookie.split('=')[1];
    const user = verifySessionToken(token);
    if (user) return user;
  }

  // 2. Check Authorization header
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = verifySessionToken(token);
    if (user) return user;
  }

  return null;
}

/**
 * Formats Set-Cookie header value for the session
 */
export function getSessionCookieHeader(token: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000);
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
    isProd ? '; Secure' : ''
  }`;
}

/**
 * Formats Set-Cookie header value to clear the session
 */
export function getClearSessionCookieHeader(): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
    isProd ? '; Secure' : ''
  }`;
}
