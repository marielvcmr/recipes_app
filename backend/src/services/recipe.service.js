import { Recipe } from '../models/recipe.model.js';
import { AppError } from '../utils/AppError.js';
import { normalizeName, escapeRegex } from '../utils/normalizer.js';
import { assertOwnGroups } from './group.service.js';
import { uploadImage, deleteImages } from './image.service.js';



function numberSteps(steps) {
  return steps.map((step, index) => ({ position: index + 1, description: step.description }));
}

async function saveRecipe(recipe) {
  try {
    return await recipe.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(409, 'DUPLICATE_RECIPE_NAME', 'Ya tienes una receta con ese nombre.');
    }
    throw err;
  }
}

export async function createRecipe(ownerId, { groupIds = [], ...data }) {
  await assertOwnGroups(ownerId, groupIds);
  const recipe = new Recipe({ ...data, owner: ownerId, steps: numberSteps(data.steps) });
  recipe.setGroups(groupIds);
  return saveRecipe(recipe);
}


function recipeNotFound() {
  return new AppError(404, 'NOT_FOUND', 'El recurso no existe.');
}

async function findOwnRecipe(ownerId, recipeId) {
  const recipe = await Recipe.findOne({ _id: recipeId, owner: ownerId });
  if (!recipe) throw recipeNotFound();
  return recipe;
}

export async function getRecipe(userId, recipeId) {
  const recipe = await Recipe.findOne({
    _id: recipeId,
    $or: [{ owner: userId }, { isPublic: true }],
  }).populate('owner', 'username avatarColor');

  if (!recipe) throw recipeNotFound();
    const isMine = recipe.owner._id.equals(userId);
  const json = { ...recipe.toJSON(), isMine };
  if (!isMine) delete json.groupIds;
  return json;

}

export async function updateRecipe(ownerId, recipeId, { groupIds, ...changes }) {
  const recipe = await findOwnRecipe(ownerId, recipeId);
  if (groupIds) {
    await assertOwnGroups(ownerId, groupIds);
    recipe.setGroups(groupIds);
  }
  if (changes.steps) {
    changes.steps = numberSteps(changes.steps);
  }
  recipe.set(changes);
  return saveRecipe(recipe);
}

export async function deleteRecipe(ownerId, recipeId) {
  const recipe = await findOwnRecipe(ownerId, recipeId);
  await recipe.deleteOne();
  await deleteImages([recipe.imagePublicId]);
}


async function findPage(filter, { q, page, limit }) {
  if (q) {
    filter.nameNormalized = { $regex: escapeRegex(normalizeName(q)) };
  }

  const query = Recipe.find(filter)
    .select('-ingredients -steps -groups')
    .populate('owner', 'username avatarColor')
    .sort({ nameNormalized: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const [recipes, total] = await Promise.all([query, Recipe.countDocuments(filter)]);
  return { recipes, meta: { page, limit, total } };
}

export function listMyRecipes(userId, { visibility, ...pageOptions }) {
  const filter = { owner: userId };
  if (visibility) {
    filter.isPublic = visibility === 'public';
  }
  return findPage(filter, pageOptions);
}

export function listPublicRecipes(userId, { excludeMine, ...pageOptions }) {
  const filter = { isPublic: true };
  if (excludeMine) {
    filter.owner = { $ne: userId };
  }
  return findPage(filter, pageOptions);
}

export async function setRecipeImage(ownerId, recipeId, file) {
  const recipe = await findOwnRecipe(ownerId, recipeId);
  const { url, publicId } = await uploadImage(file.buffer);
  const oldPublicId = recipe.imagePublicId;

  recipe.set({ imageUrl: url, imagePublicId: publicId });
  await recipe.save();
  await deleteImages([oldPublicId]);
  return recipe;
}

export async function removeRecipeImage(ownerId, recipeId) {
  const recipe = await findOwnRecipe(ownerId, recipeId);
  const oldPublicId = recipe.imagePublicId;

  recipe.set({ imageUrl: null, imagePublicId: null });
  await recipe.save();
  await deleteImages([oldPublicId]);
}
