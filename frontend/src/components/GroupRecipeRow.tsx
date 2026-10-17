import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GroupRecipe } from '@/api/types';
import RecipeImage from '@/components/RecipeImage';
import { colors, fonts } from '@/styles/global';
import { timeAndDifficulty } from '@/utils/recipeOptions';

type GroupRecipeRowProps = {
  recipe: GroupRecipe;
  onPress: () => void;
  // Quita la receta del grupo (no la borra)
  onRemove: () => void;
};

// Receta dentro del detalle de un grupo: foto, nombre, info y la × para quitarla
export default function GroupRecipeRow({ recipe, onPress, onRemove }: GroupRecipeRowProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={styles.image}>
          <RecipeImage uri={recipe.imageUrl} iconSize={24} />
        </View>
        <View style={styles.text}>
          <Text style={styles.name} numberOfLines={1}>
            {recipe.name}
          </Text>
          <Text style={styles.meta}>{timeAndDifficulty(recipe)}</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`Quitar ${recipe.name} del grupo`}
        hitSlop={6}
        style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
      >
        <Image source={require('@/assets/images/recipes/close.svg')} style={styles.removeIcon} contentFit="contain" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    width: 66,
    height: 62,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 21.6,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  remove: {
    padding: 8,
  },
  removeIcon: {
    width: 17,
    height: 17,
  },
});
