/**
 * In-Memory Sliding-Window Rate Limiter
 * London Kids Preschool Avalurpet
 * 
 * Provides abuse prevention for login attempts, password resets,
 * admission enquiries, and public bot challenge routes.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks and increments rate limit for a specific key (e.g. `login:192.168.1.1`).
 *
 * @param key Unique identifier (action + IP/user)
 * @param maxRequests Maximum allowable requests within the time window
 * @param windowMs Time window in milliseconds
 * @returns { allowed: boolean, remaining: number, resetInSec: number }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSec: Math.ceil(windowMs / 1000),
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetInSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Resets the rate limit counter for a specific key
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

