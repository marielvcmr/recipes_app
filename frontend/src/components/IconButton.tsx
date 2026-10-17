import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import { colors, glass, glassCircle } from '@/styles/global';

type IconButtonProps = {
  icon: ImageSource | number;
  onPress: () => void;
  accessibilityLabel: string;
  // danger: fondo rosado (borrar)
  variant?: 'neutral' | 'danger';
  disabled?: boolean;
};

// Botón redondo de 36 px con un ícono (cerrar, volver, editar, borrar)
export default function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'neutral',
  disabled = false,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        variant === 'danger' && styles.danger,
        (pressed || disabled) && styles.pressed,
      ]}
    >
      <Image source={icon} style={styles.icon} contentFit="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...glassCircle,
  },
  danger: {
    backgroundColor: glass.danger,
    borderColor: colors.dangerBorder,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 22,
    height: 22,
  },
});
