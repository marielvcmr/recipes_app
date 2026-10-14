import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { loginLimiter } from '../middlewares/rateLimit.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);

export default router;
