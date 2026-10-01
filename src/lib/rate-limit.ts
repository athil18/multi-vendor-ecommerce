/**
 * Edge-compatible in-memory token bucket rate limiter for local development.
 * 
 * @agent engineering-api-platform-engineer
 * @agent security-appsec-engineer
 */

import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export interface RateLimitOptions {
  limit: number; // max requests per window
  windowMs?: number; // time window in ms
  windowSeconds?: number; // time window in seconds
}

export const AUTH_RATE_LIMIT: Required<RateLimitOptions> = { limit: 10, windowMs: 60 * 1000, windowSeconds: 60 };
export const PASSWORD_RATE_LIMIT: Required<RateLimitOptions> = { limit: 5, windowMs: 15 * 60 * 1000, windowSeconds: 900 };
export const REFRESH_RATE_LIMIT: Required<RateLimitOptions> = { limit: 20, windowMs: 60 * 1000, windowSeconds: 60 };
export const PUBLIC_API_RATE_LIMIT: Required<RateLimitOptions> = { limit: 100, windowMs: 60 * 1000, windowSeconds: 60 };
export const ADMIN_API_RATE_LIMIT: Required<RateLimitOptions> = { limit: 60, windowMs: 60 * 1000, windowSeconds: 60 };
export const AI_API_RATE_LIMIT: Required<RateLimitOptions> = { limit: 20, windowMs: 60 * 1000, windowSeconds: 60 };
export const COUPON_RATE_LIMIT: Required<RateLimitOptions> = { limit: 10, windowMs: 60 * 1000, windowSeconds: 60 };

interface Bucket {
  tokens: number;
  lastRefill: number;
}

// In-memory store with bounded capacity and TTL-based eviction
const MAX_MEMORY_BUCKETS = 10000;
const memoryStore = new Map<string, Bucket>();

function pruneExpiredBuckets(now: number, maxAgeMs: number = 300000): void {
  for (const [k, b] of memoryStore.entries()) {
    if (now - b.lastRefill > maxAgeMs) {
      memoryStore.delete(k);
    }
  }
}

/**
 * Edge-compatible token bucket rate limiter supporting NextRequest or string keys.
 */
export async function rateLimit(reqOrKey: NextRequest | string, options: Partial<RateLimitOptions> = {}) {
  const limit = options.limit || 30; // default 30 requests
  const windowMs = options.windowMs || (options.windowSeconds ? options.windowSeconds * 1000 : 60 * 1000);
  const windowSeconds = Math.ceil(windowMs / 1000);

  const now = Date.now();
  const resetAt = now + windowMs;

  let key: string;
  if (typeof reqOrKey === 'string') {
    key = reqOrKey;
  } else {
    const ip = reqOrKey.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const path = reqOrKey.nextUrl.pathname;
    key = `ratelimit:${ip}:${path}`;
  }

  // Periodic capacity control to prevent unbounded memory growth
  if (memoryStore.size >= MAX_MEMORY_BUCKETS) {
    pruneExpiredBuckets(now, windowMs);
    // If still at capacity, evict oldest 20% entries
    if (memoryStore.size >= MAX_MEMORY_BUCKETS) {
      const keysToDelete = Array.from(memoryStore.keys()).slice(0, Math.floor(MAX_MEMORY_BUCKETS * 0.2));
      for (const k of keysToDelete) memoryStore.delete(k);
    }
  }

  try {
    let bucket = memoryStore.get(key);
    
    if (!bucket) {
      bucket = {
        tokens: limit - 1,
        lastRefill: now
      };
      memoryStore.set(key, bucket);
      return {
        allowed: true,
        success: true,
        remaining: bucket.tokens,
        resetMs: windowMs,
        retryAfterSeconds: windowSeconds,
        limit,
        resetAt
      };
    }

    const elapsed = now - bucket.lastRefill;
    if (elapsed > windowMs) {
      bucket.tokens = limit - 1;
      bucket.lastRefill = now;
      memoryStore.set(key, bucket);
      return {
        allowed: true,
        success: true,
        remaining: bucket.tokens,
        resetMs: windowMs,
        retryAfterSeconds: windowSeconds,
        limit,
        resetAt
      };
    }

    const resetMs = windowMs - elapsed;
    const retryAfterSeconds = Math.ceil(resetMs / 1000);
    const currentResetAt = bucket.lastRefill + windowMs;

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      memoryStore.set(key, bucket);
      return {
        allowed: true,
        success: true,
        remaining: bucket.tokens,
        resetMs,
        retryAfterSeconds,
        limit,
        resetAt: currentResetAt
      };
    }

    return {
      allowed: false,
      success: false,
      remaining: 0,
      resetMs,
      retryAfterSeconds,
      limit,
      resetAt: currentResetAt
    };
  } catch (error) {
    // Fallback to allowing request if store error occurs
    logger.error('[RateLimit] Memory store error, failing open:', { error: String(error) });
    return {
      allowed: true,
      success: true,
      remaining: limit - 1,
      resetMs: windowMs,
      retryAfterSeconds: windowSeconds,
      limit,
      resetAt,
    };
  }
}

/**
 * Clear a specific rate limit key. Useful for testing.
 */
export async function clearRateLimitKey(key: string): Promise<void> {
  memoryStore.delete(`ratelimit:${key}`);
}

/**
 * Clear all rate limit keys. Useful for testing.
 */
export async function clearRateLimitStore(): Promise<void> {
  memoryStore.clear();
}