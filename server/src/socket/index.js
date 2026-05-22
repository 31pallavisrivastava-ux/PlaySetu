import { Server } from 'socket.io';
import { logger } from '../shared/logger/logger.js';

export function initSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin, credentials: true },
  });

  io.on('connection', (socket) => {
    logger.debug('Socket connected', { id: socket.id });

    socket.on('join:facility', (facilityId) => {
      socket.join(`facility:${facilityId}`);
    });

    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected', { id: socket.id });
    });
  });

  return io;
}

export function emitSlotUpdate(io, facilityId, payload) {
  io.to(`facility:${facilityId}`).emit('slot:update', payload);
}

export function emitBookingNotification(io, userId, payload) {
  io.to(`user:${userId}`).emit('booking:notification', payload);
}
