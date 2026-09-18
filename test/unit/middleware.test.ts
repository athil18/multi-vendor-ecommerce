/**
 * Unit Test Suite for Edge Middleware, CORS, Rate Limiting, and Security Headers
 * 
 * @agent 15-unit-test-generator
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 * @agent engineering-api-platform-engineer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { isOriginAllowed, getCorsHeaders } from '@/lib/cors';
import { rateLimit, clearRateLimitStore } from '@/lib/rate-limit';
import { getSecurityHeaders } from '@/lib/security-headers';
import { middleware } from '@/middleware';

const TEST_SECRET = process.env.JWT_SECRET || 'test-secret-key-32-chars-long-12345';

function createJwt(payload: { id: string; role: string; exp?: number }): string {
  const fullPayload = {
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  };
  return jwt.sign(fullPayload, TEST_SECRET, { algorithm: 'HS256' });
}

describe('Enterprise Edge Middleware & Security Subsystems', () => {
  beforeEach(() => {
    clearRateLimitStore();
    process.env.JWT_SECRET = TEST_SECRET;
  });

  describe('CORS Engine (apps/src/lib/cors.ts)', () => {
    it('should allow Next.js development origins (ports 3000, 3001)', () => {
      expect(isOriginAllowed('http://localhost:3000')).toBe(true);
      expect(isOriginAllowed('http://localhost:3001')).toBe(true);
      expect(isOriginAllowed('http://127.0.0.1:3000')).toBe(true);
    });

    it('should allow Angular frontend development origin (port 4200)', () => {
      expect(isOriginAllowed('http://localhost:4200')).toBe(true);
      expect(isOriginAllowed('http://127.0.0.1:4200')).toBe(true);
    });

    it('should allow Vite development origins (port 5173)', () => {
      expect(isOriginAllowed('http://localhost:5173')).toBe(true);
      expect(isOriginAllowed('http://127.0.0.1:5173')).toBe(true);
    });

    it('should reject unapproved foreign origins', () => {
      expect(isOriginAllowed('http://malicious-site.example.com')).toBe(false);
      expect(isOriginAllowed('https://phishing-nexus.com')).toBe(false);
      expect(isOriginAllowed(null)).toBe(false);
    });

    it('should generate complete CORS headers including tracing headers for approved origins', () => {
      const headers = getCorsHeaders('http://localhost:4200');
      expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:4200');
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
      expect(headers['Access-Control-Allow-Headers']).toContain('x-request-id');
      expect(headers['Access-Control-Allow-Headers']).toContain('x-api-version');
      expect(headers['Access-Control-Allow-Headers']).toContain('Sentry-Trace');
    });

    it('should return empty headers for rejected origins', () => {
      const headers = getCorsHeaders('http://unapproved.com');
      expect(headers['Access-Control-Allow-Origin']).toBe('');
      expect(headers['Access-Control-Allow-Methods']).toBe('');
    });
  });

  describe('Token-Bucket Rate Limiter (apps/src/lib/rate-limit.ts)', () => {
    it('should permit requests within limit and decrement remaining tokens', async () => {
      const result1 = await rateLimit('test-client-1', { limit: 5, windowSeconds: 60 });
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);

      const result2 = await rateLimit('test-client-1', { limit: 5, windowSeconds: 60 });
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should deny requests exceeding limit with retryAfterSeconds', async () => {
      for (let i = 0; i < 3; i++) {
        await rateLimit('rate-exhaust-client', { limit: 3, windowSeconds: 60 });
      }

      const rejected = await rateLimit('rate-exhaust-client', { limit: 3, windowSeconds: 60 });
      expect(rejected.allowed).toBe(false);
      expect(rejected.remaining).toBe(0);
      expect(rejected.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('should clear store completely via clearRateLimitStore', async () => {
      await rateLimit('test-clear-client', { limit: 1, windowSeconds: 60 });
      const blocked = await rateLimit('test-clear-client', { limit: 1, windowSeconds: 60 });
      expect(blocked.allowed).toBe(false);

      await clearRateLimitStore();

      const fresh = await rateLimit('test-clear-client', { limit: 1, windowSeconds: 60 });
      expect(fresh.allowed).toBe(true);
    });
  });

  describe('Security Headers Engine (apps/src/lib/security-headers.ts)', () => {
    it('should inject essential OWASP security headers', () => {
      const headers = getSecurityHeaders();
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['Content-Security-Policy']).toBeDefined();
    });

    it('should include Stripe Network endpoints and worker policy in CSP', () => {
      const headers = getSecurityHeaders();
      const csp = headers['Content-Security-Policy'];
      expect(csp).toContain('https://*.stripe.network');
      expect(csp).toContain('worker-src');
      expect(csp).toContain('blob:');
    });
  });

  describe('Next.js Edge Middleware Execution (apps/src/middleware.ts)', () => {
    it('should handle CORS preflight OPTIONS request from Angular frontend', async () => {
      const req = new NextRequest('http://localhost:3000/api/products', {
        method: 'OPTIONS',
        headers: {
          origin: 'http://localhost:4200',
          'access-control-request-method': 'GET',
        },
      });

      const response = await middleware(req);
      expect(response.status).toBe(204);
      expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:4200');
      expect(response.headers.get('access-control-allow-credentials')).toBe('true');
    });

    it('should reject CORS preflight OPTIONS request from disallowed origin with 403', async () => {
      const req = new NextRequest('http://localhost:3000/api/products', {
        method: 'OPTIONS',
        headers: {
          origin: 'http://evil-origin.example.com',
          'access-control-request-method': 'POST',
        },
      });

      const response = await middleware(req);
      expect(response.status).toBe(403);
    });

    it('should reject unauthenticated request to /api/admin/products at the edge with 401 JSON', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'GET',
      });

      const response = await middleware(req);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(response.headers.get('x-request-id')).toBeDefined();
    });

    it('should reject non-admin user request to /api/admin/products with 403 Forbidden', async () => {
      const customerToken = createJwt({
        id: '11111111-1111-1111-1111-111111111111',
        role: 'customer',
      });

      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${customerToken}`,
        },
      });

      const response = await middleware(req);
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Forbidden');
    });

    it('should allow admin user request to /api/admin/products with 200 pass-through', async () => {
      const adminToken = createJwt({
        id: '22222222-2222-2222-2222-222222222222',
        role: 'admin',
      });

      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      const response = await middleware(req);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-api-version')).toBe('1.0.0');
      expect(response.headers.get('x-request-id')).toBeDefined();
    });

    it('should redirect unauthenticated browser visit to /admin to /auth/login with returnUrl', async () => {
      const req = new NextRequest('http://localhost:3000/admin/settings', {
        method: 'GET',
      });

      const response = await middleware(req);
      expect(response.status).toBe(307); // NextResponse.redirect default
      const location = response.headers.get('location');
      expect(location).toContain('/auth/login');
      expect(location).toContain('returnUrl=%2Fadmin%2Fsettings');
    });

    it('should pass through public API requests with rate limit headers and security headers', async () => {
      const req = new NextRequest('http://localhost:3000/api/products', {
        method: 'GET',
      });

      const response = await middleware(req);
      expect(response.status).toBe(200);
      expect(response.headers.get('RateLimit-Limit')).toBeDefined();
      expect(response.headers.get('RateLimit-Remaining')).toBeDefined();
      expect(response.headers.get('x-api-version')).toBe('1.0.0');
      expect(response.headers.get('x-request-id')).toBeDefined();
    });
  });
});
