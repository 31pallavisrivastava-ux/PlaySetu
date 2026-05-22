import { z } from 'zod';

export const createBookingSchema = z.object({
  slotId: z.string().uuid(),
  playerCount: z.coerce.number().int().positive(),
});
