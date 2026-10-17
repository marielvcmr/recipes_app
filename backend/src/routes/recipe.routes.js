import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createRecipeSchema, updateRecipeSchema } from '../schemas/recipe.schema.js';
import { create, getOne, update, remove } from '../controllers/recipe.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createRecipeSchema), create);

router.get('/:id', getOne);

router.patch('/:id', validate(updateRecipeSchema), update);

router.delete('/:id', remove);


export default router;
