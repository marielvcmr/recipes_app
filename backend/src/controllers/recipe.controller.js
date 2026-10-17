import { createRecipe, getRecipe, updateRecipe, deleteRecipe } from '../services/recipe.service.js';

export async function create(req, res) {
  const recipe = await createRecipe(req.user._id, req.body);
  res.status(201).json({ data: { recipe } });
}

export async function getOne(req, res) {
  const recipe = await getRecipe(req.user._id, req.params.id);
  res.json({ data: { recipe } });
}

export async function update(req, res) {
  const recipe = await updateRecipe(req.user._id, req.params.id, req.body);
  res.json({ data: { recipe } });
}

export async function remove(req, res) {
  await deleteRecipe(req.user._id, req.params.id);
  res.status(204).end();
}
