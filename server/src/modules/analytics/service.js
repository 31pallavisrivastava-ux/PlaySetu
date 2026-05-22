import { prisma } from '../../config/db.js';

export async function ownerDashboard(ownerId) {
  const facilities = await prisma.facility.findMany({
    where: { ownerId },
    include: {
      courts: {
        include: {
          slots: {
            include: {
              bookings: { where: { bookingStatus: 'CONFIRMED' } },
            },
          },
        },
      },
    },
  });

  let totalRevenue = 0;
  let confirmedBookings = 0;

  for (const f of facilities) {
    for (const c of f.courts) {
      for (const s of c.slots) {
        for (const b of s.bookings) {
          confirmedBookings += 1;
          totalRevenue += Number(b.totalAmount);
        }
      }
    }
  }

  return {
    facilityCount: facilities.length,
    confirmedBookings,
    totalRevenue,
    facilities: facilities.map((f) => ({ id: f.id, name: f.name, status: f.status, rating: f.rating })),
  };
}
