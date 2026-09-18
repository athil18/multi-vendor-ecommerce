import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import prisma from '@/lib/prisma';

vi.mock('next/headers', () => {
  const cookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };
  return {
    cookies: () => Promise.resolve(cookieStore),
  };
});

vi.mock('bullmq', () => {
  class MockQueue {
    add = vi.fn().mockResolvedValue({ id: 'mock-job-id' });
    on = vi.fn();
  }
  class MockWorker {
    on = vi.fn();
  }
  return {
    Queue: MockQueue,
    Worker: MockWorker,
  };
});

const inMemoryRedisStore = new Map<string, { tokens: number; lastRefill: number }>();

vi.mock('ioredis', () => {
  class MockRedis {
    ping = vi.fn().mockResolvedValue('PONG');
    on = vi.fn();
    add = vi.fn();
    defineCommand = vi.fn();

    keys = vi.fn(async (pattern: string) => {
      const prefix = pattern.replace(/\*/g, '');
      const matchedKeys: string[] = [];
      for (const k of inMemoryRedisStore.keys()) {
        if (k.startsWith(prefix)) {
          matchedKeys.push(k);
        }
      }
      return matchedKeys;
    });

    del = vi.fn(async (...keys: string[]) => {
      let count = 0;
      for (const k of keys) {
        if (inMemoryRedisStore.delete(k)) {
          count++;
        }
      }
      return count;
    });

    eval = vi.fn(async (
      _script: string,
      _numKeys: number,
      key: string,
      limit: number,
      windowSeconds: number,
      now: number,
      resetAt: number
    ) => {
      const record = inMemoryRedisStore.get(key);
      const windowMs = windowSeconds * 1000;

      if (!record) {
        const tokens = limit - 1;
        inMemoryRedisStore.set(key, { tokens, lastRefill: now });
        return [1, tokens, windowMs, windowSeconds, limit, resetAt];
      }

      const elapsed = now - record.lastRefill;
      if (elapsed > windowMs) {
        const tokens = limit - 1;
        inMemoryRedisStore.set(key, { tokens, lastRefill: now });
        return [1, tokens, windowMs, windowSeconds, limit, resetAt];
      }

      const resetMs = windowMs - elapsed;
      const retryAfterSeconds = Math.ceil(resetMs / 1000);
      const currentResetAt = record.lastRefill + windowMs;

      if (record.tokens > 0) {
        record.tokens -= 1;
        inMemoryRedisStore.set(key, record);
        return [1, record.tokens, resetMs, retryAfterSeconds, limit, currentResetAt];
      }

      return [0, 0, resetMs, retryAfterSeconds, limit, currentResetAt];
    });
  }
  return {
    Redis: MockRedis,
    default: MockRedis,
  };
});

beforeAll(async () => {
  process.env.JWT_SECRET = 'supersecretkey123456789012345678901234567890';
  process.env.JWT_REFRESH_SECRET = 'superrefreshsecret123456789012345678901234567890';
  try {
    await prisma.$connect();
  } catch {
    // Database connection may not be live in pure unit-test runs
  }
}, 30000);

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // Silent disconnect
  }
});

afterEach(async () => {
  // Clean database tables in reverse order of FK constraints using lowercase mapped names
  const tablenames = [
    'transfer_logs', 'event_logs', 'file_assets', 'wishlists',
    'transaction_lines', 'journal_entries', 'financial_ledgers', 'disputes',
    'reviews', 'order_items', 'orders', 'coupons', 'variants',
    'products', 'categories', 'stores', 'addresses', 'users'
  ];

  for (const table of tablenames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch {
      // Ignore if table does not exist or DB offline in unit test
    }
  }
});

