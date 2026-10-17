import { updateUser, deleteUser, getUserCounts } from '../services/user.service.js';

export async function getMe(req, res) {
  const counts = await getUserCounts(req.user);
  res.json({ data: { user: req.user, counts } });
}

export async function updateMe(req, res) {
  const user = await updateUser(req.user, req.body);
  res.json({ data: { user } });
}

export async function deleteMe(req, res){
  await deleteUser(req.user);
  res.status(204).end();
}