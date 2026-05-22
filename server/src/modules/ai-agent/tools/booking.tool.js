import * as bookingService from '../../bookings/service.js';

export const createBookingTool = {
  type: 'function',
  function: {
    name: 'create_booking',
    description: 'Book a slot immediately (confirmed; user pays at venue)',
    parameters: {
      type: 'object',
      properties: {
        slotId: { type: 'string' },
      },
      required: ['slotId'],
    },
  },
};

export async function runCreateBooking(args, userId) {
  const booking = await bookingService.createBooking(userId, args.slotId);
  return {
    bookingId: booking.id,
    status: booking.bookingStatus,
    amount: Number(booking.totalAmount),
    facility: booking.slot?.court?.facility?.name,
    slot: `${booking.slot?.startTime}-${booking.slot?.endTime}`,
  };
}
