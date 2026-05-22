import { runBookingExpiryJob } from './bookingExpiry.job.js';
import { logger } from '../shared/logger/logger.js';

const INTERVAL_MS = 60 * 1000;

export function startCronJobs() {
  runBookingExpiryJob().catch((err) => logger.error('bookingExpiry job failed', { err: err.message }));

  setInterval(() => {
    runBookingExpiryJob().catch((err) => logger.error('bookingExpiry job failed', { err: err.message }));
  }, INTERVAL_MS);

  logger.info('Cron jobs started');
}
