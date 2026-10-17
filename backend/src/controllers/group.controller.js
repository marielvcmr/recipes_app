import { createGroup, listGroups, getGroup, renameGroup } from '../services/group.service.js';

export async function create(req, res) {
  const group = await createGroup(req.user._id, req.body);
  res.status(201).json({ data: { group } });
}

export async function list(req, res) {
  const { groups, meta } = await listGroups(req.user._id, req.validatedQuery);
  res.json({ data: groups, meta });
}

export async function getOne(req, res) {
  const group = await getGroup(req.user._id, req.params.id);
  res.json({ data: { group } });
}

export async function rename(req, res) {
  const group = await renameGroup(req.user._id, req.params.id, req.body);
  res.json({ data: { group } });
}
