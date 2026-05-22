import { env } from '../../config/env.js';
import { getRedis, SLOT_LOCK_PREFIX } from '../../config/redis.js';

export async function acquireSlotLock(slotId, userId) {
  const redis = getRedis();
  const key = `${SLOT_LOCK_PREFIX}${slotId}`;
  const result = await redis.set(key, userId, 'EX', env.SLOT_LOCK_TTL_SECONDS, 'NX');
  return result === 'OK';
}

export async function releaseSlotLock(slotId) {
  const redis = getRedis();
  await redis.del(`${SLOT_LOCK_PREFIX}${slotId}`);
}

export async function getSlotLockOwner(slotId) {
  const redis = getRedis();
  return redis.get(`${SLOT_LOCK_PREFIX}${slotId}`);
}
