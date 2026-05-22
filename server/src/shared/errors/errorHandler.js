import { AppError } from './AppError.js';
import { logger } from '../logger/logger.js';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: err.flatten?.() ?? err.errors },
    });
  }

  if (err?.name === 'ApiError') {
    return res.status(err.status >= 400 && err.status < 500 ? err.status : 502).json({
      success: false,
      error: {
        code: 'GEMINI_API_ERROR',
        message: err.message || 'Gemini API request failed',
      },
    });
  }

  logger.error(err?.message || err, { name: err?.name, status: err?.status });
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}
