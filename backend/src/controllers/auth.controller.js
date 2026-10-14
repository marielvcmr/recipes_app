import { registerUser, loginUser } from '../services/auth.service.js';

export async function register(req, res) {
  const { user, token } = await registerUser(req.body);
  res.status(201).json({ data: { user, token } });
}

export async function login(req, res) {
  const { user, token } = await loginUser(req.body);
  res.json({ data: { user, token } });
}
