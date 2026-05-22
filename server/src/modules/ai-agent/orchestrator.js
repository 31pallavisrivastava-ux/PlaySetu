import { runBookingAgent } from './agents/booking.agent.js';
import * as recommendationService from '../recommendations/service.js';
import * as bookingService from '../bookings/service.js';
import { prisma } from '../../config/db.js';

const HISTORY_CONTEXT_LIMIT = 20;
const HISTORY_FETCH_LIMIT = 50;

export async function handleChat(userId, message, location) {
  const recent = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_CONTEXT_LIMIT,
    select: { role: true, content: true },
  });
  const history = recent.reverse();

  const result = await runBookingAgent({ message, userId, history, location });

  await prisma.chatMessage.createMany({
    data: [
      { userId, role: 'user', content: message },
      { userId, role: 'assistant', content: result.reply },
    ],
  });

  return result;
}

export async function getHistory(userId, { limit = HISTORY_FETCH_LIMIT } = {}) {
  const rows = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, role: true, content: true, createdAt: true },
  });
  return rows.reverse();
}

export async function clearHistory(userId) {
  await prisma.chatMessage.deleteMany({ where: { userId } });
}

export async function handleRecommend(userId, params) {
  return recommendationService.recommendForUser(userId, params);
}

export async function handleAutoBook(userId, { slotId }) {
  return bookingService.createBooking(userId, slotId);
}
