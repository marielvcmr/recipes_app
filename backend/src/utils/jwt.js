import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const ALGORITHM = 'HS256';

export function signToken(userId) { // creates a token for a user 
  return jwt.sign({ sub: String(userId) }, env.jwt.secret, {
    algorithm: ALGORITHM,
    expiresIn: env.jwt.expiresIn,
  });
}  // returns the token string = header ({"alg":"HS256","typ":"JWT"})+ payload ({"sub":"670f1a2b3c4d5e6f7a8b9c0d","iat":1729000000,"exp":1729604800})
// + signature (signature = HMAC-SHA256( "HEADER.PAYLOAD" , JWT_SECRET ))


export function verifyToken(token) { 
  return jwt.verify(token, env.jwt.secret, { algorithms: [ALGORITHM] });
}
