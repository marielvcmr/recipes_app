import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, glass, glassSurface } from '@/styles/global';

// undefined = Todas (GET /recipes/mine sin filtro de visibilidad)
export type VisibilityFilter = 'public' | 'private' | undefined;

const TABS: { value: VisibilityFilter; label: string }[] = [
  { value: undefined, label: 'Todas' },
  { value: 'public', label: 'Públicas' },
  { value: 'private', label: 'Privadas' },
];

type SegmentedRecipeTabProps = {
  value: VisibilityFilter;
  onChange: (value: VisibilityFilter) => void;
};

export default function SegmentedRecipeTab({ value, onChange }: SegmentedRecipeTabProps) {
  return (
    <View style={styles.container} accessibilityRole="tablist" accessibilityLabel="Filtrar mis recetas por visibilidad">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <Pressable
            key={tab.label}
            onPress={() => onChange(tab.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 7,
    padding: 4,
    ...glassSurface,
    boxShadow: glass.shadowSmall,
    borderRadius: 13,
  },
  tab: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: colors.white,
    boxShadow: '0px 3px 8px rgba(84, 62, 40, 0.1), inset 0px 1px 0px rgba(255, 255, 255, 1)',
  },
  label: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
  },
  labelActive: {
    color: colors.primary,
  },
});
