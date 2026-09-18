import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import connectDB from '@/lib/db';
import { getRedisConnection } from '@/lib/queue/redis';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';
  const checks: any = {};
  
  try {
    // 1. Database check via Prisma
    try {
      await connectDB();
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
      checks.database = dbStatus;
    } catch (e: any) {
      checks.database = 'error: ' + e.message;
    }

    // 2. Redis check
    try {
      const redis = getRedisConnection();
      await redis.ping();
      redisStatus = 'connected';
      checks.redis = redisStatus;
    } catch (e: any) {
      checks.redis = 'error: ' + e.message;
    }

    // 3. Environment check
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
    const missingEnvs = requiredEnvVars.filter(env => !process.env[env]);
    checks.environment = missingEnvs.length === 0 ? 'valid' : `missing: ${missingEnvs.join(', ')}`;

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
    return NextResponse.json({ 
      status: 'degraded', 
      error: error.message,
      checks,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

