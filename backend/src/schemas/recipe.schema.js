import { z } from 'zod';
import { DIFFICULTIES, UNITS, OBJECT_ID_REGEX } from '../utils/fieldRules.js';

export const objectIdField = z
  .string({ error: 'Cada id debe ser texto.' })
  .regex(OBJECT_ID_REGEX, 'El id no es válido.');

export function uniqueIds(ids) {
  return [...new Set(ids)];
}


const ingredientSchema = z.object({
  name: z
    .string({ error: 'El nombre del ingrediente es obligatorio.' })
    .trim()
    .min(2, 'El nombre del ingrediente debe tener entre 2 y 20 caracteres.')
    .max(20, 'El nombre del ingrediente debe tener entre 2 y 20 caracteres.'),
  quantity: z
    .number({ error: 'La cantidad debe ser un número.' })
    .positive('La cantidad debe ser mayor que 0.')
    .max(9999, 'La cantidad no puede superar 9999.'),
  unit: z.enum(UNITS, { error: 'La unidad debe ser: unidades, g, ml, tazas o cucharadas.' }),
});

const stepSchema = z.object({
  description: z
    .string({ error: 'La descripción del paso es obligatoria.' })
    .trim()
    .min(3, 'Cada paso debe tener entre 3 y 150 caracteres.')
    .max(150, 'Cada paso debe tener entre 3 y 150 caracteres.'),
});

export const createRecipeSchema = z.object({
  name: z
    .string({ error: 'El nombre es obligatorio.' })
    .trim()
    .min(2, 'El nombre debe tener entre 2 y 50 caracteres.')
    .max(50, 'El nombre debe tener entre 2 y 50 caracteres.'),
  description: z
    .string({ error: 'La descripción es obligatoria.' })
    .trim()
    .min(10, 'La descripción debe tener entre 10 y 200 caracteres.')
    .max(200, 'La descripción debe tener entre 10 y 200 caracteres.'),
  timeMinutes: z
    .number({ error: 'El tiempo debe ser un número.' })
    .int('El tiempo debe ser un número entero de minutos.')
    .min(1, 'El tiempo debe estar entre 1 y 1440 minutos.')
    .max(1440, 'El tiempo debe estar entre 1 y 1440 minutos.'),
  difficulty: z.enum(DIFFICULTIES, { error: 'La dificultad debe ser: facil, media o dificil.' }),
  isPublic: z.boolean({ error: 'isPublic debe ser true o false.' }).optional(),
  ingredients: z
    .array(ingredientSchema, { error: 'Los ingredientes deben ser una lista.' })
    .min(1, 'Agrega al menos 1 ingrediente.')
    .max(30, 'Máximo 30 ingredientes.'),
  steps: z
    .array(stepSchema, { error: 'Los pasos deben ser una lista.' })
    .min(1, 'Agrega al menos 1 paso.')
    .max(30, 'Máximo 30 pasos.'),
  groupIds: z
    .array(objectIdField, { error: 'groupIds debe ser una lista de ids.' })
    .max(100, 'Máximo 100 grupos.')
    .transform(uniqueIds)
    .optional(),

});

export const updateRecipeSchema = createRecipeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Envía al menos un campo para actualizar.');

  export const listQuery = {
  q: z.string().trim().max(50, 'La búsqueda no puede superar 50 caracteres.').optional(),
  page: z.coerce
    .number({ error: 'page debe ser un número.' })
    .int('page debe ser un número entero.')
    .min(1, 'page debe ser 1 o más.')
    .default(1),
  limit: z.coerce
    .number({ error: 'limit debe ser un número.' })
    .int('limit debe ser un número entero.')
    .min(1, 'limit debe estar entre 1 y 50.')
    .max(50, 'limit debe estar entre 1 y 50.')
    .default(20),
};

export const listMineQuerySchema = z.object({
  ...listQuery,
  visibility: z.enum(['public', 'private'], { error: 'visibility debe ser public o private.' }).optional(),
});

export const feedQuerySchema = z.object({
  ...listQuery,
  excludeMine: z
    .enum(['true', 'false'], { error: 'excludeMine debe ser true o false.' })
    .optional()
    .transform((value) => value === 'true'),
});
