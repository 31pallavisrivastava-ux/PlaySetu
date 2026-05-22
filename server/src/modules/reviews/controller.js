import { z } from 'zod';
import * as reviewService from './service.js';

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().optional(),
});

export async function create(req, res) {
  const body = schema.parse(req.body);
  const review = await reviewService.createReview(req.user.id, req.params.facilityId, body);
  res.status(201).json({ success: true, data: review });
}
