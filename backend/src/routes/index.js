import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import recipeRoutes from './recipe.routes.js';
import groupRoutes from './group.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ data: { ok: true } });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/recipes', recipeRoutes);
router.use('/groups', groupRoutes);


export default router;

