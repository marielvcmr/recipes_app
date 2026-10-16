import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export const SALT_ROUNDS = 10;

export async function registerUser({ username, email, password, avatarColor }) {
  // receives req.body params destructured

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, email, passwordHash, avatarColor });  // creates a new user
  return { user, token: signToken(user.id) };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash'); //  looks up the user by email and since the field has select: false, it doesn't come by default. The + means "add this field too" in this one query.
  const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));

  if (!passwordOk) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Correo o clave incorrectos.');
  }

  return { user, token: signToken(user.id) };
}
