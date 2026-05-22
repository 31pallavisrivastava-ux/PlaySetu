import { runBookingAgent } from './agents/booking.agent.js';
import * as recommendationService from '../recommendations/service.js';

const agentMemory = new Map();

export async function handleChat(userId, message) {
  const history = agentMemory.get(userId) ?? [];
  const result = await runBookingAgent({ message, userId, history });

  history.push({ role: 'user', content: message });
  history.push({ role: 'assistant', content: result.reply });
  agentMemory.set(userId, history.slice(-20));

  return result;
}

export async function handleRecommend(userId, params) {
  return recommendationService.recommendForUser(userId, params);
}

export async function handleAutoBook(userId, { slotId }) {
  const { runCreateBooking } = await import('./tools/booking.tool.js');
  return runCreateBooking({ slotId }, userId);
}
