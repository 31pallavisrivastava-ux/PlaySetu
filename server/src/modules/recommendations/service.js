import { prisma } from '../../config/db.js';
import { haversineKm } from '../../shared/utils/distance.js';

export async function recommendForUser(userId, { sportType, maxPrice, limit = 5 } = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const preferred = Array.isArray(user?.preferredSports) ? user.preferredSports : [];
  const targetSport = sportType ?? preferred[0];

  const facilities = await prisma.facility.findMany({
    where: {
      status: 'ACTIVE',
      ...(targetSport ? { sportType: targetSport } : {}),
    },
    include: { courts: true, reviews: true },
    take: 50,
  });

  const scored = facilities.map((f) => {
    let score = f.rating * 10;
    if (user?.latitude != null && user?.longitude != null) {
      const dist = haversineKm(user.latitude, user.longitude, f.latitude, f.longitude);
      score += Math.max(0, 20 - dist * 2);
    }
    if (user?.location && f.area?.toLowerCase().includes(user.location.toLowerCase())) {
      score += 15;
    }
    const minPrice = Math.min(...f.courts.map((c) => Number(c.pricePerHour)), Infinity);
    if (maxPrice && minPrice <= maxPrice) score += 10;
    if (preferred.includes(f.sportType)) score += 12;
    return { ...f, score, minPrice: Number.isFinite(minPrice) ? minPrice : null };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...rest }) => ({ ...rest, recommendationScore: score }));
}
