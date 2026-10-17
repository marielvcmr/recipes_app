import { apiFetch, apiFetchPage } from '@/api/client';
import type { Recipe, RecipeSummary } from '@/api/types';
import type { Difficulty, Unit } from '@/utils/recipeOptions';

// Lo que se manda al crear o editar. Los pasos van sin position: la pone el backend según el orden
export type RecipeInput = {
  name: string;
  description: string;
  timeMinutes: number;
  difficulty: Difficulty;
  isPublic: boolean;
  ingredients: { name: string; quantity: number; unit: Unit }[];
  steps: { description: string }[];
  groupIds: string[];
};

type ListMineOptions = {
  q?: string;
  visibility?: 'public' | 'private';
  page?: number;
  limit?: number;
};

// GET /recipes/mine: mis recetas, A–Z, paginadas
export function listMyRecipes({ q, visibility, page = 1, limit = 20 }: ListMineOptions = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
  if (visibility) params.set('visibility', visibility);
  return apiFetchPage<RecipeSummary>(`/recipes/mine?${params}`);
}

// GET /recipes/:id: receta propia o pública, con ingredientes, pasos e isMine
export async function getRecipe(id: string) {
  return (await apiFetch<{ recipe: Recipe }>(`/recipes/${id}`)).recipe;
}

// POST /recipes
export async function createRecipe(input: RecipeInput) {
  return (await apiFetch<{ recipe: Recipe }>('/recipes', { method: 'POST', body: input })).recipe;
}

// PATCH /recipes/:id: solo los campos que cambian
export async function updateRecipe(id: string, changes: Partial<RecipeInput>) {
  return (await apiFetch<{ recipe: Recipe }>(`/recipes/${id}`, { method: 'PATCH', body: changes })).recipe;
}

// DELETE /recipes/:id (el backend también borra su foto de Cloudinary)
export function deleteRecipe(id: string) {
  return apiFetch<void>(`/recipes/${id}`, { method: 'DELETE' });
}

// PUT /recipes/:id/image: sube o reemplaza la foto. Va como multipart en el campo "image"
export async function uploadRecipeImage(id: string, uri: string) {
  const form = new FormData();
  // En React Native un archivo se manda como { uri, name, type }; TypeScript espera un Blob
  form.append('image', { uri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
  return (await apiFetch<{ recipe: Recipe }>(`/recipes/${id}/image`, { method: 'PUT', body: form })).recipe;
}

// DELETE /recipes/:id/image: quita la foto (la receta vuelve a la imagen por defecto)
export function removeRecipeImage(id: string) {
  return apiFetch<void>(`/recipes/${id}/image`, { method: 'DELETE' });
}
