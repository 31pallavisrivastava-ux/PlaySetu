import * as recommendationService from './service.js';
import { z } from 'zod';

const schema = z.object({
  sportType: z.string().optional(),
  maxPrice: z.coerce.number().optional(),
  limit: z.coerce.number().default(5),
});

export async function recommend(req, res) {
  const query = schema.parse(req.query);
  const items = await recommendationService.recommendForUser(req.user.id, query);
  res.json({ success: true, data: items });
}
