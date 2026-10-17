import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, primaryGradient } from '@/styles/global';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function Button({ title, onPress, loading = false, disabled = false }: ButtonProps) {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, (pressed || inactive) && styles.dimmed]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: colors.primary,
    experimental_backgroundImage: primaryGradient,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    boxShadow: '0px 8px 16px rgba(173, 72, 52, 0.22), inset 0px 1px 0px rgba(255, 255, 255, 0.35)',
  },
  dimmed: {
    opacity: 0.7,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
  },
});
