import { logger } from '../../shared/logger/logger.js';

export async function notifyUser(userId, { type, title, body, meta }) {
  logger.info('Notification', { userId, type, title, body, meta });
  return { userId, type, title, body, sentAt: new Date().toISOString() };
}
