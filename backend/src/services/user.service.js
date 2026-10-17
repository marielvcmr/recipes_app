import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from './auth.service.js';
import { Recipe } from '../models/recipe.model.js';

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
  const recipes = await Recipe.countDocuments({ owner: user._id });
  return { recipes };
}


export async function deleteUser(user) {
  /*
    Holder to also delete this user's groups and images
  */
  await Recipe.deleteMany({ owner: user._id });
  await user.deleteOne();
}
