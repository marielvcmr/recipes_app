import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RecipeSummary } from '@/api/types';
import { colors, fonts } from '@/styles/global';
import { timeAndDifficulty } from '@/utils/recipeOptions';

type SelectableRecipeRowProps = {
  recipe: RecipeSummary;
  checked: boolean;
  onToggle: () => void;
};

// Receta con casilla para marcarla (formulario de grupo)
export default function SelectableRecipeRow({ recipe, checked, onToggle }: SelectableRecipeRowProps) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={recipe.name}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && (
          <Image source={require('@/assets/images/profile/check.svg')} style={styles.check} contentFit="contain" />
        )}
      </View>
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {recipe.name}
        </Text>
        <Text style={styles.meta}>{timeAndDifficulty(recipe)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  pressed: {
    opacity: 0.7,
  },
  box: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  boxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  check: {
    width: 15,
    height: 15,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
