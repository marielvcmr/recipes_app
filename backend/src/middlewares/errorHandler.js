import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

const DUPLICATE_ERRORS = {
  email: { code: 'EMAIL_TAKEN', message: 'Ese correo ya está registrado.' },
  username: { code: 'USERNAME_TAKEN', message: 'Ese nombre de usuario ya está en uso.' },
};


export function notFound(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  let error = err;

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new AppError(400, 'VALIDATION_ERROR', 'Hay campos inválidos.', details);
  } else if (err instanceof mongoose.Error.CastError) {
    error = new AppError(404, 'NOT_FOUND', 'El recurso no existe.');
  } else if (err.type === 'entity.parse.failed') {
    error = new AppError(400, 'VALIDATION_ERROR', 'El cuerpo de la petición no es JSON válido.');
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0];
    const duplicate = DUPLICATE_ERRORS[field];
    if (duplicate) {
      error = new AppError(409, duplicate.code, duplicate.message);
    }
  }

  if (!(error instanceof AppError)) {
    console.error(err);
    error = new AppError(500, 'INTERNAL_ERROR', 'Error inesperado.');
  }

  const body = { error: { code: error.code, message: error.message } };
  if (error.details) body.error.details = error.details;

  res.status(error.status).json(body);
}
