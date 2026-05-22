import crypto from 'crypto';
import { prisma } from '../../config/db.js';
import { getRedis } from '../../config/redis.js';
import { AppError } from '../../shared/errors/AppError.js';
import { haversineKm } from '../../shared/utils/distance.js';
import { CACHE_KEYS, CACHE_TTL } from '../../shared/constants/index.js';

export async function createFacility(ownerId, data) {
  return prisma.facility.create({
    data: { ...data, ownerId, status: 'PENDING' },
    include: { courts: true },
  });
}

export async function getFacilityById(id) {
  const facility = await prisma.facility.findUnique({
    where: { id },
    include: {
      courts: { where: { status: 'ACTIVE' } },
      reviews: { take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } },
    },
  });
  if (!facility) throw new AppError('Facility not found', 404, 'NOT_FOUND');
  return facility;
}

export async function searchFacilities(query) {
  const cacheKey = CACHE_KEYS.facilitiesSearch(
    crypto.createHash('md5').update(JSON.stringify(query)).digest('hex')
  );
  const redis = getRedis();
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const where = { status: 'ACTIVE' };
  if (query.sportType) where.sportType = query.sportType;
  if (query.area) where.area = { contains: query.area };

  const facilities = await prisma.facility.findMany({
    where,
    include: {
      courts: {
        where: { status: 'ACTIVE', ...(query.maxPrice ? { pricePerHour: { lte: query.maxPrice } } : {}) },
      },
    },
    take: query.limit,
    skip: (query.page - 1) * query.limit,
    orderBy: { rating: 'desc' },
  });

  let results = facilities.map((f) => ({
    ...f,
    distanceKm:
      query.lat != null && query.lng != null
        ? haversineKm(query.lat, query.lng, f.latitude, f.longitude)
        : null,
  }));

  if (query.lat != null && query.lng != null) {
    results = results
      .filter((f) => f.distanceKm == null || f.distanceKm <= query.radiusKm)
      .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  }

  if (query.skill) {
    results = results.filter((f) => {
      if (!Array.isArray(f.skillLevels) || f.skillLevels.length === 0) return true;
      return f.skillLevels.includes(query.skill);
    });
  }

  const payload = { items: results, page: query.page, limit: query.limit };
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(payload)).catch(() => {});
  return payload;
}

export async function createCourt(facilityId, ownerId, data) {
  const facility = await prisma.facility.findFirst({ where: { id: facilityId, ownerId } });
  if (!facility) throw new AppError('Facility not found or access denied', 404, 'NOT_FOUND');

  return prisma.court.create({
    data: { facilityId, ...data },
  });
}

export async function generateSlots(ownerId, { courtId, date, slots }) {
  const court = await prisma.court.findFirst({
    where: { id: courtId, facility: { ownerId } },
  });
  if (!court) throw new AppError('Court not found', 404, 'NOT_FOUND');

  const slotDate = new Date(`${date}T00:00:00.000Z`);
  const created = [];
  for (const s of slots) {
    try {
      const slot = await prisma.slot.create({
        data: {
          courtId,
          date: slotDate,
          startTime: s.startTime,
          endTime: s.endTime,
          availability: 'AVAILABLE',
        },
      });
      created.push(slot);
    } catch {
      // skip duplicate slot windows
    }
  }
  return created;
}

export async function getAvailableSlots(courtId, date) {
  const slotDate = new Date(`${date}T00:00:00.000Z`);
  return prisma.slot.findMany({
    where: {
      courtId,
      date: slotDate,
      availability: { in: ['AVAILABLE', 'LOCKED'] },
    },
    orderBy: { startTime: 'asc' },
  });
}
