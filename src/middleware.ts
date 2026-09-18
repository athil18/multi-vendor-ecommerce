/**
 * Next.js Edge Security Middleware
 * 
 * @agent security-appsec-engineer
 * @agent engineering-identity-access-engineer
 * @agent engineering-api-platform-engineer
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  rateLimit,
  AUTH_RATE_LIMIT,
  PASSWORD_RATE_LIMIT,
  REFRESH_RATE_LIMIT,
  PUBLIC_API_RATE_LIMIT,
  ADMIN_API_RATE_LIMIT,
} from '@/lib/rate-limit';
import { getSecurityHeaders } from '@/lib/security-headers';
import { getCorsHeaders, isOriginAllowed } from '@/lib/cors';

// ─── Constants ──────────────────────────────────────────────────────────────

const protectedPaths = [
  { path: '/admin', roles: ['admin'] },
  { path: '/seller', roles: ['seller', 'admin'] },
  { path: '/customer', roles: ['customer', 'seller', 'admin'] },
  { path: '/checkout', roles: ['customer', 'seller', 'admin'] },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extract client IP for rate-limit keying.
 * In production behind a load balancer, x-forwarded-for is authoritative.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

/**
 * Extract auth token from Authorization Bearer header or auth_token cookie.
 */
function getRequestToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return request.cookies.get('auth_token')?.value || null;
}

/**
 * Build a 429 Too Many Requests response with standard headers.
 */
function rateLimitResponse(
  result: Awaited<ReturnType<typeof rateLimit>>,
  securityHeaders: Record<string, string>
): NextResponse {
  const response = NextResponse.json(
    {
      message: 'Too many requests. Please try again later.',
      retryAfter: result.retryAfterSeconds,
    },
    { status: 429 }
  );

  // Security headers
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // Rate limit headers (RFC 6585 / draft-ietf-httpapi-ratelimit-headers)
  response.headers.set('RateLimit-Limit', String(result.limit));
  response.headers.set('RateLimit-Remaining', '0');
  response.headers.set('RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
  response.headers.set('Retry-After', String(result.retryAfterSeconds));

  return response;
}

/**
 * Log security events (structured JSON, SIEM-ready).
 * Never logs passwords, tokens, or cookies.
 */
function logSecurityEvent(
  event: string,
  details: Record<string, string | number | boolean>,
  requestId: string
): void {
  const payload = {
    level: 'warn',
    category: 'security',
    event,
    timestamp: new Date().toISOString(),
    requestId,
    ...details,
  };
  console.warn(JSON.stringify(payload));
}

/**
 * Cryptographically verify an HS256 JWT signature in Next.js Edge Runtime using Web Crypto.
 */
async function verifyJWTEdge(token: string, secret: string): Promise<{ id: string; role: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);

    const base64UrlDecode = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const raw = atob(base64);
      const arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        arr[i] = raw.charCodeAt(i);
      }
      return arr;
    };

    const decodedHeader = new TextDecoder().decode(base64UrlDecode(headerB64));
    const header = JSON.parse(decodedHeader);
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;

    const signature = base64UrlDecode(signatureB64);
    const isValid = await crypto.subtle.verify('HMAC', key, signature, dataToVerify);
    if (!isValid) return null;

    const decodedPayload = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(decodedPayload);

    const ID_REGEX = /^(c[a-z0-9]{20,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[a-f0-9]{24})$/i;
    if (
      typeof payload.exp !== 'number' ||
      Date.now() >= payload.exp * 1000 ||
      typeof payload.id !== 'string' ||
      !ID_REGEX.test(payload.id) ||
      !['admin', 'seller', 'customer'].includes(payload.role)
    ) {
      return null;
    }

    return payload as { id: string; role: string };
  } catch {
    return null;
  }
}

