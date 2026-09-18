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
  }
  return redisConnection;
};
