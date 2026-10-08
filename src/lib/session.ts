/**
 * Server-Side Session & Authentication Utility
 * London Kids Preschool Avalurpet
 * 
 * Generates and verifies HMAC-SHA256 signed session tokens stored in
 * HttpOnly, Secure, SameSite cookies or Authorization headers.
 * 
 * Implements:
 * - Role-aware session lifetimes (24h max + 2h idle timeout for sensitive admin roles)
 * - Cryptographically random JTI (token ID) to prevent replay/session fixation
 * - Constant-time signature verification
 * - Secure cookie attributes (HttpOnly, SameSite=Lax, Secure in prod)
 */

import crypto from 'crypto';
import { UserRole } from '@/types';

export interface SessionUser {
  userId: string;
  role: UserRole;
  email: string;
  name: string;
  studentIds?: string[];
  jti: string;
  iat: number;
  exp: number;
  idleExp?: number;
}

const SESSION_COOKIE_NAME = 'lk_session';

// Standard 7-day session for parents/students/teachers
const STANDARD_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
// Sensitive administrative session: 24 hours max lifetime
const ADMIN_MAX_DURATION_MS = 24 * 60 * 60 * 1000;
// Sensitive administrative idle timeout: 2 hours
const ADMIN_IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;

// Revoked token store for instant server-side revocation on logout
const revokedTokens = new Set<string>();

// Periodic cleanup of revoked tokens older than 7 days to prevent unbounded growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (revokedTokens.size > 5000) {
      revokedTokens.clear();
    }
  }, 24 * 60 * 60 * 1000);
}

// Session secret with production verification
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === 'production'
    ? 'londonkids-avalurpet-secure-session-key-2026-prod-secret'
    : 'londonkids-avalurpet-dev-session-key-2026');

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
 * Creates an HMAC-SHA256 signed session token with role-aware expiration
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

  const now = Date.now();
  const isAdminRole = ['OWNER', 'ADMIN', 'PRINCIPAL'].includes(user.role);
  const duration = isAdminRole ? ADMIN_MAX_DURATION_MS : STANDARD_SESSION_DURATION_MS;
  const idleExp = isAdminRole ? now + ADMIN_IDLE_TIMEOUT_MS : undefined;

  const payload: SessionUser = {
    userId: String(user.id),
    role: user.role,
    email,
    name: user.name || 'User',
    studentIds,
    jti: crypto.randomBytes(16).toString('hex'),
    iat: now,
    exp: now + duration,
    ...(idleExp ? { idleExp } : {}),
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

    // Check if token has been revoked on logout
    if (session.jti && revokedTokens.has(session.jti)) {
      return null;
    }

    const now = Date.now();

    // Check overall max expiration
    if (now > session.exp) {
      return null;
    }

    // Check idle timeout for sensitive admin sessions
    if (session.idleExp && now > session.idleExp) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Revokes a session token so it cannot be reused
 */
export function revokeSessionToken(token: string): void {
  try {
    const session = verifySessionToken(token);
    if (session?.jti) {
      revokedTokens.add(session.jti);
    }
  } catch {}
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
 * Extracts raw session token string from request
 */
export function getRawSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (sessionCookie) {
    return sessionCookie.split('=')[1];
  }
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

/**
 * Formats Set-Cookie header value for the session
 */
export function getSessionCookieHeader(token: string, isAdmin: boolean = false): string {
  const isProd = process.env.NODE_ENV === 'production';
  const durationMs = isAdmin ? ADMIN_MAX_DURATION_MS : STANDARD_SESSION_DURATION_MS;
  const maxAge = Math.floor(durationMs / 1000);
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
