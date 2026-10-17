import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, glass } from '@/styles/global';

type ProfileOptionProps = {
  icon: ImageSource | number;
  label: string;
  onPress: () => void;
  // Texto en rojo, para acciones destructivas como eliminar la cuenta
  danger?: boolean;
  // La última opción del menú no lleva línea divisoria abajo
  last?: boolean;
};

export default function ProfileOption({
  icon,
  label,
  onPress,
  danger = false,
  last = false,
}: ProfileOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, !last && styles.divider, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        <Image source={icon} style={styles.icon} contentFit="contain" />
        <Text style={[styles.label, danger && styles.danger]}>{label}</Text>
      </View>
      <Image
        source={require('@/assets/images/profile/chevron-right.svg')}
        style={styles.chevron}
        contentFit="contain"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: 1.2,
    borderBottomColor: glass.edge,
  },
  pressed: {
    backgroundColor: glass.fillStrong,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  icon: {
    width: 22,
    height: 22,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22.5,
  },
  danger: {
    color: colors.danger,
  },
  chevron: {
    width: 18,
    height: 18,
  },
});
