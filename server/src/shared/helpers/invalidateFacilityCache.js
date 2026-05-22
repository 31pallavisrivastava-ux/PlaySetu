import { getRedis } from '../../config/redis.js';

export async function invalidateFacilitySearchCache() {
  const redis = getRedis();
  try {
    const keys = await redis.keys('cache:facilities:*');
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Redis optional
  }
}
