import { apiFetch } from '@/api/client';
import type { User } from '@/api/types';

export type MeResponse = {
  user: User;
  counts: { recipes: number; groups: number };
};

// GET /users/me (requiere token)
export function getMe() {
  return apiFetch<MeResponse>('/users/me');
}

export type ProfileChanges = Partial<{
  username: string;
  email: string;
  password: string;
  avatarColor: string;
}>;

// PATCH /users/me: solo se mandan los campos que cambian (al menos uno)
export function updateMe(changes: ProfileChanges) {
  return apiFetch<{ user: User }>('/users/me', { method: 'PATCH', body: changes });
}

// DELETE /users/me: borra la cuenta y sus recetas (responde 204)
export function deleteMe() {
  return apiFetch<void>('/users/me', { method: 'DELETE' });
}
