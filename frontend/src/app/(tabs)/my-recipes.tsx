import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { listGroups } from '@/api/groups';
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listMyRecipes,
  removeRecipeImage,
  updateRecipe,
  uploadRecipeImage,
} from '@/api/recipes';
import type { Group, Recipe, RecipeSummary } from '@/api/types';
import AddRecipeButton from '@/components/AddRecipeButton';
import AlphabetIndex from '@/components/AlphabetIndex';
import BottomSheet from '@/components/BottomSheet';
import GlassBackground from '@/components/GlassBackground';
import RecipeCard from '@/components/RecipeCard';
import RecipeForm, { type RecipeFormValues } from '@/components/RecipeForm';
import RecipeView from '@/components/RecipeView';
import ScreenHeader from '@/components/ScreenHeader';
import SearchBar from '@/components/SearchBar';
import SegmentedRecipeTab, { type VisibilityFilter } from '@/components/SegmentedRecipeTab';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { colors, fonts } from '@/styles/global';
import { initialOf } from '@/utils/alphabet';
import { toFormErrors, type FormErrors } from '@/utils/errors';

const PAGE_SIZE = 20;
// Espacio libre al final de la lista, además del alto de la barra de pestañas (para que el botón + no tape la última receta)
const CONTENT_BOTTOM = 90;

type Section = { title: string; data: RecipeSummary[] };

function groupByInitial(recipes: RecipeSummary[]) {
  const sections: Section[] = [];
  for (const recipe of recipes) {
    const title = initialOf(recipe.name);
    const last = sections[sections.length - 1];
    if (last?.title === title) last.data.push(recipe);
    else sections.push({ title, data: [recipe] });
  }
  return sections;
}

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error inesperado.';
}

// Qué muestra la hoja inferior: la receta abierta o el formulario (crear o editar)
type Sheet = { mode: 'closed' } | { mode: 'view'; id: string } | { mode: 'form'; recipe?: Recipe };

