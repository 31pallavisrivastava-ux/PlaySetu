import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './shared/errors/errorHandler.js';

import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/users/routes.js';
import facilityRoutes from './modules/facilities/routes.js';
import bookingRoutes from './modules/bookings/routes.js';
import recommendationRoutes from './modules/recommendations/routes.js';
import aiRoutes from './modules/ai-agent/routes.js';
import reviewRoutes from './modules/reviews/routes.js';
import analyticsRoutes from './modules/analytics/routes.js';
import adminRoutes from './modules/admin/routes.js';
import ownerRoutes from './modules/owner/routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '1mb' }));

  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/health', (_req, res) => {
    res.json({ success: true, service: 'playsetu-api', status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/facilities', facilityRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/owner', ownerRoutes);

  app.use(errorHandler);

  return app;
}
