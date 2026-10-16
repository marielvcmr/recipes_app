import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createRecipeSchema } from '../schemas/recipe.schema.js';
import { create } from '../controllers/recipe.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createRecipeSchema), create);

export default router;
