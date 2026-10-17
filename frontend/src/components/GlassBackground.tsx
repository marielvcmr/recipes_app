import { StyleSheet, View } from 'react-native';

import { colors } from '@/styles/global';

// Fondo de las pantallas: crema con manchas difusas de los colores de la app (coral, dorado y vino).
// Es lo que se ve "a través" de las superficies de vidrio (glassSurface). Va como primer hijo, detrás de todo.
export default function GlassBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.base]} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, styles.coral]} />
      <View style={[StyleSheet.absoluteFill, styles.gold]} />
      <View style={[StyleSheet.absoluteFill, styles.wine]} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
  },
  coral: {
    experimental_backgroundImage: 'radial-gradient(circle at 92% 4%, rgba(223, 121, 95, 0.2) 0%, rgba(223, 121, 95, 0) 42%)',
  },
  gold: {
    experimental_backgroundImage: 'radial-gradient(circle at 4% 48%, rgba(214, 168, 79, 0.16) 0%, rgba(214, 168, 79, 0) 40%)',
  },
  wine: {
    experimental_backgroundImage: 'radial-gradient(circle at 85% 92%, rgba(155, 98, 88, 0.14) 0%, rgba(155, 98, 88, 0) 45%)',
  },
});
