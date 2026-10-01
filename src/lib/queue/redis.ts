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
};

// Singleton Redis instance for queues
let redisConnection: Redis;

export const getRedisConnection = () => {
  if (!redisConnection) {
    redisConnection = new Redis(getRedisUrl(), redisOptions);
    redisConnection.on('error', (err) => {
      // Prevent unhandled error event crash on initial cold connect or transient blip
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Redis] Transient connection notice:', err.message);
      }
    });
  }
  return redisConnection;
};
