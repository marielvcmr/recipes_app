import { AppError } from '../utils/AppError.js';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new AppError(400, 'VALIDATION_ERROR', 'Hay campos inválidos.', details));
    }

    if (source === 'query') {
      req.validatedQuery = result.data;
    } else {
      req.body = result.data;
    }
    next();
  };
}

