/**
 * PostgreSQL Database Provider with Connection Pooling & Query Telemetry
 * 
 * @agent engineering-database-reliability-engineer
 * @agent engineering-database-optimizer
 * @agent 04-sql-query-agent
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let connectionString = process.env.DATABASE_URL || '';
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required to initialize PostgreSQL connection pool.');
}

// Prevent Node.js pg-connection-string security warning regarding libpq compatibility
if (
  connectionString.includes('sslmode=') &&
  !connectionString.includes('uselibpqcompat=') &&
  !connectionString.includes('sslmode=verify-full')
) {
  connectionString += (connectionString.includes('?') ? '&' : '?') + 'uselibpqcompat=true';
}

// Configure resilient connection pool with safety bounds & keep-alive
const isRemoteDb = connectionString.includes('sslmode=') || connectionString.includes('neon.tech');
const pool = new pg.Pool({
  connectionString,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: 300000, // 5 minutes (prevent rapid connection teardown & SSL re-negotiation)
  connectionTimeoutMillis: 15000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

import { logger } from './logger';

// Guard against unhandled pool errors
pool.on('error', (err) => {
  logger.error('[PostgreSQL Pool Error]: Unexpected client error on idle connection', { error: String(err) });
});

// Periodic lightweight keepalive ping to maintain connection warm state and avoid cold start spikes
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
      await pool.query('SELECT 1');
    } catch {
      // Ignored - will naturally reconnect on demand
    }
  }, 240000).unref(); // Every 4 minutes, unrefed to avoid blocking process exit
}

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;


