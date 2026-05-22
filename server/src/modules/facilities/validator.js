import { z } from 'zod';
import { SPORT_TYPES } from '../../shared/constants/index.js';

export const createFacilitySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  sportType: z.string().refine((s) => SPORT_TYPES.includes(s), 'Invalid sport type'),
  address: z.string().min(5),
  area: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  openingTime: z.string().regex(/^\d{2}:\d{2}$/),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const searchFacilitiesSchema = z.object({
  sportType: z.string().optional(),
  area: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  radiusKm: z.coerce.number().default(10),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export const createCourtSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  pricePerHour: z.coerce.number().positive(),
  minPlayers: z.coerce.number().int().positive().optional(),
  maxPlayers: z.coerce.number().int().positive().default(10),
});

export const generateSlotsSchema = z.object({
  courtId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slots: z.array(
    z.object({
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ),
});
