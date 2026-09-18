/**
 * PostgreSQL Database Backup Engine
 * 
 * @agent engineering-database-reliability-engineer
 * @agent engineering-database-optimizer
 */

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import zlib from 'zlib';
import prisma from '../src/lib/prisma';
import { logger } from '../src/lib/logger';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const BACKUP_BASE_DIR = path.join(process.cwd(), 'backups', NODE_ENV);

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function runBackup() {
  try {
    logger.info(`Starting PostgreSQL table export backup for environment: ${NODE_ENV}`);
    await ensureDir(BACKUP_BASE_DIR);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-pg-${NODE_ENV}-${timestamp}.json.gz`;
    const backupPath = path.join(BACKUP_BASE_DIR, backupFileName);

    const gzip = zlib.createGzip();
    const outStream = fs.createWriteStream(backupPath);
    gzip.pipe(outStream);

    const writeAsync = (data: string) => {
      return new Promise<void>((resolve) => {
        if (!gzip.write(data)) {
          gzip.once('drain', resolve);
        } else {
          resolve();
        }
      });
    };

    // Export core tables
    const [users, stores, categories, products, variants, orders, orderItems, ledgers] = await Promise.all([
      prisma.user.findMany(),
      prisma.store.findMany(),
      prisma.category.findMany(),
      prisma.product.findMany(),
      prisma.variant.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.financialLedger.findMany(),
    ]);

    await writeAsync(JSON.stringify({ table: 'users', count: users.length, data: users }) + '\n');
    await writeAsync(JSON.stringify({ table: 'stores', count: stores.length, data: stores }) + '\n');
    await writeAsync(JSON.stringify({ table: 'categories', count: categories.length, data: categories }) + '\n');
    await writeAsync(JSON.stringify({ table: 'products', count: products.length, data: products }) + '\n');
    await writeAsync(JSON.stringify({ table: 'variants', count: variants.length, data: variants }) + '\n');
    await writeAsync(JSON.stringify({ table: 'orders', count: orders.length, data: orders }) + '\n');
    await writeAsync(JSON.stringify({ table: 'order_items', count: orderItems.length, data: orderItems }) + '\n');
    await writeAsync(JSON.stringify({ table: 'financial_ledgers', count: ledgers.length, data: ledgers }) + '\n');

    gzip.end();
    await new Promise<void>((resolve) => outStream.on('finish', () => resolve()));

    const stats = fs.statSync(backupPath);
    logger.info(`PostgreSQL backup completed successfully. File: ${backupFileName} (${(stats.size / 1024).toFixed(2)} KB)`);

    process.exit(0);
  } catch (error: any) {
    logger.error(`Backup failed: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBackup();
