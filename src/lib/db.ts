/**
 * Database Connection Utility
 * 
 * @agent engineering-database-reliability-engineer
 * @agent engineering-database-optimizer
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function dbConnect() {
  try {
    await prisma.$connect();
    return prisma;
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL database via Prisma', { error: String(error) });
    throw error;
  }
}

export { prisma };
export default dbConnect;
