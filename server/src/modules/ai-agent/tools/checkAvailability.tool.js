import { prisma } from '../../../config/db.js';
import { getCourtPlayerCapacity } from '../../../shared/constants/sportPlayerLimits.js';

export const checkAvailabilityTool = {
  type: 'function',
  function: {
    name: 'check_availability',
    description:
      'Check real-time slot availability for a venue on a given date. Optionally filter by a specific timeSlot like "10:00-11:00".',
    parameters: {
      type: 'object',
      properties: {
        venueId: { type: 'string', description: 'Facility (venue) id' },
        date: { type: 'string', description: 'ISO8601 date or YYYY-MM-DD' },
        timeSlot: {
          type: 'string',
          description: 'Optional "HH:MM-HH:MM" — narrows results to this window',
        },
      },
      required: ['venueId', 'date'],
    },
  },
};

function normalizeDate(input) {
  if (!input) return null;
  const ymd = input.slice(0, 10);
  return new Date(`${ymd}T00:00:00.000Z`);
}

function parseTimeSlot(ts) {
  if (!ts) return null;
  const [start, end] = ts.split('-').map((s) => s.trim());
  return { start, end };
}

export async function runCheckAvailability(args) {
  const slotDate = normalizeDate(args.date);
  if (!slotDate) return { venueId: args.venueId, date: args.date, slots: [] };

  const where = {
    date: slotDate,
    availability: { in: ['AVAILABLE', 'LOCKED'] },
    court: { facilityId: args.venueId, status: 'ACTIVE' },
  };

  const range = parseTimeSlot(args.timeSlot);
  if (range?.start) where.startTime = range.start;
  if (range?.end) where.endTime = range.end;

  const slots = await prisma.slot.findMany({
    where,
    orderBy: [{ startTime: 'asc' }],
    include: {
      court: {
        select: {
          id: true,
          name: true,
          pricePerHour: true,
          minPlayers: true,
          maxPlayers: true,
          facility: { select: { sportType: true } },
        },
      },
    },
  });

  return {
    venueId: args.venueId,
    date: args.date,
    slots: slots.map((s) => {
      const capacity = getCourtPlayerCapacity(s.court, s.court.facility.sportType);
      return {
        slotId: s.id,
        courtId: s.court.id,
        courtName: s.court.name,
        startTime: s.startTime,
        endTime: s.endTime,
        pricePerHour: Number(s.court.pricePerHour),
        availability: s.availability,
        minPlayers: capacity.minPlayers,
        maxPlayers: capacity.maxPlayers,
      };
    }),
  };
}
