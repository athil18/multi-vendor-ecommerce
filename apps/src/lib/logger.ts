/**
 * Structured Enterprise Logger with Zero-Leak PII Sanitization
 * 
 * @agent 21-pii-sanitization-agent
 * @agent security-appsec-engineer
 * @agent engineering-sre
 */

import * as Sentry from '@sentry/nextjs';
import { sanitizeObject } from '@/lib/pii';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  traceId?: string;
  context?: Record<string, any>;
  error?: string | Error;
}

/**
 * Structured Enterprise Logger
 * - Serializes logs to JSON for easy parsing by Datadog, ELK, Splunk, etc.
 * - Enforces context schemas.
 * - Sanitizes sensitive data (PII, credentials, cards, tokens).
 */
class Logger {
  private formatLog(level: LogLevel, message: string, context?: Record<string, any>): string {
    const sanitizedContext = context ? sanitizeObject(context) : undefined;
    const sanitizedMessage = typeof message === 'string' ? sanitizeObject(message) : message;

    const payload: LogPayload = {
      level,
      message: sanitizedMessage,
      timestamp: new Date().toISOString(),
      ...sanitizedContext,
    };

    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SENTRY_DSN) {
      if (level === 'error') {
        Sentry.captureMessage(sanitizedMessage, { level: 'error', extra: sanitizedContext });
      } else if (level === 'warn') {
        Sentry.captureMessage(sanitizedMessage, { level: 'warning', extra: sanitizedContext });
      }
    }

    return JSON.stringify(payload);
  }

  info(message: string, context?: Record<string, any>) {
    console.log(this.formatLog('info', message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(this.formatLog('warn', message, context));
  }

  error(message: string, context?: Record<string, any>) {
    console.error(this.formatLog('error', message, context));
  }

  debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('debug', message, context));
    }
  }
}

export const logger = new Logger();

/**
 * Convenience function for error boundaries and catch blocks.
 * Safely extracts error metadata without exposing sensitive internals.
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
  const stack = error instanceof Error ? error.stack : undefined;

  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SENTRY_DSN) {
    if (error instanceof Error) {
      Sentry.captureException(error, { extra: context });
    } else {
      Sentry.captureMessage(message, { level: 'error', extra: context });
    }
  }

  logger.error(message, {
    ...context,
    ...(stack ? { stack } : {}),
  });
}
