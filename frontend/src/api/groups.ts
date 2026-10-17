import { apiFetchPage } from '@/api/client';
import type { Group } from '@/api/types';

// GET /groups (requiere token): grupos del usuario, paginados
export function listGroups(page = 1, limit = 20) {
  return apiFetchPage<Group>(`/groups?page=${page}&limit=${limit}`);
}
