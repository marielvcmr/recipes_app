import { apiFetch } from '@/api/client';
import type { User } from '@/api/types';

export type AuthResponse = {
  user: User;
  token: string;
};

// POST /auth/login
export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

// POST /auth/register
export function register(username: string, email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { username, email, password },
  });
}
