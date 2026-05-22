import { z } from 'zod';
import * as orchestrator from './orchestrator.js';

const chatSchema = z.object({ message: z.string().min(1) });
const bookSchema = z.object({ slotId: z.string().uuid() });
const recommendSchema = z.object({
  sportType: z.string().optional(),
  maxPrice: z.coerce.number().optional(),
});

export async function chat(req, res) {
  const { message } = chatSchema.parse(req.body);
  const result = await orchestrator.handleChat(req.user.id, message);
  res.json({ success: true, data: result });
}

export async function recommend(req, res) {
  const params = recommendSchema.parse(req.body);
  const data = await orchestrator.handleRecommend(req.user.id, params);
  res.json({ success: true, data });
}

export async function book(req, res) {
  const { slotId } = bookSchema.parse(req.body);
  const data = await orchestrator.handleAutoBook(req.user.id, { slotId });
  res.json({ success: true, data });
}
