import { User } from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

// function that identifies the user from the token, that is sent on every request in its header

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? ''; 
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Falta el token de acceso.');
  } // is there an auth bearer token?

  let payload;
  try {
    payload = verifyToken(token); // is the token real 
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'El token no es válido o ha expirado.');
  }

  const user = await User.findById(payload.sub);
  if (!user) {  // does the user in the token still exist
    throw new AppError(401, 'UNAUTHORIZED', 'La cuenta ya no existe.');
  }

  req.user = user; // this is the person making the request
  next(); // go on to the controller
}
