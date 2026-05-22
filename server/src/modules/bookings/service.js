import { prisma } from '../../config/db.js';
import { AppError } from '../../shared/errors/AppError.js';
import { acquireSlotLock, releaseSlotLock } from '../../shared/helpers/slotLock.js';

export async function createBooking(userId, slotId) {
  const acquired = await acquireSlotLock(slotId, userId);
  if (!acquired) {
    throw new AppError('Slot is temporarily locked by another user', 409, 'SLOT_LOCKED');
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM slots WHERE id = ${slotId} FOR UPDATE`;
      const slot = await tx.slot.findUnique({ where: { id: slotId } });
      if (!slot) throw new AppError('Slot not found', 404, 'NOT_FOUND');
      if (slot.availability === 'BOOKED') {
        throw new AppError('Slot already booked', 409, 'SLOT_UNAVAILABLE');
      }

      const court = await tx.court.findUnique({
        where: { id: slot.courtId },
        include: { facility: true },
      });

      await tx.slot.update({
        where: { id: slotId },
        data: { availability: 'BOOKED', lockExpiresAt: null },
      });

      return tx.booking.create({
        data: {
          userId,
          slotId,
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'PENDING',
          totalAmount: court.pricePerHour,
        },
        include: {
          slot: { include: { court: { include: { facility: true } } } },
        },
      });
    });

    await releaseSlotLock(slotId);
    return booking;
  } catch (err) {
    await releaseSlotLock(slotId);
    throw err;
  }
}

export async function cancelBooking(bookingId, userId) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { slot: true },
  });
  if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');
  if (booking.bookingStatus === 'CANCELLED') {
    throw new AppError('Booking already cancelled', 400, 'ALREADY_CANCELLED');
  }

  return prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { bookingStatus: 'CANCELLED' },
    });

    await tx.slot.update({
      where: { id: booking.slotId },
      data: { availability: 'AVAILABLE', lockExpiresAt: null },
    });

    await releaseSlotLock(booking.slotId);
    return tx.booking.findUnique({
      where: { id: bookingId },
      include: { slot: { include: { court: { include: { facility: true } } } } },
    });
  });
}

export async function getMyBookings(userId) {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      slot: {
        include: {
          court: {
            include: {
              facility: { select: { id: true, name: true, area: true, address: true } },
            },
          },
        },
      },
    },
  });
}

/** Cleans up abandoned LOCKED slots from older flows */
export async function releaseExpiredLocks() {
  const expired = await prisma.slot.findMany({
    where: {
      availability: 'LOCKED',
      lockExpiresAt: { lt: new Date() },
    },
  });

  for (const slot of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.slot.update({
        where: { id: slot.id },
        data: { availability: 'AVAILABLE', lockExpiresAt: null },
      });
      await tx.booking.updateMany({
        where: { slotId: slot.id, bookingStatus: 'PENDING' },
        data: { bookingStatus: 'CANCELLED' },
      });
    });
    await releaseSlotLock(slot.id);
  }
  return expired.length;
}
