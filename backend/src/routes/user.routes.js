import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateMeSchema } from '../schemas/user.schema.js';
import { getMe, updateMe } from '../controllers/user.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', validate(updateMeSchema), updateMe);

export default router;
