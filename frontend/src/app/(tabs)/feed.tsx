import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { getRecipe, listFeed } from '@/api/recipes';
import type { Recipe, RecipeSummary } from '@/api/types';
import AlphabetIndex from '@/components/AlphabetIndex';
import BottomSheet from '@/components/BottomSheet';
import GlassBackground from '@/components/GlassBackground';
import RecipeCard from '@/components/RecipeCard';
import RecipeView from '@/components/RecipeView';
import ScreenHeader from '@/components/ScreenHeader';
import SearchBar from '@/components/SearchBar';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { colors, fonts } from '@/styles/global';
import { initialOf } from '@/utils/alphabet';

const PAGE_SIZE = 20;
// Espacio libre al final de la lista, además del alto de la barra de pestañas
const CONTENT_BOTTOM = 40;

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error inesperado.';
}

// Explorar: recetas públicas de otros usuarios. Solo se pueden ver (no editar ni borrar)
export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  // Búsqueda
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search);

  // Lista paginada
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState<string>();
  // Para ignorar respuestas viejas si el usuario escribe rápido
  const requestId = useRef(0);

  // Hoja inferior con la receta
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewed, setViewed] = useState<Recipe | null>(null);
  const [viewError, setViewError] = useState<string>();

  const loadPage = useCallback(
    async (pageToLoad: number) => {
      const id = ++requestId.current;
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);
      setListError(undefined);

      try {
        const result = await listFeed({ q: query || undefined, page: pageToLoad, limit: PAGE_SIZE });
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
    [query],
  );

  // Se recarga al entrar a la pestaña (otros pudieron publicar algo) y cada vez que cambia la búsqueda
  useFocusEffect(
    useCallback(() => {
      loadPage(1);
    }, [loadPage]),
  );

  const loadMore = () => {
    if (!loading && !loadingMore && recipes.length < total) loadPage(page + 1);
  };

  // --- Índice alfabético: salta a la primera receta de la letra elegida (la lista ya viene A–Z) ---
  const letters = useMemo(() => [...new Set(recipes.map((recipe) => initialOf(recipe.name)))], [recipes]);
  const listRef = useRef<FlatList<RecipeSummary>>(null);
  // Si esa receta todavía no se dibujó, se reintenta una vez tras acercarse (ver onScrollToIndexFailed)
  const pendingIndex = useRef<number | null>(null);

  const scrollToRecipe = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: false });
  };

  const jumpToLetter = (letter: string) => {
    const index = recipes.findIndex((recipe) => initialOf(recipe.name) === letter);
    if (index === -1) return;
    pendingIndex.current = index;
    scrollToRecipe(index);
  };

  const openRecipe = async (id: string) => {
    setSheetOpen(true);
    setViewed(null);
    setViewError(undefined);
    try {
      setViewed(await getRecipe(id));
    } catch (error) {
      setViewError(errorMessage(error));
    }
  };

  const header = (
    <View style={styles.headerBlock}>
      <ScreenHeader lead="¿Qué cocinamos" accent="hoy?" />

      <View style={styles.search}>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>

      <Text style={styles.sectionTitle}>Lo que otros cocinan</Text>
      <Text style={styles.count}>
        {total} {total === 1 ? 'receta' : 'recetas'} · A–Z
      </Text>
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
      <Text style={styles.statusTitle}>{query ? 'Sin resultados' : 'Aún no hay recetas públicas'}</Text>
      <Text style={styles.statusText}>
        {query ? 'Prueba con otra búsqueda.' : 'Cuando otros publiquen recetas aparecerán aquí.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <GlassBackground />
      <FlatList
        ref={listRef}
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeCard recipe={item} variant="explore" onPress={() => openRecipe(item.id)} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        // Las tarjetas no tienen alto fijo: si la receta está lejos, primero se acerca con el alto promedio
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
          const index = pendingIndex.current;
          pendingIndex.current = null;
          if (index !== null) setTimeout(() => scrollToRecipe(index), 50);
        }}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 27, paddingBottom: tabBarHeight + CONTENT_BOTTOM }]}
      />

      {recipes.length > 0 && (
        <View style={[styles.index, { top: insets.top, bottom: tabBarHeight }]} pointerEvents="box-none">
          <AlphabetIndex available={letters} onSelect={jumpToLetter} />
        </View>
      )}

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <RecipeView
          recipe={viewed}
          loading={!viewed && !viewError}
          error={viewError}
          onClose={() => setSheetOpen(false)}
        />
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
    paddingBottom: 14,
  },
  search: {
    paddingTop: 24,
  },
  sectionTitle: {
    paddingTop: 22,
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 29,
  },
  count: {
    paddingTop: 3,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  separator: {
    height: 12,
  },
  footer: {
    paddingVertical: 24,
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
