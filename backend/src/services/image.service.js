/*
This file is the only one that talks to Cloudinary. The recipe, group and user services only call uploadImage and deleteImages, without knowing how Cloudinary works. If you ever switched providers, this is the only file that would need to be changed.
 */

import { cloudinary } from '../config/cloudinary.js';

const FOLDER = 'cookplan/recipes';

export function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: 'image',
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export async function deleteImages(publicIds) {
  const ids = publicIds.filter(Boolean);
  const results = await Promise.allSettled(ids.map((id) => cloudinary.uploader.destroy(id)));

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('No se pudo borrar una imagen de Cloudinary:', result.reason);
    }
  }
}
