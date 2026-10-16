import { z } from 'zod';
import { usernameField, emailField, passwordField, avatarColorField } from './auth.schema.js';

export const updateMeSchema = z
  .object({
    username: usernameField.optional(),
    email: emailField.optional(),
    password: passwordField.optional(),
    avatarColor: avatarColorField.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Envía al menos un campo para actualizar.');
