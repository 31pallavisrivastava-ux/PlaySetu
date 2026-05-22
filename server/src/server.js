import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectRedis } from './config/redis.js';
import { prisma } from './config/db.js';
import { logger } from './shared/logger/logger.js';
import { initSocket } from './socket/index.js';
import { startCronJobs } from './jobs/index.js';

const app = createApp();
const server = http.createServer(app);

async function bootstrap() {
  try {
    await prisma.$connect();
    await connectRedis().catch((err) => {
      logger.warn('Redis unavailable — slot locks and cache disabled until connected', {
        err: err.message,
      });
    });

    initSocket(server, env.CLIENT_URL);
    startCronJobs();

    server.listen(env.PORT, () => {
      logger.info(`PlaySetu API running on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { err: err.message });
    process.exit(1);
  }
}

bootstrap();
