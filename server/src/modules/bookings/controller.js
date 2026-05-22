import * as bookingService from './service.js';
import { createBookingSchema } from './validator.js';

export async function create(req, res) {
  const { slotId } = createBookingSchema.parse(req.body);
  const booking = await bookingService.createBooking(req.user.id, slotId);
  res.status(201).json({ success: true, data: booking });
}

export async function myBookings(req, res) {
  const bookings = await bookingService.getMyBookings(req.user.id);
  res.json({ success: true, data: bookings });
}

export async function cancel(req, res) {
  const booking = await bookingService.cancelBooking(req.params.id, req.user.id);
  res.json({ success: true, data: booking });
}
