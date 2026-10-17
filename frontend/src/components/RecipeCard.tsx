import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RecipeSummary } from '@/api/types';
import ProfileIcon from '@/components/ProfileIcon';
import RecipeImage from '@/components/RecipeImage';
import { colors, fonts, glass, glassSurface } from '@/styles/global';
import { difficultyLabel } from '@/utils/recipeOptions';

type RecipeCardProps = {
  recipe: RecipeSummary;
  onPress: () => void;
  // mine (Mis recetas): autor sobre la foto y si es pública o privada.
  // explore (Explorar): "Por autor" bajo el título y cuántos ingredientes tiene
  variant?: 'mine' | 'explore';
  // Si viene, se muestra una papelera en la esquina para borrar sin abrir la receta
  onDelete?: () => void;
};

export default function RecipeCard({ recipe, onPress, variant = 'mine', onDelete }: RecipeCardProps) {
  const explore = variant === 'explore';
  const authorColor = recipe.owner.avatarColor ?? colors.avatar;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={explore ? `Ver receta ${recipe.name}, por ${recipe.owner.username}` : `Ver receta ${recipe.name}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageBox}>
        {/* Posición absoluta: la foto se adapta al alto que le dé el texto y nunca estira la tarjeta */}
        <View style={StyleSheet.absoluteFill}>
          <RecipeImage uri={recipe.imageUrl} iconSize={30} />
        </View>

        {/* Autor de la receta, sobre la foto */}
        {!explore && (
          <View style={styles.author}>
            <ProfileIcon name={recipe.owner.username} color={recipe.owner.avatarColor} size={16} />
            <Text style={styles.authorName} numberOfLines={1}>
              {recipe.owner.username}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {/* Hasta 2 líneas: el formulario limita el título para que quepa sin "…" */}
        <Text style={[styles.title, !!onDelete && styles.titleWithDelete]} numberOfLines={2}>
          {recipe.name}
        </Text>
        {/* Autor: su nombre sobre su color de perfil */}
        {explore && (
          <View style={styles.byline}>
            <Text style={styles.bylineText}>Por</Text>
            {/* Fondo: el color de perfil muy aclarado (hex + alfa 22%); texto en ese mismo color */}
            <View style={[styles.authorChip, { backgroundColor: `${authorColor}38` }]}>
              <Text style={[styles.authorChipText, { color: authorColor }]} numberOfLines={1}>
                {recipe.owner.username}
              </Text>
            </View>
          </View>
        )}
        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>

        <View style={styles.meta}>
          <Image source={require('@/assets/images/recipes/clock.svg')} style={styles.clock} contentFit="contain" />
          <Text style={styles.metaText}>{recipe.timeMinutes} min</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>{difficultyLabel(recipe.difficulty)}</Text>
          <Text style={styles.dot}>•</Text>
          {explore ? (
            <Text style={styles.metaText}>{recipe.ingredientCount} ing.</Text>
          ) : (
            <Text style={[styles.visibility, { color: recipe.isPublic ? colors.primary : colors.avatar }]}>
              {recipe.isPublic ? 'Pública' : 'Privada'}
            </Text>
          )}
        </View>
      </View>

      {onDelete && (
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar receta ${recipe.name}`}
          hitSlop={8}
          style={({ pressed }) => [styles.delete, pressed && styles.deletePressed]}
        >
          <Image source={require('@/assets/images/recipes/trash.svg')} style={styles.deleteIcon} contentFit="contain" />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    minHeight: 122,
    overflow: 'hidden',
    ...glassSurface,
    backgroundColor: glass.fillStrong,
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
  // Deja lugar a la papelera de la esquina
  titleWithDelete: {
    paddingRight: 26,
  },
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  bylineText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  authorChip: {
    flexShrink: 1,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 9,
    boxShadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.6)',
  },
  authorChipText: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    lineHeight: 17,
  },
  delete: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glass.danger,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    boxShadow: glass.shadowSmall,
  },
  deletePressed: {
    opacity: 0.7,
  },
  deleteIcon: {
    width: 15,
    height: 15,
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
