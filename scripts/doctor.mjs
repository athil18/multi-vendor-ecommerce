import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { Redis } from 'ioredis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🩺 ========================================================');
console.log('🩺 NEXUS E-COMMERCE PLATFORM HEALTH & PRE-FLIGHT CHECK');
console.log('🩺 ========================================================\n');

let issuesFound = 0;

// 1. Check .env file
const envPath = path.join(rootDir, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file missing! Create one by copying .env.example');
  issuesFound++;
} else {
  console.log('✅ .env file detected.');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredKeys = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'REDIS_URL',
    'NEXT_PUBLIC_APP_URL'
  ];

  for (const key of requiredKeys) {
    if (!envContent.includes(`${key}=`)) {
      console.warn(`⚠️ Warning: Missing recommended key: ${key}`);
      issuesFound++;
    } else {
      console.log(`   ✓ Key found: ${key}`);
    }
  }
}

// 2. Test PostgreSQL Database
console.log('\n🐘 Testing Database Connection (PostgreSQL / Neon)...');
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not found in process environment.');
  issuesFound++;
} else {
  try {
    const isRemote = dbUrl.includes('sslmode=') || dbUrl.includes('neon.tech');
    const pool = new pg.Pool({
      connectionString: dbUrl,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 15000,
    });
    const client = await pool.connect();
    const res = await client.query('SELECT 1 as connected, version()');
    console.log(`✅ Database connection successful! (PostgreSQL version: ${res.rows[0].version.split(' ')[1]})`);
    client.release();
    await pool.end();
  } catch (err) {
    console.error(`❌ Database connection failed: ${err.message}`);
    console.error('   👉 Tip: If using Neon serverless, allow up to 15 seconds for resume from sleep.');
    issuesFound++;
  }
}

// 3. Test Redis Connectivity
console.log('\n⚡ Testing Redis / Upstash Cache Connection...');
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.warn('⚠️ REDIS_URL not set; local fallback will be used.');
} else {
  try {
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
    });
    await redis.connect();
    const pong = await redis.ping();
    console.log(`✅ Redis connection verified (PING -> ${pong})`);
    redis.disconnect();
  } catch (err) {
    console.warn(`⚠️ Redis notice: ${err.message} (App will use in-memory fallback)`);
  }
}

// 4. Check Prisma Client
console.log('\n💎 Verifying Prisma Client...');
const prismaClientPath = path.join(rootDir, 'node_modules', '@prisma', 'client');
if (fs.existsSync(prismaClientPath)) {
  console.log('✅ Prisma client generated and present.');
} else {
  console.error('❌ Prisma client not generated. Run: npm run db:generate');
  issuesFound++;
}

// 5. Summary
console.log('\n========================================================');
if (issuesFound === 0) {
  console.log('🎉 ALL SYSTEMS GO! Your environment is completely healthy.');
  console.log('🚀 Run `npm run dev` to start your application.');
} else {
  console.log(`⚠️ Finished with ${issuesFound} notice(s). Check the items above.`);
}
console.log('========================================================\n');

process.exit(issuesFound > 0 ? 1 : 0);
