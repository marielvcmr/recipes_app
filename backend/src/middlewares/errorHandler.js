import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

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
  }

  if (!(error instanceof AppError)) {
    console.error(err);
    error = new AppError(500, 'INTERNAL_ERROR', 'Error inesperado.');
  }

  const body = { error: { code: error.code, message: error.message } };
  if (error.details) body.error.details = error.details;

  res.status(error.status).json(body);
}
