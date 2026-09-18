/**
 * Sentry Client Configuration
 * 
 * @agent security-appsec-engineer
 * @agent engineering-frontend-developer
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || 'https://mock@sentry.io/12345',
  tracesSampleRate: 0.1,
  debug: false,
});