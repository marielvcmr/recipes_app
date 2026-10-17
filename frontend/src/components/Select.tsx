import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, glass, glassInput } from '@/styles/global';
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

// Alto máximo de la lista; con más opciones (ej. unidades) se desplaza por dentro
const LIST_MAX_HEIGHT = 264;
const GAP = 4;
// Margen con los bordes de la pantalla al decidir si la lista cabe hacia abajo
const SCREEN_MARGIN = 24;

// Dónde está el campo en la pantalla, para dibujar la lista pegada a él
type Anchor = { x: number; y: number; width: number; height: number };

// Dropdown: al tocarlo, las opciones flotan sobre el formulario justo debajo del campo
// (o encima, si abajo no caben) sin mover nada de la pantalla. Tocar fuera las cierra.
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
  const { height: screenHeight } = useWindowDimensions();
  const trigger = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const selected = options.find((option) => option.value === value);

  const open = () => {
    trigger.current?.measureInWindow((x, y, width, height) => setAnchor({ x, y, width, height }));
  };
  const close = () => setAnchor(null);

  // Hacia abajo si cabe la lista entera (o si abajo hay más espacio que arriba)
  let listPosition: ViewStyle | undefined;
  if (anchor) {
    const below = screenHeight - (anchor.y + anchor.height) - SCREEN_MARGIN;
    const above = anchor.y - SCREEN_MARGIN;
    const opensDown = below >= Math.min(LIST_MAX_HEIGHT, options.length * 44) || below >= above;
    listPosition = opensDown
      ? { top: anchor.y + anchor.height + GAP, maxHeight: Math.min(LIST_MAX_HEIGHT, below) }
      : { bottom: screenHeight - anchor.y + GAP, maxHeight: Math.min(LIST_MAX_HEIGHT, above) };
    listPosition = { ...listPosition, left: anchor.x, width: anchor.width };
  }

  return (
    <View style={style}>
      <Pressable
        ref={trigger}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: !!anchor }}
        style={[styles.box, compact && styles.boxCompact, error && styles.boxError, !!anchor && styles.boxOpen]}
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

      <Modal visible={!!anchor} transparent animationType="fade" onRequestClose={close} statusBarTranslucent navigationBarTranslucent>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Cerrar opciones" />
        {listPosition && (
          <View style={[styles.list, listPosition]}>
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      close();
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
          </View>
        )}
      </Modal>
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
    ...glassInput,
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
  boxOpen: {
    borderColor: colors.primary,
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
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: glass.menu,
    borderWidth: 1.2,
    borderColor: glass.edge,
    borderRadius: 12,
    boxShadow: '0px 10px 24px rgba(43, 38, 30, 0.16)',
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
