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

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:123@localhost:5432/marketplace?schema=public';

// Configure resilient connection pool with safety bounds
const pool = new pg.Pool({
  connectionString,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

import { logger } from './logger';

// Guard against unhandled pool errors
pool.on('error', (err) => {
  logger.error('[PostgreSQL Pool Error]: Unexpected client error on idle connection', { error: String(err) });
});

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


