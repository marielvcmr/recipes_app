import { ApiError } from '@/api/client';

export type FormErrors = {
  // Mensaje general (ej. "Correo o clave incorrectos.")
  message?: string;
  // Mensajes por campo, sacados de error.details del backend (ej. { email: "El correo no tiene un formato válido." })
  fields: Record<string, string>;
};

const DUPLICATE_FIELDS: Record<string, string> = {
  EMAIL_TAKEN: 'email',
  USERNAME_TAKEN: 'username',
  DUPLICATE_RECIPE_NAME: 'name',
  DUPLICATE_GROUP_NAME: 'name',
};

// Convierte cualquier error de una petición en mensajes listos para mostrar en un formulario
export function toFormErrors(error: unknown): FormErrors {
  if (!(error instanceof ApiError)) {
    return { message: 'Error inesperado.', fields: {} };
  }

  // Correo o usuario ya registrados (409): el error va debajo de su campo
  const duplicateField = DUPLICATE_FIELDS[error.code];
  if (duplicateField) {
    return { fields: { [duplicateField]: error.message } };
  }

  const fields: Record<string, string> = {};
  for (const detail of error.details) {
    // Si un campo tiene varios errores, se muestra el primero
    if (!fields[detail.field]) fields[detail.field] = detail.message;
  }

  // Con errores por campo, el mensaje general ("Hay campos inválidos.") sobra
  const message = error.code === 'VALIDATION_ERROR' && error.details.length > 0 ? undefined : error.message;

  return { message, fields };
}