export default function MyRecipesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  // Búsqueda y filtro
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search);
  const [visibility, setVisibility] = useState<VisibilityFilter>(undefined);

  // Lista paginada
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState<string>();
  // Para ignorar respuestas viejas si el usuario escribe rápido o cambia de filtro
  const requestId = useRef(0);

  // Hoja inferior
  const [sheet, setSheet] = useState<Sheet>({ mode: 'closed' });
  const [viewed, setViewed] = useState<Recipe | null>(null);
  const [viewError, setViewError] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [formKey, setFormKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>();

  const loadPage = useCallback(
    async (pageToLoad: number) => {
      const id = ++requestId.current;
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);
      setListError(undefined);

      try {
        const result = await listMyRecipes({ q: query || undefined, visibility, page: pageToLoad, limit: PAGE_SIZE });
        if (id !== requestId.current) return;
        setRecipes((current) => (pageToLoad === 1 ? result.data : [...current, ...result.data]));
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
    [query, visibility],
  );

  // Se recarga al entrar a la pestaña y cada vez que cambia la búsqueda o el filtro
  useFocusEffect(
    useCallback(() => {
      loadPage(1);
    }, [loadPage]),
  );

  const loadMore = () => {
    if (!loading && !loadingMore && recipes.length < total) loadPage(page + 1);
  };

  const sections = useMemo(() => groupByInitial(recipes), [recipes]);
  const letters = useMemo(() => sections.map((section) => section.title), [sections]);

  // --- Índice alfabético: salta a la sección de la letra elegida ---
  const listRef = useRef<SectionList<RecipeSummary, Section>>(null);
  // Si la sección todavía no se dibujó, se reintenta una vez tras acercarse (ver onScrollToIndexFailed)
  const pendingSection = useRef<number | null>(null);

  const scrollToSection = (sectionIndex: number) => {
    listRef.current?.scrollToLocation({ sectionIndex, itemIndex: 0, animated: false });
  };

  const jumpToLetter = (letter: string) => {
    const sectionIndex = sections.findIndex((section) => section.title === letter);
    if (sectionIndex === -1) return;
    pendingSection.current = sectionIndex;
    scrollToSection(sectionIndex);
  };

  // --- Hoja: ver receta ---
  const openRecipe = async (id: string) => {
    setSheet({ mode: 'view', id });
    setViewed(null);
    setViewError(undefined);
    try {
      setViewed(await getRecipe(id));
    } catch (error) {
      setViewError(errorMessage(error));
    }
  };

  // --- Hoja: formulario (crear o editar) ---
  const openForm = (recipe?: Recipe) => {
    setFormErrors(undefined);
    setFormKey((key) => key + 1);
    setSheet({ mode: 'form', recipe });
    // Mis grupos, para el dropdown "Grupos" del formulario (el backend permite hasta 50 por página)
    listGroups({ limit: 50 })
      .then((result) => setGroups(result.data))
      .catch(() => setGroups([]));
  };

  const closeSheet = () => {
    if (!saving && !deleting) setSheet({ mode: 'closed' });
  };

  const handleSave = async ({ input, photo }: RecipeFormValues) => {
    const editing = sheet.mode === 'form' ? sheet.recipe : undefined;
    setSaving(true);
    setFormErrors(undefined);

    try {
      // 1. La receta (JSON). Al editar se manda completa: el backend acepta cualquier subconjunto
      const saved = editing ? await updateRecipe(editing.id, input) : await createRecipe(input);

      // 2. La foto, aparte (multipart): solo se puede subir cuando la receta ya existe
      let photoError: string | undefined;
      try {
        if (photo.kind === 'new') await uploadRecipeImage(saved.id, photo.uri);
        else if (photo.kind === 'remove') await removeRecipeImage(saved.id);
      } catch (error) {
        photoError = errorMessage(error);
      }

      setSheet({ mode: 'closed' });
      loadPage(1);
      if (photoError) {
        Alert.alert('La receta se guardó, pero la foto no', photoError);
      }
    } catch (error) {
      setFormErrors(toFormErrors(error));
    } finally {
      setSaving(false);
    }
  };

  // Se usa desde la receta abierta y desde la papelera de cada tarjeta
  const confirmDelete = (recipe: { id: string; name: string }) => {
    Alert.alert('Eliminar receta', `Se borrará "${recipe.name}" y se quitará de tus grupos. No se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteRecipe(recipe.id);
            setSheet({ mode: 'closed' });
            loadPage(1);
          } catch (error) {
            Alert.alert('No se pudo eliminar la receta', errorMessage(error));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const filtered = !!query || !!visibility;

  const header = (
    <View style={styles.headerBlock}>
      <ScreenHeader lead="Mis" accent="recetas" />

      <View style={styles.search}>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>

      <Text style={styles.count}>
        {total} {total === 1 ? 'receta' : 'recetas'} · A–Z
      </Text>

      <View style={styles.segmented}>
        <SegmentedRecipeTab value={visibility} onChange={setVisibility} />
      </View>
    </View>
  );

  const empty = loading ? (
    <ActivityIndicator style={styles.status} color={colors.primary} />
  ) : listError ? (
    <View style={styles.status}>
      <Text style={styles.statusText}>{listError}</Text>
      <Pressable onPress={() => loadPage(1)} accessibilityRole="button">
        <Text style={styles.retry}>Reintentar</Text>
      </Pressable>
    </View>
  ) : (
    <View style={styles.status}>
      <Text style={styles.statusTitle}>{filtered ? 'Sin resultados' : 'Aún no tienes recetas'}</Text>
      <Text style={styles.statusText}>
        {filtered ? 'Prueba con otra búsqueda o filtro.' : 'Toca el botón + para crear la primera.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <GlassBackground />
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={() => openRecipe(item.id)} onDelete={() => confirmDelete(item)} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLetter}>{section.title}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        stickySectionHeadersEnabled={false}
        // Las tarjetas no tienen alto fijo: si la sección está lejos, primero se acerca con el alto promedio
        onScrollToIndexFailed={(info) => {
          listRef.current?.getScrollResponder()?.scrollTo({ y: info.averageItemLength * info.index, animated: false });
          const sectionIndex = pendingSection.current;
          pendingSection.current = null;
          if (sectionIndex !== null) setTimeout(() => scrollToSection(sectionIndex), 50);
        }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 27, paddingBottom: tabBarHeight + CONTENT_BOTTOM }]}
      />

      {sections.length > 0 && (
        <View style={[styles.index, { top: insets.top, bottom: tabBarHeight }]} pointerEvents="box-none">
          <AlphabetIndex available={letters} onSelect={jumpToLetter} />
        </View>
      )}

      <AddRecipeButton onPress={() => openForm()} />

      <BottomSheet visible={sheet.mode !== 'closed'} onClose={closeSheet}>
        {sheet.mode === 'view' && (
          <RecipeView
            recipe={viewed}
            loading={!viewed && !viewError}
            error={viewError}
            onClose={closeSheet}
            onEdit={() => viewed && openForm(viewed)}
            onDelete={() => viewed && confirmDelete(viewed)}
            deleting={deleting}
          />
        )}
        {sheet.mode === 'form' && (
          <RecipeForm
            key={formKey}
            recipe={sheet.recipe}
            groups={groups}
            onSubmit={handleSave}
            onClose={closeSheet}
            loading={saving}
            errors={formErrors}
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
  // A la izquierda, dentro del margen de 22 que dejan las tarjetas
  index: {
    position: 'absolute',
    left: 2,
  },
  content: {
    paddingHorizontal: 22,
  },
  headerBlock: {
    paddingBottom: 8,
  },
  search: {
    paddingTop: 24,
  },
  count: {
    paddingTop: 25,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  segmented: {
    paddingTop: 14,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 10,
    paddingTop: 8,
    paddingBottom: 9,
    paddingHorizontal: 2,
    borderBottomWidth: 1.2,
    borderBottomColor: colors.border,
  },
  sectionLetter: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 25,
    lineHeight: 25,
  },
  separator: {
    height: 12,
  },
  footer: {
    paddingVertical: 16,
  },
  status: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 48,
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
