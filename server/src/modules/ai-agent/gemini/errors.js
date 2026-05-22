import { AppError } from '../../../shared/errors/AppError.js';

export function isGeminiRecoverableError(err) {
  if (err?.name !== 'ApiError') return false;
  const msg = (err.message || '').toLowerCase();
  return (
    err.status === 400 ||
    err.status === 401 ||
    err.status === 403 ||
    err.status === 429 ||
    err.status === 503 ||
    msg.includes('api key') ||
    msg.includes('invalid_argument') ||
    msg.includes('not found') ||
    msg.includes('model') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota')
  );
}

export function toAppError(err) {
  if (err instanceof AppError) return err;
  if (err?.name === 'ApiError') {
    const message =
      err.message ||
      'Gemini API request failed. Check GEMINI_API_KEY and GEMINI_MODEL in server/.env';
    const status = err.status >= 400 && err.status < 500 ? err.status : 502;
    return new AppError(message, status, 'GEMINI_API_ERROR');
  }
  return err;
}
