import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter(req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(415, 'INVALID_FILE_TYPE', 'La imagen debe ser JPG, PNG o WebP.'));
    }
  },
});

function requireImage(req, res, next) {
  if (!req.file) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Envía una imagen en el campo "image".'));
  }
  next();
}

export const imageUpload = [upload.single('image'), requireImage];
