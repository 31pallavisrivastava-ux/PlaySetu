import { z } from 'zod';
import { SPORT_TYPES } from '../../shared/constants/index.js';

export const ownerQuerySchema = z.object({
  facilityId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
});

export const createOwnerFacilitySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  sportType: z.string().refine((s) => SPORT_TYPES.includes(s), 'Invalid sport type'),
  address: z.string().min(5),
  area: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  openingTime: z.string().regex(/^\d{2}:\d{2}$/),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const updateOwnerFacilitySchema = createOwnerFacilitySchema.partial();

export const facilityStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});
