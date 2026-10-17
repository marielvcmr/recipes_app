import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type ImageSourceKind = 'library' | 'camera';

// Ancho máximo: el backend igual la limita a 1200 px en Cloudinary
const MAX_WIDTH = 1200;

// Abre la galería o la cámara y devuelve la foto lista para subir (o null si se canceló).
// Siempre la convierte a JPEG y la achica: el backend solo acepta JPG/PNG/WebP de hasta 5 MB,
// y el iPhone puede entregar fotos HEIC muy pesadas.
export async function pickRecipeImage(kind: ImageSourceKind): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  };

  let result: ImagePicker.ImagePickerResult;
  if (kind === 'camera') {
    // La cámara siempre pide permiso; la galería no lo necesita
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Sin permiso para usar la cámara. Actívalo en los ajustes del teléfono.');
    }
    result = await ImagePicker.launchCameraAsync(options);
  } else {
    result = await ImagePicker.launchImageLibraryAsync(options);
  }

  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];

  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > MAX_WIDTH) context.resize({ width: MAX_WIDTH });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.7 });
  return saved.uri;
}
