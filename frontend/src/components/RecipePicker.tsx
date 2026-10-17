import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { listMyRecipes } from '@/api/recipes';
import type { RecipeSummary } from '@/api/types';
import SearchBar from '@/components/SearchBar';
import SelectableRecipeRow from '@/components/SelectableRecipeRow';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { colors, fonts } from '@/styles/global';

type RecipePickerProps = {
  selected: string[];
  onChange: (recipeIds: string[]) => void;
};

// Máximo que acepta el backend por página; para encontrar otras está el buscador
const LIMIT = 50;

// Buscador + lista con casillas de mis recetas. La selección se mantiene aunque cambie la búsqueda
export default function RecipePicker({ selected, onChange }: RecipePickerProps) {
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search);
  // Resultado de la última búsqueda que respondió; mientras no sea la de query, se está cargando
  const [result, setResult] = useState<{ query: string; recipes: RecipeSummary[]; error?: string }>();

  useEffect(() => {
    let current = true;
    listMyRecipes({ q: query || undefined, limit: LIMIT })
      .then((page) => {
        if (current) setResult({ query, recipes: page.data });
      })
      .catch((err) => {
        if (current) setResult({ query, recipes: [], error: err instanceof ApiError ? err.message : 'Error inesperado.' });
      });
    return () => {
      current = false;
    };
  }, [query]);

  const loading = result?.query !== query;
  const recipes = result?.recipes ?? [];
  const error = result?.error;

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((selectedId) => selectedId !== id) : [...selected, id]);
  };

  let content;
  if (loading) {
    content = <ActivityIndicator style={styles.status} color={colors.primary} />;
  } else if (error) {
    content = <Text style={[styles.status, styles.statusText]}>{error}</Text>;
  } else if (recipes.length === 0) {
    content = (
      <Text style={[styles.status, styles.statusText]}>
        {query ? 'Ninguna receta coincide con la búsqueda.' : 'Aún no tienes recetas propias.'}
      </Text>
    );
  } else {
    content = (
      // Scroll propio dentro del de la hoja inferior
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} nestedScrollEnabled>
        {recipes.map((recipe) => (
          <SelectableRecipeRow
            key={recipe.id}
            recipe={recipe}
            checked={selected.includes(recipe.id)}
            onToggle={() => toggle(recipe.id)}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <View>
      <View style={styles.search}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar entre mis recetas" />
      </View>
      <View style={styles.results}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    paddingTop: 9,
  },
  results: {
    paddingTop: 10,
  },
  list: {
    maxHeight: 250,
  },
  listContent: {
    gap: 8,
  },
  status: {
    paddingVertical: 16,
  },
  statusText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
