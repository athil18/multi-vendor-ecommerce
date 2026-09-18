/**
 * CORS Configuration
 *
 * Strict origin validation for the Nexus Marketplace.
 * - Production: Only explicitly approved origins.
 * - Development: localhost on common ports.
 */

const APPROVED_PRODUCTION_ORIGINS: string[] = [
  // Add production domains here, e.g.:
  // 'https://nexus-marketplace.com',
  // 'https://www.nexus-marketplace.com',
];

const APPROVED_DEV_ORIGINS: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://localhost:4200', // Angular Frontend
  'http://127.0.0.1:4200',
  'http://localhost:5173', // Vite / DevTools
  'http://127.0.0.1:5173',
];

/**
 * Returns the list of approved origins based on the current environment.
 */
function getApprovedOrigins(): string[] {
  if (process.env.NODE_ENV === 'production') {
    // In production, also allow any origins set via env var
    const envOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? [];
    return [...APPROVED_PRODUCTION_ORIGINS, ...envOrigins].filter(Boolean);
  }
  return [...APPROVED_DEV_ORIGINS, ...APPROVED_PRODUCTION_ORIGINS];
}

/**
 * Validates whether a given origin is approved.
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const approved = getApprovedOrigins();
  return approved.includes(origin);
}

/**
 * Returns CORS headers for the given origin.
 * If the origin is not approved, returns restrictive headers.
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !isOriginAllowed(origin)) {
    return {
      'Access-Control-Allow-Origin': '',
      'Access-Control-Allow-Methods': '',
      'Access-Control-Allow-Headers': '',
    };
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With, x-request-id, x-api-version, x-client-role, x-client-version, Accept, Sentry-Trace, Baggage',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours preflight cache
    'Vary': 'Origin',
  };
}
