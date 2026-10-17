import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '@/styles/global';

type AddRecipeButtonProps = {
  onPress: () => void;
};

// Botón flotante "+" abajo a la derecha, sobre la barra de pestañas
export default function AddRecipeButton({ onPress }: AddRecipeButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Nueva receta"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Image source={require('@/assets/images/recipes/fab-plus.svg')} style={styles.icon} contentFit="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 22,
    bottom: 8,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: '0px 8px 10px rgba(173, 72, 52, 0.3)',
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 26,
    height: 26,
  },
});
