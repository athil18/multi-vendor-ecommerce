/**
 * Enterprise Production Readiness Probe
 * Verifies that the container / server is ready to accept production traffic.
 * 
 * @agent engineering-api-platform-engineer
 * @agent engineering-database-reliability-engineer
 * @agent observability-and-instrumentation
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: 'up' | 'down'; latencyMs?: number; error?: string }> = {};

  // 1. Database Ping Check with 3000ms Timeout Guard
  const dbStart = Date.now();
  try {
    const pingPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database ping timed out after 3000ms')), 3000)
    );
    await Promise.race([pingPromise, timeoutPromise]);
    checks.database = {
      status: 'up',
      latencyMs: Date.now() - dbStart,
    };
  } catch (err: any) {
    checks.database = {
      status: 'down',
      latencyMs: Date.now() - dbStart,
      error: err.message || 'Database ping timeout or connection failure',
    };
  }

  // 2. Memory Diagnostics
  const memoryUsage = process.memoryUsage ? process.memoryUsage() : null;
  const memoryStats = memoryUsage ? {
    heapUsedMB: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
    rssMB: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
  } : undefined;

  const isReady = checks.database.status === 'up';
  const totalDurationMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isReady ? 'ready' : 'unready',
      service: 'nexus-multi-vendor-ecommerce',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
      durationMs: totalDurationMs,
      timestamp: new Date().toISOString(),
      checks,
      system: {
        nodeVersion: process.version,
        memory: memoryStats,
      },
    },
    {
      status: isReady ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}
