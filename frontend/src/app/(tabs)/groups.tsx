import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import {
  addRecipesToGroup,
  createGroup,
  deleteGroup,
  getGroup,
  listGroups,
  removeRecipeFromGroup,
  renameGroup,
} from '@/api/groups';
import { getRecipe } from '@/api/recipes';
import type { Group, GroupDetail, GroupRecipe, Recipe } from '@/api/types';
import BottomSheet from '@/components/BottomSheet';
import GroupForm, { type GroupFormValues } from '@/components/GroupForm';
import GroupGrid from '@/components/GroupGrid';
import GroupView from '@/components/GroupView';
import RecipeView from '@/components/RecipeView';
import ScreenTitle from '@/components/ScreenTitle';
import SearchBar from '@/components/SearchBar';
import { colors, fonts } from '@/styles/global';
import { toFormErrors, type FormErrors } from '@/utils/errors';

const PAGE_SIZE = 20;

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error inesperado.';
}

// Qué muestra la hoja inferior: el detalle de un grupo, el formulario (crear o editar)
// o una receta del grupo (solo lectura; al cerrarla se vuelve al grupo)
type Sheet =
  | { mode: 'closed' }
  | { mode: 'detail'; id: string }
  | { mode: 'form'; group?: GroupDetail }
  | { mode: 'recipe'; groupId: string };

