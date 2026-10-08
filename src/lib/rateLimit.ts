/**
 * Production-Grade Distributed Rate Limiter
 * London Kids Preschool Avalurpet
 * 
 * Provides hybrid abuse prevention:
 * 1. Distributed MongoDB TTL sliding-window tracking (survives Vercel serverless multi-instance execution).
 * 2. In-memory sliding-window fallback if database connection is pending or offline.
 */

import mongoose from 'mongoose';
import RateLimitModel from '@/models/RateLimit';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic in-memory cleanup every 5 minutes
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

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSec: number;
}

/**
 * Distributed rate limiter with MongoDB TTL persistence and in-memory fallback.
 */
export async function checkRateLimitAsync(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 15 * 60 * 1000
): Promise<RateLimitResult> {
  const isMongoReady = mongoose.connection.readyState === 1;

  if (isMongoReady) {
    try {
      const now = new Date();
      const expiresAt = new Date(Date.now() + windowMs);

      // Try incrementing existing active window
      const updated = await RateLimitModel.findOneAndUpdate(
        { key, expiresAt: { $gt: now } },
        { $inc: { count: 1 } },
        { new: true }
      ).lean();

      if (updated) {
        const resetInSec = Math.max(1, Math.ceil((new Date(updated.expiresAt).getTime() - Date.now()) / 1000));
        if (updated.count > maxRequests) {
          return { allowed: false, remaining: 0, resetInSec };
        }
        return { allowed: true, remaining: Math.max(0, maxRequests - updated.count), resetInSec };
      }

      // No active window found; create fresh window entry
      await RateLimitModel.create({
        key,
        count: 1,
        expiresAt,
      });

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetInSec: Math.ceil(windowMs / 1000),
      };
    } catch {
      // Fallback to in-memory if MongoDB write errors
    }
  }

  // In-Memory Fallback
  return checkRateLimit(key, maxRequests, windowMs);
}

/**
 * Synchronous in-memory rate limiter
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
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
export async function resetRateLimit(key: string): Promise<void> {
  rateLimitStore.delete(key);
  if (mongoose.connection.readyState === 1) {
    try {
      await RateLimitModel.deleteMany({ key });
    } catch {}
  }
}
