import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors as theme } from '@/styles/global';

type ColorPickerProps = {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
};

export default function ColorPicker({ colors, value, onChange }: ColorPickerProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {colors.map((color) => {
        // El backend puede devolver el hex en mayúsculas
        const selected = color.toLowerCase() === value.toLowerCase();

        return (
          <Pressable
            key={color}
            onPress={() => onChange(color)}
            accessibilityRole="radio"
            accessibilityLabel={`Elegir color ${color}`}
            accessibilityState={{ selected }}
            style={[styles.swatch, { backgroundColor: color }, selected ? styles.selected : styles.unselected]}
          >
            {selected && (
              <Image source={require('@/assets/images/profile/check.svg')} style={styles.check} contentFit="contain" />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2.4,
    borderColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Anillo exterior: oscuro en el elegido, claro en los demás
  selected: {
    boxShadow: `0px 0px 0px 2px ${theme.text}`,
  },
  unselected: {
    boxShadow: `0px 0px 0px 1px ${theme.border}`,
  },
  check: {
    width: 17,
    height: 17,
  },
});
