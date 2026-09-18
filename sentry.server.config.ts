import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://mock@sentry.io/12345',
  tracesSampleRate: 1.0,
  debug: false,
});
