import { Pressable, StyleSheet, Text } from 'react-native';

import type { Group } from '@/api/types';
import GroupCover from '@/components/GroupCover';
import { colors, fonts, groupColors } from '@/styles/global';

type GroupCardProps = {
  group: Group;
  // Posición en la lista: decide el número y el color de la portada
  index: number;
  onPress: () => void;
};

export default function GroupCard({ group, index, onPress }: GroupCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${group.name}, ${group.recipeCount} recetas`}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <GroupCover urls={group.coverUrls} color={groupColors[index % groupColors.length]} index={index} />
      <Text style={styles.name} numberOfLines={1}>
        {group.name}
      </Text>
      <Text style={styles.count}>
        {group.recipeCount} {group.recipeCount === 1 ? 'receta' : 'recetas'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  name: {
    paddingTop: 10,
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 17,
  },
  count: {
    paddingTop: 2,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19.5,
  },
});
