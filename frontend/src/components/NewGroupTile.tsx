import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, glass, glassCircle } from '@/styles/global';

// Primera tarjeta de la grilla de grupos: abre el formulario "Nuevo grupo"
export default function NewGroupTile({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Nuevo grupo"
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={styles.circle}>
        <Image source={require('@/assets/images/recipes/add.svg')} style={styles.icon} contentFit="contain" />
      </View>
      <Text style={styles.label}>Nuevo grupo</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    height: 178,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: colors.dashed,
    borderRadius: 19,
    backgroundColor: glass.fill,
  },
  pressed: {
    opacity: 0.7,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...glassCircle,
  },
  icon: {
    width: 22,
    height: 22,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 15,
  },
});
