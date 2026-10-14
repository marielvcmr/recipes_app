import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const ALGORITHM = 'HS256';

export function signToken(userId) { // creates a token for a user 
  return jwt.sign({ sub: String(userId) }, env.jwt.secret, {
    algorithm: ALGORITHM,
    expiresIn: env.jwt.expiresIn,
  });
}

export function verifyToken(token) { // cheks signature matches secret, expiration and right format. Good returns payload 
  return jwt.verify(token, env.jwt.secret, { algorithms: [ALGORITHM] });
}
