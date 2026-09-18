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

interface Bucket {
  tokens: number;
  lastRefill: number;
}

// In-memory store for Edge environment (local development)
const memoryStore = new Map<string, Bucket>();

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