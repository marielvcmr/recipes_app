import { createRecipe } from '../services/recipe.service.js';

export async function create(req, res) {
  const recipe = await createRecipe(req.user._id, req.body);
  res.status(201).json({ data: { recipe } });
}
