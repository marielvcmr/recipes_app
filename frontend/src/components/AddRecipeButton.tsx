import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { colors, primaryGradient } from '@/styles/global';

type AddRecipeButtonProps = {
  onPress: () => void;
};

// Botón flotante "+" abajo a la derecha, sobre la barra de pestañas
export default function AddRecipeButton({ onPress }: AddRecipeButtonProps) {
  // La barra de pestañas flota sobre la pantalla: el botón va justo encima de ella
  const tabBarHeight = useTabBarHeight();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Nueva receta"
      style={({ pressed }) => [styles.button, { bottom: tabBarHeight + 8 }, pressed && styles.pressed]}
    >
      <Image source={require('@/assets/images/recipes/fab-plus.svg')} style={styles.icon} contentFit="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 22,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    experimental_backgroundImage: primaryGradient,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    boxShadow: '0px 8px 16px rgba(173, 72, 52, 0.32), inset 0px 1px 0px rgba(255, 255, 255, 0.4)',
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 26,
    height: 26,
  },
});
