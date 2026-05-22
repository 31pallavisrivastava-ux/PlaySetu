import { env } from '../../config/env.js';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };

function log(level, message, meta) {
  if (levels[level] > levels[env.NODE_ENV === 'production' ? 'info' : 'debug']) return;
  const payload = { level, message, ...(meta && { meta }), ts: new Date().toISOString() };
  console[level === 'error' ? 'error' : 'log'](JSON.stringify(payload));
}

export const logger = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  debug: (message, meta) => log('debug', message, meta),
};
