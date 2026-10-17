import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Recipe } from '@/api/types';
import ProfileIcon from '@/components/ProfileIcon';
import RecipeImage from '@/components/RecipeImage';
import { colors, fonts } from '@/styles/global';
import { difficultyLabel } from '@/utils/recipeOptions';

type RecipeViewProps = {
  recipe: Recipe | null;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  // Editar y Eliminar solo se muestran si la receta es mía (recipe.isMine) y se pasan ambos
  // (desde el detalle de un grupo se abre en solo lectura)
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
};

const IMAGE_HEIGHT = 295;

function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Cerrar"
      hitSlop={8}
      style={({ pressed }) => [styles.close, pressed && styles.pressed]}
    >
      <Image source={require('@/assets/images/recipes/close.svg')} style={styles.closeIcon} contentFit="contain" />
    </Pressable>
  );
}

export default function RecipeView({
  recipe,
  loading = false,
  error,
  onClose,
  onEdit,
  onDelete,
  deleting = false,
}: RecipeViewProps) {
  if (loading || error || !recipe) {
    return (
      <View style={styles.status}>
        <CloseButton onPress={onClose} />
        {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator color={colors.primary} />}
      </View>
    );
  }

  const meta = [difficultyLabel(recipe.difficulty), `${recipe.timeMinutes} min`, recipe.isPublic ? 'Pública' : 'Privada'];

  return (
    <View>
      <View style={styles.hero}>
        <RecipeImage uri={recipe.imageUrl} iconSize={56} />
        {/* Oscurece arriba (para el botón) y sobre todo abajo (para que el texto blanco se lea) */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.15)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.75)']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        <CloseButton onPress={onClose} />

        <View style={styles.heroText}>
          <Text style={styles.meta}>{meta.join(' · ')}</Text>
          <Text style={styles.title}>{recipe.name}</Text>
          <View style={styles.author}>
            <ProfileIcon name={recipe.owner.username} color={recipe.owner.avatarColor} size={20} />
            <Text style={styles.authorText}>
              por <Text style={styles.authorName}>{recipe.owner.username}</Text>
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.description}>{recipe.description}</Text>

        <Text style={styles.heading}>Ingredientes</Text>
        <View style={styles.list}>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredient}>
              <View style={styles.diamond} />
              <Text style={styles.itemText}>
                {ingredient.name} · {ingredient.quantity} {ingredient.unit}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.heading}>Preparación</Text>
        <View style={styles.list}>
          {recipe.steps.map((step) => (
            <View key={step.position} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.position}</Text>
              </View>
              <Text style={[styles.itemText, styles.stepText]}>{step.description}</Text>
            </View>
          ))}
        </View>

        {recipe.isMine && onEdit && onDelete && (
          <View style={styles.actions}>
            <Pressable
              onPress={onEdit}
              disabled={deleting}
              accessibilityRole="button"
              style={({ pressed }) => [styles.action, styles.editAction, pressed && styles.pressed]}
            >
              <Image source={require('@/assets/images/recipes/edit.svg')} style={styles.actionIcon} contentFit="contain" />
              <Text style={styles.editLabel}>Editar</Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              disabled={deleting}
              accessibilityRole="button"
              style={({ pressed }) => [styles.action, styles.deleteAction, (pressed || deleting) && styles.pressed]}
            >
              {deleting ? (
                <ActivityIndicator color={colors.danger} />
              ) : (
                <>
                  <Image
                    source={require('@/assets/images/recipes/trash.svg')}
                    style={styles.actionIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.deleteLabel}>Eliminar</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  hero: {
    height: IMAGE_HEIGHT,
  },
  close: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 39,
    height: 39,
    borderRadius: 19.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  closeIcon: {
    width: 22,
    height: 22,
  },
  pressed: {
    opacity: 0.7,
  },
  heroText: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 18,
  },
  meta: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16.5,
    letterSpacing: 1.21,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 4,
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 31,
    lineHeight: 34.72,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 8,
  },
  authorText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  authorName: {
    color: colors.white,
    fontFamily: fonts.bold,
  },
  body: {
    paddingTop: 23,
    paddingBottom: 38,
    paddingHorizontal: 24,
  },
  description: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23.25,
  },
  heading: {
    paddingTop: 23,
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 21,
  },
  list: {
    gap: 11,
    paddingTop: 13,
  },
  ingredient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // Rombo: un cuadrado con borde rotado 45°
  diamond: {
    width: 6,
    height: 6,
    borderWidth: 1.2,
    borderColor: colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  itemText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumber: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.badge,
  },
  stepNumberText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: 19.5,
  },
  stepText: {
    flex: 1,
    paddingTop: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: 9,
    paddingTop: 28,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 44,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderRadius: 12,
  },
  editAction: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  deleteAction: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
  },
  actionIcon: {
    width: 17,
    height: 17,
  },
  editLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
  },
  deleteLabel: {
    color: colors.danger,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
  },
});
