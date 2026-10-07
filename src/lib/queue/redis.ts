import { Redis } from 'ioredis';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  // Fallback for local development if REDIS_URL is not set
  return 'redis://127.0.0.1:6379';
};

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  connectTimeout: 5000,
  commandTimeout: 2500,
};

// Singleton Redis instance for queues
let redisConnection: Redis;

export const getRedisConnection = () => {
  if (!redisConnection) {
    redisConnection = new Redis(getRedisUrl(), redisOptions);
    redisConnection.on('error', (err) => {
      // Prevent unhandled error event crash; log warning
      console.warn('[Redis Resilient Warning]:', err.message);
    });
  }
  return redisConnection;
};
