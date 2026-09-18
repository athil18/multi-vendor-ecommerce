/**
 * Enterprise Security Headers
 *
 * Centralized security header configuration for the Nexus Marketplace.
 * Applied in middleware.ts to every response.
 */

export interface SecurityHeadersConfig {
  /** Enable HSTS. Disable in local dev if not using HTTPS. */
  enableHSTS: boolean;
  /** CSP report-only mode (logs violations without blocking). */
  cspReportOnly: boolean;
}

/**
 * Returns a Record of security headers to apply to every response.
 */
export function getSecurityHeaders(config?: Partial<SecurityHeadersConfig>): Record<string, string> {
  const enableHSTS = config?.enableHSTS ?? process.env.NODE_ENV === 'production';
  const cspReportOnly = config?.cspReportOnly ?? false;

  const headers: Record<string, string> = {};

  // ─── Content Security Policy ──────────────────────────────────────────
  // Restrictive CSP that allows self-hosted resources, inline styles (required
  // by Next.js), and specific trusted CDNs for fonts/images.
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data: blob:",
    "img-src 'self' https://images.unsplash.com https://via.placeholder.com data: blob:",
    "connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.stripe.network https://m.stripe.network",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.stripe.network",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  const cspHeaderName = cspReportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';
  headers[cspHeaderName] = cspDirectives;

  // ─── HSTS ─────────────────────────────────────────────────────────────
  if (enableHSTS) {
    headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
  }

  // ─── Clickjacking Protection ──────────────────────────────────────────
  headers['X-Frame-Options'] = 'DENY';

  // ─── MIME Sniffing Protection ─────────────────────────────────────────
  headers['X-Content-Type-Options'] = 'nosniff';

  // ─── XSS Protection (legacy browsers) ─────────────────────────────────
  headers['X-XSS-Protection'] = '1; mode=block';

  // ─── Referrer Policy ──────────────────────────────────────────────────
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

  // ─── Permissions Policy ───────────────────────────────────────────────
  // Restrict powerful browser features to reduce attack surface.
  headers['Permissions-Policy'] = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=(self)',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', ');

  // ─── Cross-Origin Policies ────────────────────────────────────────────
  headers['Cross-Origin-Opener-Policy'] = 'same-origin';
  headers['Cross-Origin-Resource-Policy'] = 'same-origin';

  // ─── DNS Prefetch Control ─────────────────────────────────────────────
  headers['X-DNS-Prefetch-Control'] = 'on';

  return headers;
}
