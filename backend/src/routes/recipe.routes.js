import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createRecipeSchema, updateRecipeSchema, listMineQuerySchema, feedQuerySchema } from '../schemas/recipe.schema.js';
import { create, getOne, update, remove, listMine, feed, setImage, removeImage } from '../controllers/recipe.controller.js';
import { imageUpload } from '../middlewares/upload.js';


const router = Router();

router.use(requireAuth);

router.get('/mine', validate(listMineQuerySchema, 'query'), listMine);

router.get('/', validate(feedQuerySchema, 'query'), feed);

router.post('/', validate(createRecipeSchema), create);

router.get('/:id', getOne);

router.patch('/:id', validate
    (updateRecipeSchema), update);

router.delete('/:id', remove);

router.put('/:id/image', imageUpload, setImage);

router.delete('/:id/image', removeImage);


export default router;
