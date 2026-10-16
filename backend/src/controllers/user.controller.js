import { updateUser } from '../services/user.service.js';

export async function getMe(req, res) {
  res.json({ data: { user: req.user } });
}

export async function updateMe(req, res) {
  const user = await updateUser(req.user, req.body);
  res.json({ data: { user } });
}

// 