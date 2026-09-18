import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '@/lib/errors';
import { apiError } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import jwt from 'jsonwebtoken';

type RouteHandlerContext<T = any> = { params: Promise<T> };
export type AsyncRouteHandler<T = any> = (
  req: NextRequest,
  context: RouteHandlerContext<T>
) => Promise<NextResponse>;

/**
 * Extracts authentication context safely without DB verification for fast logging
 */
function extractUserContext(req: NextRequest): { userId?: string; role?: string } {
  let token = req.cookies.get('auth_token')?.value;
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (token) {
    try {
      const decoded = jwt.decode(token) as { id?: string; role?: string } | null;
      if (decoded) {
        return { userId: decoded.id, role: decoded.role };
      }
    } catch {
      // Ignore token decoding errors for logging
    }
  }
  return {};
}

/**
 * Sanitizes request URLs and search params for safe logging
 */
function sanitizeUrl(url: string): string {
  const parsed = new URL(url);
  // e.g. remove sensitive query params like ?token=abc
  const sensitiveParams = ['token', 'password', 'secret', 'key'];
  for (const param of sensitiveParams) {
    if (parsed.searchParams.has(param)) {
      parsed.searchParams.set(param, '[REDACTED]');
    }
  }
  return parsed.pathname + parsed.search;
}

export function withErrorHandler<T = any>(handler: AsyncRouteHandler<T>): AsyncRouteHandler<T> {
  return async (req: NextRequest, context: RouteHandlerContext<T>) => {
    const startTime = Date.now();
    
    // Fallback ID generation if middleware didn't set one
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    const { userId, role } = extractUserContext(req);
    const route = sanitizeUrl(req.url);

    let response: NextResponse;
    let statusCode = 200;
    let errorToLog: any = null;
    let errorCode: string | undefined;

    try {
      response = await handler(req, context);
      statusCode = response.status;
    } catch (error: any) {
      errorToLog = error;
      let appError: AppError;

      if (error instanceof AppError) {
        appError = error;
      } else if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(error.format())) {
          if (key !== '_errors' && value && typeof value === 'object' && '_errors' in value) {
            formattedErrors[key] = (value as any)._errors;
          }
        }
        appError = new ValidationError('Validation failed', formattedErrors);
      } else {
        // Unhandled exceptions
        appError = new AppError('Internal server error', 500, 'INTERNAL_ERROR', undefined, false);
      }

      errorCode = appError.code;
      statusCode = appError.status;

      const isDev = process.env.NODE_ENV === 'development';
      response = apiError({
        message: appError.message,
        status: appError.status,
        code: appError.code,
        errors: appError.errors,
        ...(isDev && !appError.isOperational && error.stack ? { stack: error.stack } : {})
      } as any);
    }

    const durationMs = Date.now() - startTime;
    
    // Always inject request ID into response for client correlation
    response.headers.set('x-request-id', requestId);

    const logPayload: Record<string, any> = {
      requestId,
      method: req.method,
      route,
      statusCode,
      durationMs,
    };

    if (userId) logPayload.userId = userId;
    if (role) logPayload.role = role;

    // 1. Performance Warning
    if (durationMs > 1000 && statusCode < 400) {
      logger.warn('Slow API Request', logPayload);
    }

    // 2. Error Trace Logging
    if (errorToLog) {
      if (errorToLog instanceof AppError && errorToLog.isOperational) {
        logPayload.errorCode = errorCode;
        logPayload.error = errorToLog.message;
        logger.warn('API Operational Error', logPayload);
      } else {
        logPayload.error = errorToLog.message || 'Unknown error';
        logPayload.stack = errorToLog.stack;
        logPayload.errorCode = 'INTERNAL_ERROR';
        logger.error('Unexpected API Error', logPayload);
      }
    } else {
      // 3. Success Trace Logging
      logger.info('API Request Completed', logPayload);
    }

    return response;
  };
}
