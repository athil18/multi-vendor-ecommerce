import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import connectDB from '@/lib/db';
import { getRedisConnection } from '@/lib/queue/redis';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';
  const checks: Record<string, string> = {};
  
  try {
    // 1. Database check via Prisma
    try {
      await connectDB();
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
      checks.database = 'connected';
    } catch (e: any) {
      logger.error('Health check: database connection failed', { error: String(e.message || e) });
      checks.database = 'unavailable';
    }

    // 2. Redis check
    try {
      const redis = getRedisConnection();
      await redis.ping();
      redisStatus = 'connected';
      checks.redis = 'connected';
    } catch (e: any) {
      logger.error('Health check: redis connection failed', { error: String(e.message || e) });
      checks.redis = 'unavailable';
    }

    // 3. Environment check
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
    const missingEnvs = requiredEnvVars.filter(env => !process.env[env]);
    if (missingEnvs.length > 0) {
      logger.warn('Health check: missing required environment variables', { missingCount: missingEnvs.length });
      checks.environment = 'degraded';
    } else {
      checks.environment = 'valid';
    }

    // 4. Stripe config check
    checks.stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_') ? 'configured' : 'unconfigured';

    const isHealthy = dbStatus === 'connected' && redisStatus === 'connected' && checks.environment === 'valid';
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      durationMs,
      checks,
      timestamp: new Date().toISOString()
    }, { status: isHealthy ? 200 : 503 });

  } catch (error: any) {
    logger.error('Health check: unhandled failure', { error: String(error.message || error) });
    return NextResponse.json({ 
      status: 'degraded', 
      checks: { system: 'degraded' },
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

