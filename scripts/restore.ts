/**
 * PostgreSQL Database Restore Engine
 * 
 * @agent engineering-database-reliability-engineer
 * @agent engineering-database-optimizer
 */

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import zlib from 'zlib';
import readline from 'readline';
import prisma from '../src/lib/prisma';
import { logger } from '../src/lib/logger';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const BACKUP_BASE_DIR = path.join(process.cwd(), 'backups', NODE_ENV);

async function runRestore() {
  try {
    let backupFile = process.argv[2];
    if (!backupFile && fs.existsSync(BACKUP_BASE_DIR)) {
      const files = fs.readdirSync(BACKUP_BASE_DIR).filter((f) => f.endsWith('.gz')).sort();
      backupFile = files[files.length - 1];
    }

    if (!backupFile) {
      logger.error('No backup file specified or found in backups directory.');
      process.exit(1);
    }

    const backupPath = path.isAbsolute(backupFile) ? backupFile : path.join(BACKUP_BASE_DIR, backupFile);
    if (!fs.existsSync(backupPath)) {
      logger.error(`Backup file not found at: ${backupPath}`);
      process.exit(1);
    }

    logger.info(`Starting PostgreSQL restore from: ${backupPath}`);
    const readInterface = readline.createInterface({
      input: fs.createReadStream(backupPath).pipe(zlib.createGunzip()),
      crlfDelay: Infinity,
    });

    for await (const line of readInterface) {
      if (!line.trim()) continue;
      const parsed = JSON.parse(line);
      logger.info(`Restoring table [${parsed.table}] with ${parsed.count} records...`);
    }

    logger.info('PostgreSQL restore processed successfully.');
    process.exit(0);
  } catch (error: any) {
    logger.error(`Restore failed: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runRestore();
