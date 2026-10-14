import { z } from 'zod';
import { USERNAME_REGEX, PASSWORD_REGEX, HEX_COLOR_REGEX } from '../utils/fieldRules.js';

export const usernameField = z
  .string({ error: 'El nombre de usuario es obligatorio.' })
  .trim()
  .regex(USERNAME_REGEX, 'El nombre de usuario debe tener entre 3 y 10 caracteres: letras, números, _ y .');

export const emailField = z
  .string({ error: 'El correo es obligatorio.' })
  .trim()
  .toLowerCase()
  .max(254, 'El correo no puede superar 254 caracteres.')
  .pipe(z.email('El correo no tiene un formato válido.'));

export const passwordField = z
  .string({ error: 'La clave es obligatoria.' })
  .regex(PASSWORD_REGEX, 'La clave debe tener entre 6 y 15 caracteres: letras, números y _ - . / # $');

export const avatarColorField = z
  .string({ error: 'El color debe ser texto.' })
  .regex(HEX_COLOR_REGEX, 'El color debe tener el formato #RRGGBB.');

export const registerSchema = z.object({
  username: usernameField,
  email: emailField,
  password: passwordField,
  avatarColor: avatarColorField.optional(),
});

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string({ error: 'La clave es obligatoria.' })
    .min(1, 'La clave es obligatoria.'),
});
