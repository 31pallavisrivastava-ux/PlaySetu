import { prisma } from '../../config/db.js';
import { AppError } from '../../shared/errors/AppError.js';

export async function listPendingFacilities() {
  return prisma.facility.findMany({
    where: { status: 'PENDING' },
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function approveFacility(facilityId) {
  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility) throw new AppError('Facility not found', 404, 'NOT_FOUND');
  return prisma.facility.update({
    where: { id: facilityId },
    data: { status: 'ACTIVE' },
  });
}

export async function platformStats() {
  const [users, facilities, bookings] = await Promise.all([
    prisma.user.count(),
    prisma.facility.count({ where: { status: 'ACTIVE' } }),
    prisma.booking.count({ where: { bookingStatus: 'CONFIRMED' } }),
  ]);
  return { users, activeFacilities: facilities, confirmedBookings: bookings };
}
