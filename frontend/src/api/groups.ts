import { apiFetch, apiFetchPage } from '@/api/client';
import type { Group, GroupDetail } from '@/api/types';

type ListGroupsOptions = {
  q?: string;
  page?: number;
  limit?: number;
};

// GET /groups (requiere token): grupos del usuario, A–Z, paginados
export function listGroups({ q, page = 1, limit = 20 }: ListGroupsOptions = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
  return apiFetchPage<Group>(`/groups?${params}`);
}

// GET /groups/:id: el grupo con sus recetas activas
export async function getGroup(id: string) {
  return (await apiFetch<{ group: GroupDetail }>(`/groups/${id}`)).group;
}

// POST /groups: recipeIds son recetas propias (opcional)
export async function createGroup(input: { name: string; recipeIds: string[] }) {
  return (await apiFetch<{ group: Group }>('/groups', { method: 'POST', body: input })).group;
}

// PATCH /groups/:id: solo se puede cambiar el nombre
export async function renameGroup(id: string, name: string) {
  return (await apiFetch<{ group: Group }>(`/groups/${id}`, { method: 'PATCH', body: { name } })).group;
}

// DELETE /groups/:id: borra también las recetas activas en el grupo
export function deleteGroup(id: string) {
  return apiFetch<void>(`/groups/${id}`, { method: 'DELETE' });
}

// POST /groups/:id/recipes: añade recetas (o reactiva las que se habían quitado)
export async function addRecipesToGroup(id: string, recipeIds: string[]) {
  return (await apiFetch<{ group: Group }>(`/groups/${id}/recipes`, { method: 'POST', body: { recipeIds } })).group;
}

// DELETE /groups/:id/recipes/:recipeId: quita la receta del grupo (borrado lógico, la receta sigue existiendo)
export function removeRecipeFromGroup(id: string, recipeId: string) {
  return apiFetch<void>(`/groups/${id}/recipes/${recipeId}`, { method: 'DELETE' });
}
