import { Recipe } from '../models/recipe.model.js';
import { AppError } from '../utils/AppError.js';

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
