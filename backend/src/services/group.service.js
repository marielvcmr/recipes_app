import { Group } from '../models/group.model.js';
import { Recipe } from '../models/recipe.model.js';
import { AppError } from '../utils/AppError.js';
import { normalizeName, escapeRegex } from '../utils/normalizer.js';
import { deleteImages } from './image.service.js';


function notFound() {
  return new AppError(404, 'NOT_FOUND', 'El recurso no existe.');
}

async function saveGroup(group) {
  try {
    return await group.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(409, 'DUPLICATE_GROUP_NAME', 'Ya tienes un grupo con ese nombre.');
    }
    throw err;
  }
}

async function findOwnGroup(ownerId, groupId) {
  const group = await Group.findOne({ _id: groupId, owner: ownerId });
  if (!group) throw notFound();
  return group;
}

async function findOwnRecipes(ownerId, recipeIds) {
  const recipes = await Recipe.find({ _id: { $in: recipeIds }, owner: ownerId });
  if (recipes.length !== recipeIds.length) throw notFound();
  return recipes;
}

function activeIn(groupId) {
  return { groups: { $elemMatch: { group: groupId, isActive: true } } };
}

async function findCoverUrl(groupId) {
  const recipe = await Recipe.findOne({ ...activeIn(groupId), imageUrl: { $ne: null } })
    .sort({ nameNormalized: 1 })
    .select('imageUrl');
  return recipe?.imageUrl ?? null;
}

async function addRecipes(group, recipes) {
  for (const recipe of recipes) {
    recipe.addToGroup(group._id);
  }
  await Promise.all(recipes.map((recipe) => recipe.save()));
}

async function withRecipeCount(group) {
  const [recipeCount, coverUrl] = await Promise.all([
    Recipe.countDocuments(activeIn(group._id)),
    findCoverUrl(group._id),
  ]);
  return { ...group.toJSON(), recipeCount, coverUrl };
}


export async function createGroup(ownerId, { name, recipeIds = [] }) {
  const recipes = await findOwnRecipes(ownerId, recipeIds);
  const group = await saveGroup(new Group({ owner: ownerId, name }));
  await addRecipes(group, recipes);
  return withRecipeCount(group);
}

export async function listGroups(ownerId, { q, page, limit }) {
  const filter = { owner: ownerId };
  if (q) {
    filter.nameNormalized = { $regex: escapeRegex(normalizeName(q)) };
  }

  const [groups, total] = await Promise.all([
    Group.find(filter).sort({ nameNormalized: 1 }).skip((page - 1) * limit).limit(limit),
    Group.countDocuments(filter),
  ]);

  const data = await Promise.all(groups.map(withRecipeCount));
  return { groups: data, meta: { page, limit, total } };
}

export async function getGroup(ownerId, groupId) {
  const group = await findOwnGroup(ownerId, groupId);
  const recipes = await Recipe.find(activeIn(group._id))
    .select('-ingredients -steps -groups')
    .sort({ nameNormalized: 1 });
    const coverUrl = recipes.find((recipe) => recipe.imageUrl)?.imageUrl ?? null;
  return { ...group.toJSON(), recipeCount: recipes.length, coverUrl, recipes };
}

export async function renameGroup(ownerId, groupId, { name }) {
  const group = await findOwnGroup(ownerId, groupId);
  group.set({ name });
  await saveGroup(group);
  return withRecipeCount(group);
}

export async function addRecipesToGroup(ownerId, groupId, recipeIds) {
  const group = await findOwnGroup(ownerId, groupId);
  const recipes = await findOwnRecipes(ownerId, recipeIds);
  await addRecipes(group, recipes);
  return withRecipeCount(group);
}

export async function removeRecipeFromGroup(ownerId, groupId, recipeId) {
  const group = await findOwnGroup(ownerId, groupId);
  const recipe = await Recipe.findOne({ _id: recipeId, owner: ownerId });
  if (!recipe || !recipe.removeFromGroup(group._id)) throw notFound();
  await recipe.save();
}

export async function deleteGroup(ownerId, groupId) {
  const group = await findOwnGroup(ownerId, groupId);
  const recipes = await Recipe.find(activeIn(group._id)).select('imagePublicId');

  await Recipe.deleteMany({ _id: { $in: recipes.map((recipe) => recipe._id) } });
  await Recipe.updateMany(
    { 'groups.group': group._id },
    { $pull: { groups: { group: group._id } } },
  );
  await group.deleteOne();
  await deleteImages(recipes.map((recipe) => recipe.imagePublicId));
}

export async function assertOwnGroups(ownerId, groupIds) {
  const count = await Group.countDocuments({ _id: { $in: groupIds }, owner: ownerId });
  if (count !== groupIds.length) throw notFound();
}
