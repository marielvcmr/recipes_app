import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, glass, glassSurface } from '@/styles/global';

type ProfileBriefProps = {
  recipes: number;
  groups: number;
  // Al tocar cada número se va a su pestaña
  onPressRecipes: () => void;
  onPressGroups: () => void;
};

type StatProps = {
  value: number;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

function Stat({ value, label, onPress, style }: StatProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${value} ${label}, ver ${label.toLowerCase()}`}
      style={({ pressed }) => [styles.stat, style, pressed && styles.pressed]}
    >
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

export default function ProfileBrief({ recipes, groups, onPressRecipes, onPressGroups }: ProfileBriefProps) {
  return (
    <View style={styles.card}>
      <Stat value={recipes} label="Recetas" onPress={onPressRecipes} style={styles.divider} />
      <Stat value={groups} label="Grupos" onPress={onPressGroups} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    ...glassSurface,
    borderRadius: 17,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  pressed: {
    backgroundColor: glass.fillStrong,
  },
  divider: {
    borderRightWidth: 1.2,
    borderRightColor: glass.edge,
  },
  value: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 22,
  },
  label: {
    marginTop: 2,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
