import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/styles/global';
import type { Option } from '@/utils/recipeOptions';

type SelectProps<T extends string> = {
  options: readonly Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  placeholder?: string;
  // Versión chica para las filas de ingredientes (alto 44, texto 14 regular)
  compact?: boolean;
  error?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

// Dropdown: al tocarlo, las opciones se despliegan debajo, dentro del mismo formulario.
// (No usa un Modal aparte porque el formulario ya vive dentro de uno.)
export default function Select<T extends string>({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar',
  compact = false,
  error = false,
  accessibilityLabel,
  style,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={style}>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: open }}
        style={[styles.box, compact && styles.boxCompact, error && styles.boxError]}
      >
        {/* En la versión chica (columna angosta) el texto pasa a otra línea en vez de cortarse con "…" */}
        <Text
          style={[styles.value, compact && styles.valueCompact, !selected && styles.placeholder]}
          numberOfLines={compact ? undefined : 1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Image source={require('@/assets/images/recipes/chevron-down.svg')} style={styles.chevron} contentFit="contain" />
      </Pressable>

      {open && (
        // Con muchas opciones (ej. unidades) la lista tiene un alto máximo y se desplaza por dentro
        <ScrollView style={styles.list} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [styles.option, compact && styles.optionCompact, pressed && styles.optionPressed]}
              >
                <Text style={[styles.optionText, compact && styles.valueCompact, active && styles.optionActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 47,
    paddingLeft: 17,
    paddingRight: 12,
    backgroundColor: colors.input,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 12,
  },
  boxCompact: {
    minHeight: 44,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
  },
  boxError: {
    borderColor: colors.error,
  },
  value: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  valueCompact: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  placeholder: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
  chevron: {
    width: 10,
    height: 6,
  },
  list: {
    maxHeight: 264,
    marginTop: 4,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 12,
  },
  option: {
    paddingVertical: 11,
    paddingHorizontal: 17,
  },
  optionCompact: {
    paddingHorizontal: 12,
  },
  optionPressed: {
    backgroundColor: colors.segmentBg,
  },
  optionText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  optionActive: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
});
