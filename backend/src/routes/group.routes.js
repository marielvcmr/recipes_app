import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createGroupSchema, renameGroupSchema, listGroupsQuerySchema } from '../schemas/group.schema.js';
import { create, list, getOne, rename } from '../controllers/group.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listGroupsQuerySchema, 'query'), list);
router.post('/', validate(createGroupSchema), create);
router.get('/:id', getOne);
router.patch('/:id', validate(renameGroupSchema), rename);

export default router;
