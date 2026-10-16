import { z } from 'zod';
import { DIFFICULTIES, UNITS } from '../utils/fieldRules.js';

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
});

export const updateRecipeSchema = createRecipeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Envía al menos un campo para actualizar.');
