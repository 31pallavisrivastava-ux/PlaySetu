import Redis from 'ioredis';
import { env } from './env.js';

let redisClient = null;

export function getRedis() {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 3 });
  }
  return redisClient;
}

export async function connectRedis() {
  const redis = getRedis();
  await redis.ping();
  return redis;
}

export const SLOT_LOCK_PREFIX = 'lock:slot:';
