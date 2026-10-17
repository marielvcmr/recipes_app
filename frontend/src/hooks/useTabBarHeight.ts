import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Alto de la barra de pestañas sin contar la barra de gestos/botones del sistema
const TAB_BAR_HEIGHT = 72;

// La barra de pestañas flota sobre las pantallas (es de vidrio y deja ver el contenido detrás):
// las listas y los botones flotantes usan este alto para no quedar tapados por ella
export function useTabBarHeight() {
  return TAB_BAR_HEIGHT + useSafeAreaInsets().bottom;
}
