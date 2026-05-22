import { prisma } from '../../config/db.js';
import { AppError } from '../../shared/errors/AppError.js';

export async function createReview(userId, facilityId, { rating, review }) {
  const existing = await prisma.review.findUnique({
    where: { facilityId_userId: { facilityId, userId } },
  });
  if (existing) throw new AppError('You already reviewed this facility', 409, 'CONFLICT');

  const created = await prisma.review.create({
    data: { facilityId, userId, rating, review },
  });

  const agg = await prisma.review.aggregate({
    where: { facilityId },
    _avg: { rating: true },
  });
  await prisma.facility.update({
    where: { id: facilityId },
    data: { rating: agg._avg.rating ?? 0 },
  });

  return created;
}
