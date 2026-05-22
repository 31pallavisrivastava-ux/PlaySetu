import { prisma } from '../../config/db.js';
import { AppError } from '../../shared/errors/AppError.js';
import { invalidateFacilitySearchCache } from '../../shared/helpers/invalidateFacilityCache.js';

function facilityWhere(ownerId, facilityId) {
  return {
    ownerId,
    ...(facilityId ? { id: facilityId } : {}),
  };
}

export async function getOwnerFacilities(ownerId) {
  return prisma.facility.findMany({
    where: { ownerId },
    orderBy: { name: 'asc' },
    include: {
      courts: { select: { id: true, name: true, pricePerHour: true, status: true } },
      _count: { select: { reviews: true } },
    },
  });
}

export async function getOwnerFacilityById(ownerId, facilityId) {
  const facility = await prisma.facility.findFirst({
    where: { id: facilityId, ownerId },
    include: { courts: true },
  });
  if (!facility) throw new AppError('Facility not found', 404, 'NOT_FOUND');
  return facility;
}

export async function createOwnerFacility(ownerId, data) {
  const facility = await prisma.facility.create({
    data: {
      ...data,
      ownerId,
      status: 'ACTIVE',
    },
    include: { courts: true },
  });
  await invalidateFacilitySearchCache();
  return facility;
}

export async function updateOwnerFacility(ownerId, facilityId, data) {
  await assertOwnerFacility(ownerId, facilityId);
  const facility = await prisma.facility.update({
    where: { id: facilityId },
    data,
    include: { courts: true },
  });
  await invalidateFacilitySearchCache();
  return facility;
}

export async function setOwnerFacilityStatus(ownerId, facilityId, status) {
  await assertOwnerFacility(ownerId, facilityId);
  const facility = await prisma.facility.update({
    where: { id: facilityId },
    data: { status },
    include: { courts: true },
  });
  await invalidateFacilitySearchCache();
  return facility;
}

export async function deleteOwnerFacility(ownerId, facilityId) {
  await assertOwnerFacility(ownerId, facilityId);

  const activeBookings = await prisma.booking.count({
    where: {
      bookingStatus: { in: ['CONFIRMED', 'PENDING'] },
      slot: { court: { facilityId } },
    },
  });
  if (activeBookings > 0) {
    throw new AppError(
      'Cannot delete a venue with active bookings. Disable it instead.',
      400,
      'HAS_BOOKINGS'
    );
  }

  await prisma.facility.delete({ where: { id: facilityId } });
  await invalidateFacilitySearchCache();
  return { deleted: true };
}

export async function getOwnerBookings(ownerId, query) {
  const facilities = await prisma.facility.findMany({
    where: facilityWhere(ownerId, query.facilityId),
    select: { id: true },
  });
  const facilityIds = facilities.map((f) => f.id);
  if (facilityIds.length === 0) return [];

  const slotDate = query.date ? new Date(`${query.date}T00:00:00.000Z`) : undefined;

  return prisma.booking.findMany({
    where: {
      ...(query.status ? { bookingStatus: query.status } : {}),
      slot: {
        court: { facilityId: { in: facilityIds } },
        ...(slotDate ? { date: slotDate } : {}),
      },
    },
    orderBy: [{ createdAt: 'desc' }],
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      slot: {
        include: {
          court: {
            include: {
              facility: { select: { id: true, name: true, area: true } },
            },
          },
        },
      },
    },
  });
}

export async function getOwnerSlots(ownerId, query) {
  const dateStr = query.date ?? new Date().toISOString().slice(0, 10);
  const slotDate = new Date(`${dateStr}T00:00:00.000Z`);

  const facilities = await prisma.facility.findMany({
    where: facilityWhere(ownerId, query.facilityId),
    include: {
      courts: {
        include: {
          slots: {
            where: { date: slotDate },
            orderBy: { startTime: 'asc' },
            include: {
              bookings: {
                where: { bookingStatus: { not: 'CANCELLED' } },
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: {
                  user: { select: { id: true, name: true, phone: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return { date: dateStr, facilities };
}

export async function getOwnerSummary(ownerId) {
  const facilities = await prisma.facility.findMany({
    where: { ownerId },
    select: { id: true, name: true, status: true, rating: true },
  });

  const facilityIds = facilities.map((f) => f.id);
  if (facilityIds.length === 0) {
    return {
      facilityCount: 0,
      todayBookings: 0,
      upcomingConfirmed: 0,
      totalRevenue: 0,
      facilities: [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayBookings, upcomingConfirmed, revenueAgg] = await Promise.all([
    prisma.booking.count({
      where: {
        bookingStatus: 'CONFIRMED',
        slot: {
          court: { facilityId: { in: facilityIds } },
          date: today,
        },
      },
    }),
    prisma.booking.count({
      where: {
        bookingStatus: 'CONFIRMED',
        slot: {
          court: { facilityId: { in: facilityIds } },
          date: { gte: today },
        },
      },
    }),
    prisma.booking.aggregate({
      where: {
        bookingStatus: 'CONFIRMED',
        slot: { court: { facilityId: { in: facilityIds } } },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    facilityCount: facilities.length,
    todayBookings,
    upcomingConfirmed,
    totalRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
    facilities,
  };
}

export async function assertOwnerFacility(ownerId, facilityId) {
  const facility = await prisma.facility.findFirst({
    where: { id: facilityId, ownerId },
  });
  if (!facility) throw new AppError('Facility not found', 404, 'NOT_FOUND');
  return facility;
}
