import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from './auth.service.js';

export async function updateUser(user, { password, ...changes }) 
{

  if (password) {
    changes.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  user.set(changes);
  await user.save();
  return user;
}

export async function deleteUser(user) {
  /*
    Holder to also delete this user's recipes, groups and images
  */

  await user.deleteOne();
}
