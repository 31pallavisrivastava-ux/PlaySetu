import { logger } from '../../../shared/logger/logger.js';

/** Facility discovery stub — wire Maps crawl / owner onboarding later */
export async function submitPendingListing(payload) {
  logger.info('Discovery agent: pending listing', payload);
  return { status: 'pending_review', ...payload };
}
