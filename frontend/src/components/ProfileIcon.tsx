import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/styles/global';

type ProfileIconProps = {
  name: string;
  // avatarColor del usuario; si no tiene, se usa el del tema
  color?: string;
  // Diámetro del círculo (88 en el perfil, 42 en encabezados, ~18 junto al nombre de un autor)
  size?: number;
};

// "Sofía Martín" -> "SM", "sofia" -> "S"
function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export default function ProfileIcon({ name, color = colors.avatar, size = 88 }: ProfileIconProps) {
  // En tamaños chicos se usa DM Sans (se lee mejor que la Playfair); en los mini avatares la inicial ocupa más
  const fontFamily = size < 60 ? fonts.bold : fonts.heading;
  const fontSize = Math.round(size * (size < 30 ? 0.5 : 0.31));

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.initials, { fontSize, fontFamily }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.white,
  },
});
