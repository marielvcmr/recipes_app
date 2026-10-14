import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError(429, 'TOO_MANY_REQUESTS', 'Demasiados intentos. Intenta de nuevo en 15 minutos.'));
  },
});
