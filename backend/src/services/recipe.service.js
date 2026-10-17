import { Recipe } from '../models/recipe.model.js';
import { AppError } from '../utils/AppError.js';
import { normalizeName, escapeRegex } from '../utils/normalizer.js';

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

export async function createRecipe(ownerId, data) {
  const recipe = new Recipe({ ...data, owner: ownerId, steps: numberSteps(data.steps) });
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
  return { ...recipe.toJSON(), isMine: recipe.owner._id.equals(userId) };
}

export async function updateRecipe(ownerId, recipeId, changes) {
  const recipe = await findOwnRecipe(ownerId, recipeId);
  if (changes.steps) {
    changes.steps = numberSteps(changes.steps);
  }
  recipe.set(changes);
  return saveRecipe(recipe);
}

export async function deleteRecipe(ownerId, recipeId) {
  const recipe = await findOwnRecipe(ownerId, recipeId);
  // Phase 4: also delete its image from Cloudinary
  await recipe.deleteOne();
}

async function findPage(filter, { q, page, limit }) {
  if (q) {
    filter.nameNormalized = { $regex: escapeRegex(normalizeName(q)) };
  }

  const query = Recipe.find(filter)
    .select('-ingredients -steps')
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