export default function GroupsScreen() {
  const insets = useSafeAreaInsets();

  // Búsqueda
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  // Lista paginada
  const [groups, setGroups] = useState<Group[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState<string>();
  // Para ignorar respuestas viejas si el usuario escribe rápido
  const requestId = useRef(0);

  // Hoja inferior
  const [sheet, setSheet] = useState<Sheet>({ mode: 'closed' });
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [detailError, setDetailError] = useState<string>();
  const [viewed, setViewed] = useState<Recipe | null>(null);
  const [viewError, setViewError] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>();

  // Espera 300 ms después de la última tecla antes de buscar
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPage = useCallback(
    async (pageToLoad: number) => {
      const id = ++requestId.current;
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);
      setListError(undefined);

      try {
        const result = await listGroups({ q: query || undefined, page: pageToLoad, limit: PAGE_SIZE });
        if (id !== requestId.current) return;
        setGroups((current) => (pageToLoad === 1 ? result.data : [...current, ...result.data]));
        setTotal(result.meta.total);
        setPage(pageToLoad);
      } catch (error) {
        if (id === requestId.current) setListError(errorMessage(error));
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [query],
  );

  // Se recarga al entrar a la pestaña (pudo cambiar algo en Mis recetas) y cada vez que cambia la búsqueda
  useFocusEffect(
    useCallback(() => {
      loadPage(1);
    }, [loadPage]),
  );

  const loadMore = () => {
    if (!loading && !loadingMore && groups.length < total) loadPage(page + 1);
  };

  // --- Hoja: detalle del grupo ---
  const loadDetail = async (id: string) => {
    setDetailError(undefined);
    try {
      setDetail(await getGroup(id));
    } catch (error) {
      setDetailError(errorMessage(error));
    }
  };

  const openGroup = (id: string) => {
    setDetail(null);
    setSheet({ mode: 'detail', id });
    loadDetail(id);
  };

  const backToGroup = (id: string) => setSheet({ mode: 'detail', id });

  // --- Hoja: receta del grupo (solo lectura) ---
  const openRecipe = async (groupId: string, recipe: GroupRecipe) => {
    setSheet({ mode: 'recipe', groupId });
    setViewed(null);
    setViewError(undefined);
    try {
      setViewed(await getRecipe(recipe.id));
    } catch (error) {
      setViewError(errorMessage(error));
    }
  };

  // --- Hoja: formulario (crear o editar) ---
  const openForm = (group?: GroupDetail) => {
    setFormErrors(undefined);
    setFormKey((key) => key + 1);
    setSheet({ mode: 'form', group });
  };

  const closeSheet = () => {
    if (!saving && !deleting) setSheet({ mode: 'closed' });
  };

  const handleSave = async ({ name, recipeIds }: GroupFormValues) => {
    const editing = sheet.mode === 'form' ? sheet.group : undefined;
    setSaving(true);
    setFormErrors(undefined);

    try {
      if (editing) {
        // El backend no tiene un "reemplazar recetas": se renombra y luego se añaden y quitan las diferencias
        if (name !== editing.name) await renameGroup(editing.id, name);

        const current = editing.recipes.map((recipe) => recipe.id);
        const added = recipeIds.filter((id) => !current.includes(id));
        const removed = current.filter((id) => !recipeIds.includes(id));
        if (added.length > 0) await addRecipesToGroup(editing.id, added);
        await Promise.all(removed.map((recipeId) => removeRecipeFromGroup(editing.id, recipeId)));

        backToGroup(editing.id);
        loadDetail(editing.id);
      } else {
        await createGroup({ name, recipeIds });
        setSheet({ mode: 'closed' });
      }
      loadPage(1);
    } catch (error) {
      setFormErrors(toFormErrors(error));
    } finally {
      setSaving(false);
    }
  };

  // Borrar un grupo borra también sus recetas (RF-17): se avisa cuántas antes de confirmar
  const handleDelete = () => {
    if (!detail) return;
    const count = detail.recipeCount;
    const message =
      count > 0
        ? `Se borrará "${detail.name}" y también ${count === 1 ? 'la receta' : `las ${count} recetas`} que contiene, aunque estén en otros grupos. No se puede deshacer.`
        : `Se borrará "${detail.name}". No se puede deshacer.`;

    Alert.alert('Eliminar grupo', message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteGroup(detail.id);
            setSheet({ mode: 'closed' });
            loadPage(1);
          } catch (error) {
            Alert.alert('No se pudo eliminar el grupo', errorMessage(error));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  // Quitar una receta es un borrado lógico y reversible: se quita de la lista al instante, sin confirmar
  const handleRemoveRecipe = async (recipe: GroupRecipe) => {
    if (!detail) return;
    const before = detail;
    setDetail({
      ...before,
      recipes: before.recipes.filter((item) => item.id !== recipe.id),
      recipeCount: before.recipeCount - 1,
    });

    try {
      await removeRecipeFromGroup(before.id, recipe.id);
      loadPage(1);
    } catch (error) {
      setDetail(before);
      Alert.alert('No se pudo quitar la receta', errorMessage(error));
    }
  };

  const header = (
    <View style={styles.headerBlock}>
      <ScreenTitle lead="Tus" accent="grupos" />
      <Text style={styles.intro}>
        Organiza y clasifica tus recetas en uno o varios grupos para encontrar lo que necesitas en cada ocasión.
      </Text>
      <View style={styles.search}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar grupos" />
      </View>
    </View>
  );

  let footer = null;
  if (loading || loadingMore) {
    footer = <ActivityIndicator style={styles.footer} color={colors.primary} />;
  } else if (listError) {
    footer = (
      <View style={styles.status}>
        <Text style={styles.statusText}>{listError}</Text>
        <Pressable onPress={() => loadPage(1)} accessibilityRole="button">
          <Text style={styles.retry}>Reintentar</Text>
        </Pressable>
      </View>
    );
  } else if (groups.length === 0 && query) {
    footer = (
      <View style={styles.status}>
        <Text style={styles.statusTitle}>Sin resultados</Text>
        <Text style={styles.statusText}>Ningún grupo coincide con “{query}”.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <GroupGrid
        groups={groups}
        onCreate={() => openForm()}
        onOpen={(group) => openGroup(group.id)}
        header={header}
        footer={footer}
        onEndReached={loadMore}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 27 }]}
      />

      <BottomSheet visible={sheet.mode !== 'closed'} onClose={closeSheet}>
        {sheet.mode === 'detail' && (
          <GroupView
            group={detail}
            loading={!detail && !detailError}
            error={detailError}
            onBack={closeSheet}
            onEdit={() => detail && openForm(detail)}
            onDelete={handleDelete}
            onOpenRecipe={(recipe) => openRecipe(sheet.id, recipe)}
            onRemoveRecipe={handleRemoveRecipe}
            deleting={deleting}
          />
        )}
        {sheet.mode === 'form' && (
          <GroupForm
            key={formKey}
            group={sheet.group}
            onSubmit={handleSave}
            // Al editar, cerrar vuelve al detalle del grupo
            onClose={() => {
              if (saving) return;
              if (sheet.group) backToGroup(sheet.group.id);
              else closeSheet();
            }}
            loading={saving}
            errors={formErrors}
          />
        )}
        {sheet.mode === 'recipe' && (
          <RecipeView
            recipe={viewed}
            loading={!viewed && !viewError}
            error={viewError}
            onClose={() => backToGroup(sheet.groupId)}
          />
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  headerBlock: {
    paddingBottom: 24,
  },
  intro: {
    paddingTop: 12,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23.25,
  },
  search: {
    paddingTop: 18,
  },
  footer: {
    paddingVertical: 24,
  },
  status: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 36,
  },
  statusTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 21,
  },
  statusText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  retry: {
    marginTop: 6,
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
