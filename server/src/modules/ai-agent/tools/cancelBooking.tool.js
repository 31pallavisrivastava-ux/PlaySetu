import * as bookingService from '../../bookings/service.js';
import { AppError } from '../../../shared/errors/AppError.js';

export const cancelBookingTool = {
  type: 'function',
  function: {
    name: 'cancel_booking',
    description: 'Cancel an active booking owned by the authenticated user. Refund handled by policy where applicable.',
    parameters: {
      type: 'object',
      properties: {
        bookingId: { type: 'string' },
      },
      required: ['bookingId'],
    },
  },
};

export async function runCancelBooking(args, ctx = {}) {
  if (!ctx.userId) throw new AppError('Authentication required', 401, 'UNAUTHENTICATED');
  const booking = await bookingService.cancelBooking(args.bookingId, ctx.userId);
  return {
    bookingId: booking.id,
    status: booking.bookingStatus,
    refundEligible: booking.paymentStatus === 'PAID',
    venue: booking.slot?.court?.facility?.name,
    timeSlot: `${booking.slot?.startTime}-${booking.slot?.endTime}`,
  };
}
