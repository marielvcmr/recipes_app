import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from './auth.service.js';
import { Recipe } from '../models/recipe.model.js';
import { Group } from '../models/group.model.js';
import { deleteImages } from './image.service.js';

export async function updateUser(user, { password, ...changes }) 
{

  if (password) {
    changes.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  user.set(changes);
  await user.save();
  return user;
}

export async function getUserCounts(user) {
  const [recipes, groups] = await Promise.all([
    Recipe.countDocuments({ owner: user._id }),
    Group.countDocuments({ owner: user._id }),
  ]);
  return { recipes, groups };
}

export async function deleteUser(user) {
  const recipes = await Recipe.find({ owner: user._id }).select('imagePublicId');

  await Recipe.deleteMany({ owner: user._id });
  await Group.deleteMany({ owner: user._id });
  await user.deleteOne();
  await deleteImages(recipes.map((recipe) => recipe.imagePublicId));
}


