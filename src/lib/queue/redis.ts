import { Redis } from 'ioredis';

const isPlaceholderRedis = 
  !process.env.REDIS_URL || 
  process.env.REDIS_URL.includes('sample.upstash.io') ||
  process.env.REDIS_URL.includes('default:token');

const getRedisUrl = () => {
  if (isPlaceholderRedis) {
    return 'redis://127.0.0.1:6379';
  }
  return process.env.REDIS_URL!;
};

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  connectTimeout: 10000,
  keepAlive: 10000,
  enableOfflineQueue: true,
  retryStrategy: (times: number) => (times > 5 ? null : Math.min(times * 1000, 3000)),
};

// Singleton Redis instance for queues
let redisConnection: Redis | null = null;

export const isRedisReady = (): boolean => {
  if (isPlaceholderRedis) return false;
  if (!redisConnection) return false;
  return redisConnection.status === 'ready';
};

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

