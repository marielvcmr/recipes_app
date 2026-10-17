import { createGroup, listGroups, getGroup, renameGroup, addRecipesToGroup, removeRecipeFromGroup, deleteGroup } from '../services/group.service.js';

export async function create(req, res) {
  const group = await createGroup(req.user._id, req.body);
  res.status(201).json({ data: { group } });
}

export async function list(req, res) {
  const { groups, meta } = await listGroups(req.user._id, req.validatedQuery);
  res.json({ data: groups, meta });
}

export async function getOne(req, res) {
  const group = await getGroup(req.user._id, req.params.id);
  res.json({ data: { group } });
}

export async function rename(req, res) {
  const group = await renameGroup(req.user._id, req.params.id, req.body);
  res.json({ data: { group } });
}

export async function remove(req, res) {
  await deleteGroup(req.user._id, req.params.id);
  res.status(204).end();
}

export async function addRecipes(req, res) {
  const group = await addRecipesToGroup(req.user._id, req.params.id, req.body.recipeIds);
  res.json({ data: { group } });
}

export async function removeRecipe(req, res) {
  await removeRecipeFromGroup(req.user._id, req.params.id, req.params.recipeId);
  res.status(204).end();
}
