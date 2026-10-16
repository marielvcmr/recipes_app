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
