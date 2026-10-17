import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { GroupDetail, GroupRecipe } from '@/api/types';
import GroupRecipeRow from '@/components/GroupRecipeRow';
import IconButton from '@/components/IconButton';
import SearchBar from '@/components/SearchBar';
import { colors, fonts } from '@/styles/global';

type GroupViewProps = {
  group: GroupDetail | null;
  loading?: boolean;
  error?: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenRecipe: (recipe: GroupRecipe) => void;
  onRemoveRecipe: (recipe: GroupRecipe) => void;
  deleting?: boolean;
};

// Minúsculas y sin tildes, para buscar "limon" y encontrar "Pasta al limón"
function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const BACK_ICON = require('@/assets/images/groups/back.svg');

// Detalle de un grupo: sus recetas (A–Z, como las manda el backend) con buscador, editar y borrar
export default function GroupView({
  group,
  loading = false,
  error,
  onBack,
  onEdit,
  onDelete,
  onOpenRecipe,
  onRemoveRecipe,
  deleting = false,
}: GroupViewProps) {
  const [search, setSearch] = useState('');

  // El grupo ya trae todas sus recetas: la búsqueda se hace aquí, sin pedir nada al backend
  const recipes = useMemo(() => {
    const term = normalize(search);
    const all = group?.recipes ?? [];
    return term ? all.filter((recipe) => normalize(recipe.name).includes(term)) : all;
  }, [group, search]);

  if (loading || error || !group) {
    return (
      <View style={styles.container}>
        <IconButton icon={BACK_ICON} onPress={onBack} accessibilityLabel="Volver" />
        <View style={styles.status}>
          {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator color={colors.primary} />}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <IconButton icon={BACK_ICON} onPress={onBack} accessibilityLabel="Volver" disabled={deleting} />
        <View style={styles.actions}>
          <IconButton
            icon={require('@/assets/images/recipes/edit.svg')}
            onPress={onEdit}
            accessibilityLabel="Editar grupo"
            disabled={deleting}
          />
          {deleting ? (
            <View style={styles.deleting}>
              <ActivityIndicator color={colors.danger} />
            </View>
          ) : (
            <IconButton
              icon={require('@/assets/images/recipes/trash.svg')}
              onPress={onDelete}
              accessibilityLabel="Eliminar grupo"
              variant="danger"
            />
          )}
        </View>
      </View>

      <Text style={styles.title}>{group.name}</Text>
      <Text style={styles.count}>
        <Text style={styles.countNumber}>{group.recipeCount}</Text>
        {group.recipeCount === 1 ? ' receta' : ' recetas'} · A–Z
      </Text>

      <View style={styles.search}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar recetas en este grupo" />
      </View>

      <View style={styles.list}>
        {recipes.map((recipe) => (
          <GroupRecipeRow
            key={recipe.id}
            recipe={recipe}
            onPress={() => onOpenRecipe(recipe)}
            onRemove={() => onRemoveRecipe(recipe)}
          />
        ))}
        {recipes.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{search ? 'Sin resultados' : 'Este grupo está vacío'}</Text>
            <Text style={styles.emptyText}>
              {search ? 'Prueba con otra búsqueda.' : 'Toca el lápiz para añadir recetas.'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 22,
    paddingBottom: 40,
    paddingHorizontal: 22,
  },
  status: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: colors.error,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    gap: 7,
  },
  deleting: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingTop: 25,
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 31,
    lineHeight: 35.65,
  },
  count: {
    paddingTop: 4,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 34.5,
  },
  countNumber: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 26,
  },
  search: {
    paddingTop: 18,
  },
  list: {
    gap: 8,
    paddingTop: 18,
  },
  empty: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 32,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 21,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
