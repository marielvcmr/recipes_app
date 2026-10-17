import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RecipeSummary } from '@/api/types';
import ProfileIcon from '@/components/ProfileIcon';
import RecipeImage from '@/components/RecipeImage';
import { colors, fonts } from '@/styles/global';
import { difficultyLabel } from '@/utils/recipeOptions';

type RecipeCardProps = {
  recipe: RecipeSummary;
  onPress: () => void;
};

export default function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver receta ${recipe.name}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageBox}>
        <RecipeImage uri={recipe.imageUrl} iconSize={30} />

        {/* Autor de la receta, sobre la foto */}
        <View style={styles.author}>
          <ProfileIcon name={recipe.owner.username} color={recipe.owner.avatarColor} size={16} />
          <Text style={styles.authorName} numberOfLines={1}>
            {recipe.owner.username}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>

        <View style={styles.meta}>
          <Image source={require('@/assets/images/recipes/clock.svg')} style={styles.clock} contentFit="contain" />
          <Text style={styles.metaText}>{recipe.timeMinutes} min</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>{difficultyLabel(recipe.difficulty)}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={[styles.visibility, { color: recipe.isPublic ? colors.primary : colors.avatar }]}>
            {recipe.isPublic ? 'Pública' : 'Privada'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    minHeight: 122,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 18,
  },
  pressed: {
    opacity: 0.85,
  },
  imageBox: {
    width: 116,
  },
  author: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 3,
    paddingLeft: 3,
    paddingRight: 7,
    backgroundColor: 'rgba(24, 25, 20, 0.55)',
    borderRadius: 10,
  },
  authorName: {
    flexShrink: 1,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 14,
  },
  body: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 14,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 21.6,
  },
  description: {
    marginTop: 6,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18.85,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
    paddingTop: 10,
  },
  clock: {
    width: 16,
    height: 16,
  },
  metaText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  dot: {
    color: colors.dot,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  visibility: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 18,
  },
});
