import { z } from 'zod';
import { listQuery, objectIdField, uniqueIds } from './recipe.schema.js';

const groupNameField = z
  .string({ error: 'El nombre del grupo es obligatorio.' })
  .trim()
  .min(2, 'El nombre del grupo debe tener entre 2 y 20 caracteres.')
  .max(20, 'El nombre del grupo debe tener entre 2 y 20 caracteres.');

const recipeIdsField = z
  .array(objectIdField, { error: 'recipeIds debe ser una lista de ids.' })
  .max(100, 'Máximo 100 recetas por petición.')
  .transform(uniqueIds);

export const createGroupSchema = z.object({
  name: groupNameField,
  recipeIds: recipeIdsField.optional(),
});

export const renameGroupSchema = z.object({
  name: groupNameField,
});

export const addRecipesSchema = z.object({
  recipeIds: recipeIdsField.refine((ids) => ids.length > 0, 'Envía al menos una receta.'),
});

export const listGroupsQuerySchema = z.object(listQuery);
