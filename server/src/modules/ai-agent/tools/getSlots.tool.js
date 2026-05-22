import * as facilityService from '../../facilities/service.js';

export const getSlotsTool = {
  type: 'function',
  function: {
    name: 'get_slots',
    description: 'Get available time slots for a court on a given date (YYYY-MM-DD)',
    parameters: {
      type: 'object',
      properties: {
        courtId: { type: 'string' },
        date: { type: 'string', description: 'YYYY-MM-DD' },
      },
      required: ['courtId', 'date'],
    },
  },
};

export async function runGetSlots(args) {
  const slots = await facilityService.getAvailableSlots(args.courtId, args.date);
  return slots.map((s) => ({
    id: s.id,
    startTime: s.startTime,
    endTime: s.endTime,
    availability: s.availability,
  }));
}
