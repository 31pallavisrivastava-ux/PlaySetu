import * as bookingService from '../modules/bookings/service.js';
import { logger } from '../shared/logger/logger.js';

export async function runBookingExpiryJob() {
  const released = await bookingService.releaseExpiredLocks();
  if (released > 0) {
    logger.info(`Released ${released} expired slot locks`);
  }
  return released;
}
