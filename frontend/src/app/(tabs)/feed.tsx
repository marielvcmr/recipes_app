import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/styles/global';

// Placeholder: se reemplaza cuando esté el mockup de Explorar
export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorar</Text>
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
