import { prisma } from '../../../config/db.js';
import * as bookingService from '../../bookings/service.js';
import { AppError } from '../../../shared/errors/AppError.js';

export const bookSlotTool = {
  type: 'function',
  function: {
    name: 'book_slot',
    description: 'Reserve a confirmed slot for the authenticated user and trigger confirmation. Requires prior user confirmation.',
    parameters: {
      type: 'object',
      properties: {
        venueId: { type: 'string', description: 'Facility id' },
        date: { type: 'string', description: 'ISO8601 date or YYYY-MM-DD' },
        timeSlot: { type: 'string', description: '"HH:MM-HH:MM"' },
        playerCount: {
          type: 'number',
          description: 'Number of players in the group (must match sport limits, e.g. 2–4 for badminton)',
        },
        userId: { type: 'string', description: 'Ignored — server uses authenticated session' },
      },
      required: ['venueId', 'date', 'timeSlot', 'playerCount'],
    },
  },
};

function normalizeDate(input) {
  return new Date(`${input.slice(0, 10)}T00:00:00.000Z`);
}

export async function runBookSlot(args, ctx = {}) {
  if (!ctx.userId) throw new AppError('Authentication required', 401, 'UNAUTHENTICATED');

  const [startTime, endTime] = (args.timeSlot ?? '').split('-').map((s) => s.trim());
  if (!startTime || !endTime) {
    throw new AppError('timeSlot must be "HH:MM-HH:MM"', 400, 'BAD_REQUEST');
  }

  const slot = await prisma.slot.findFirst({
    where: {
      date: normalizeDate(args.date),
      startTime,
      endTime,
      availability: 'AVAILABLE',
      court: { facilityId: args.venueId, status: 'ACTIVE' },
    },
    include: { court: { include: { facility: { select: { name: true, sportType: true } } } } },
    orderBy: { court: { pricePerHour: 'asc' } },
  });

  if (!slot) throw new AppError('No available slot matches that venue/date/time', 404, 'SLOT_UNAVAILABLE');

  const playerCount = Number(args.playerCount);
  const booking = await bookingService.createBooking(ctx.userId, slot.id, playerCount);
  return {
    bookingId: booking.id,
    status: booking.bookingStatus,
    playerCount: booking.playerCount,
    amount: Number(booking.totalAmount),
    venue: booking.slot?.court?.facility?.name,
    court: booking.slot?.court?.name,
    timeSlot: `${booking.slot?.startTime}-${booking.slot?.endTime}`,
  };
}
