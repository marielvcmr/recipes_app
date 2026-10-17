import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/styles/global';

type ProfileIconProps = {
  name: string;
  // avatarColor del usuario; si no tiene, se usa el del tema
  color?: string;
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

export default function ProfileIcon({ name, color = colors.avatar }: ProfileIconProps) {
  return (
    <View style={[styles.circle, { backgroundColor: color }]}>
      <Text style={styles.initials}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 27,
  },
});
