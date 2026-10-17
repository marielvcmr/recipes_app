import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type ImageSourceKind = 'library' | 'camera';

// Lado más largo y calidad JPEG con que se sube. Más chica = sube más rápido: el backend la
// reenvía a Cloudinary, y con una conexión lenta cada 100 KB se notan. 1000 px sobra para las tarjetas
const MAX_SIZE = 1000;
const JPEG_QUALITY = 0.6;

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
  // Se achica por el lado más largo, para que una foto vertical tampoco suba gigante
  if (asset.width >= asset.height && asset.width > MAX_SIZE) {
    context.resize({ width: MAX_SIZE });
  } else if (asset.height > asset.width && asset.height > MAX_SIZE) {
    context.resize({ height: MAX_SIZE });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
  return saved.uri;
}
