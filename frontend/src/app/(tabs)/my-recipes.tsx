import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/styles/global';

// Placeholder: se reemplaza cuando esté el mockup de Mis recetas
export default function MyRecipesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis recetas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 30,
  },
});