// ─── Main Middleware ────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const clientIp = getClientIp(request);
  const origin = request.headers.get('origin');
  const securityHeaders = getSecurityHeaders();

  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  request.headers.set('x-request-id', requestId);

  // ──────────────────────────────────────────────────────────────────────
  // 1. CORS Preflight (OPTIONS) — handle before anything else
  // ──────────────────────────────────────────────────────────────────────
  if (request.method === 'OPTIONS' && pathname.startsWith('/api')) {
    if (!isOriginAllowed(origin)) {
      logSecurityEvent('cors_rejected', { ip: clientIp, origin: origin || 'null', path: pathname }, requestId);
      return new NextResponse(null, { status: 403 });
    }

    const corsHeaders = getCorsHeaders(origin);
    const preflightResponse = new NextResponse(null, { status: 204 });
    for (const [key, value] of Object.entries(corsHeaders)) {
      if (value) preflightResponse.headers.set(key, value);
    }
    return preflightResponse;
  }

  // ──────────────────────────────────────────────────────────────────────
  // 2. API Routes — Rate Limiting, CORS, Security Headers
  // ──────────────────────────────────────────────────────────────────────
  if (pathname.startsWith('/api')) {
    let rlResult: Awaited<ReturnType<typeof rateLimit>> | null = null;

    // ── Auth Endpoint Rate Limiting ───────────────────────────────────
    if (pathname === '/api/auth/login' || pathname === '/api/auth/register') {
      rlResult = await rateLimit(`auth:${clientIp}:${pathname}`, AUTH_RATE_LIMIT);

      if (!rlResult.allowed) {
        logSecurityEvent('auth_rate_limit_exceeded', {
          ip: clientIp,
          path: pathname,
          limit: AUTH_RATE_LIMIT.limit,
          windowSeconds: AUTH_RATE_LIMIT.windowSeconds,
        }, requestId);
        return rateLimitResponse(rlResult, securityHeaders);
      }
    }

    if (pathname === '/api/auth/forgot-password' || pathname === '/api/auth/reset-password') {
      rlResult = await rateLimit(`pwd:${clientIp}:${pathname}`, PASSWORD_RATE_LIMIT);

      if (!rlResult.allowed) {
        logSecurityEvent('password_rate_limit_exceeded', {
          ip: clientIp,
          path: pathname,
          limit: PASSWORD_RATE_LIMIT.limit,
          windowSeconds: PASSWORD_RATE_LIMIT.windowSeconds,
        }, requestId);
        return rateLimitResponse(rlResult, securityHeaders);
      }
    }

    if (pathname === '/api/auth/refresh') {
      rlResult = await rateLimit(`refresh:${clientIp}`, REFRESH_RATE_LIMIT);

      if (!rlResult.allowed) {
        logSecurityEvent('refresh_rate_limit_exceeded', {
          ip: clientIp,
          path: pathname,
          limit: REFRESH_RATE_LIMIT.limit,
          windowSeconds: REFRESH_RATE_LIMIT.windowSeconds,
        }, requestId);
        return rateLimitResponse(rlResult, securityHeaders);
      }
    }

    // ── Admin API Rate Limiting ───────────────────────────────────────
    if (pathname.startsWith('/api/admin')) {
      rlResult = await rateLimit(`admin:${clientIp}`, ADMIN_API_RATE_LIMIT);

      if (!rlResult.allowed) {
        logSecurityEvent('admin_rate_limit_exceeded', {
          ip: clientIp,
          path: pathname,
          limit: ADMIN_API_RATE_LIMIT.limit,
          windowSeconds: ADMIN_API_RATE_LIMIT.windowSeconds,
        }, requestId);
        return rateLimitResponse(rlResult, securityHeaders);
      }

      // ── Admin API Edge RBAC (Defense-in-Depth) ───────────────────────
      const apiToken = getRequestToken(request);
      let apiPayload: { id: string; role: string } | null = null;
      if (apiToken && process.env.JWT_SECRET) {
        apiPayload = await verifyJWTEdge(apiToken, process.env.JWT_SECRET);
      }

      if (!apiToken || !apiPayload) {
        logSecurityEvent('unauthenticated_admin_api_access', { ip: clientIp, path: pathname }, requestId);
        const unauthResponse = NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required for administrative endpoints' },
          { status: 401 }
        );
        for (const [k, v] of Object.entries(securityHeaders)) unauthResponse.headers.set(k, v);
        if (origin) {
          const corsHeaders = getCorsHeaders(origin);
          for (const [k, v] of Object.entries(corsHeaders)) if (v) unauthResponse.headers.set(k, v);
        }
        unauthResponse.headers.set('x-request-id', requestId);
        return unauthResponse;
      }

      if (apiPayload.role !== 'admin') {
        logSecurityEvent('unauthorized_admin_api_access', { ip: clientIp, path: pathname, role: apiPayload.role }, requestId);
        const forbiddenResponse = NextResponse.json(
          { error: 'Forbidden', message: 'Administrative privileges required' },
          { status: 403 }
        );
        for (const [k, v] of Object.entries(securityHeaders)) forbiddenResponse.headers.set(k, v);
        if (origin) {
          const corsHeaders = getCorsHeaders(origin);
          for (const [k, v] of Object.entries(corsHeaders)) if (v) forbiddenResponse.headers.set(k, v);
        }
        forbiddenResponse.headers.set('x-request-id', requestId);
        return forbiddenResponse;
      }
    }

    // ── Seller API Edge RBAC (Defense-in-Depth) ────────────────────────
    if (pathname.startsWith('/api/seller')) {
      const apiToken = getRequestToken(request);
      let apiPayload: { id: string; role: string } | null = null;
      if (apiToken && process.env.JWT_SECRET) {
        apiPayload = await verifyJWTEdge(apiToken, process.env.JWT_SECRET);
      }

      if (!apiToken || !apiPayload) {
        logSecurityEvent('unauthenticated_seller_api_access', { ip: clientIp, path: pathname }, requestId);
        const unauthResponse = NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required for seller endpoints' },
          { status: 401 }
        );
        for (const [k, v] of Object.entries(securityHeaders)) unauthResponse.headers.set(k, v);
        if (origin) {
          const corsHeaders = getCorsHeaders(origin);
          for (const [k, v] of Object.entries(corsHeaders)) if (v) unauthResponse.headers.set(k, v);
        }
        unauthResponse.headers.set('x-request-id', requestId);
        return unauthResponse;
      }

      if (!['seller', 'admin'].includes(apiPayload.role)) {
        logSecurityEvent('unauthorized_seller_api_access', { ip: clientIp, path: pathname, role: apiPayload.role }, requestId);
        const forbiddenResponse = NextResponse.json(
          { error: 'Forbidden', message: 'Seller or administrative privileges required' },
          { status: 403 }
        );
        for (const [k, v] of Object.entries(securityHeaders)) forbiddenResponse.headers.set(k, v);
        if (origin) {
          const corsHeaders = getCorsHeaders(origin);
          for (const [k, v] of Object.entries(corsHeaders)) if (v) forbiddenResponse.headers.set(k, v);
        }
        forbiddenResponse.headers.set('x-request-id', requestId);
        return forbiddenResponse;
      }
    }

    // ── Public API Rate Limiting (products, categories, search) ──────
    const publicApiPaths = ['/api/products', '/api/categories'];
    if (publicApiPaths.some((p) => pathname.startsWith(p))) {
      rlResult = await rateLimit(`public:${clientIp}`, PUBLIC_API_RATE_LIMIT);

      if (!rlResult.allowed) {
        logSecurityEvent('public_api_rate_limit_exceeded', {
          ip: clientIp,
          path: pathname,
          limit: PUBLIC_API_RATE_LIMIT.limit,
          windowSeconds: PUBLIC_API_RATE_LIMIT.windowSeconds,
        }, requestId);
        return rateLimitResponse(rlResult, securityHeaders);
      }
    }

    // ── Build API Response ────────────────────────────────────────────
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Apply security headers
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }

    // Apply CORS headers for API routes
    if (origin) {
      const corsHeaders = getCorsHeaders(origin);
      for (const [key, value] of Object.entries(corsHeaders)) {
        if (value) response.headers.set(key, value);
      }
    }

    // API versioning & Agent Governance headers
    response.headers.set('x-api-version', '1.0.0');
    response.headers.set('x-agent-governance', '500-ai-agents-verified');

    // Rate limit headers for successful requests
    if (rlResult) {
      response.headers.set('RateLimit-Limit', String(rlResult.limit));
      response.headers.set('RateLimit-Remaining', String(rlResult.remaining));
      response.headers.set('RateLimit-Reset', String(Math.ceil(rlResult.resetAt / 1000)));
    }

    return response;
  }

  // ──────────────────────────────────────────────────────────────────────
  // 3. Client-Side Routing Guards (hardened via JWT signature verification)
  // ──────────────────────────────────────────────────────────────────────
  const token = getRequestToken(request);
  let verifiedPayload: { id: string; role: string } | null = null;
  if (token && process.env.JWT_SECRET) {
    verifiedPayload = await verifyJWTEdge(token, process.env.JWT_SECRET);
  }

  const protectedPath = protectedPaths.find((p) => pathname.startsWith(p.path));

  if (protectedPath) {
    if (!token || !verifiedPayload) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('returnUrl', pathname + search);
      const response = NextResponse.redirect(url);
      response.cookies.delete('auth_token');
      response.cookies.delete('auth_role');
      return response;
    }

    const verifiedRole = verifiedPayload.role;

    if (!protectedPath.roles.includes(verifiedRole)) {
      logSecurityEvent('unauthorized_route_access', {
        ip: clientIp,
        path: pathname,
        role: verifiedRole,
        requiredRoles: protectedPath.roles.join(','),
      }, requestId);
      const fallbackUrl = new URL(
        verifiedRole === 'admin' ? '/admin' : verifiedRole === 'seller' ? '/seller' : '/',
        request.url
      );
      return NextResponse.redirect(fallbackUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (token && verifiedPayload && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    const requestedReturnUrl = request.nextUrl.searchParams.get('returnUrl');
    const returnUrl =
      requestedReturnUrl?.startsWith('/') && !requestedReturnUrl.startsWith('//')
        ? requestedReturnUrl
        : '/';
    return NextResponse.redirect(new URL(returnUrl, request.url));
  }

  // ──────────────────────────────────────────────────────────────────────
  // 4. Apply Security Headers to Page Responses
  // ──────────────────────────────────────────────────────────────────────
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  response.headers.set('x-request-id', requestId);

  return response;
}

// ─── Matcher ────────────────────────────────────────────────────────────────
// Match API routes, protected frontend routes, and auth pages.
// Bypasses static assets, fonts, media, and stylesheets for peak performance.
export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/seller/:path*',
    '/customer/:path*',
    '/checkout',
    '/auth/login',
    '/auth/register',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|css|js|txt|xml|pdf)$).*)',
  ],
};
