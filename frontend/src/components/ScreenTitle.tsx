import { StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/styles/global';

type ScreenTitleProps = {
  lead: string;
  // Palabra final en cursiva y color primario ("Mis *recetas*", "Tus *grupos*")
  accent: string;
};

export default function ScreenTitle({ lead, accent }: ScreenTitleProps) {
  return (
    <Text style={styles.title} accessibilityRole="header">
      {lead} <Text style={styles.accent}>{accent}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 34,
    lineHeight: 36.72,
    letterSpacing: -0.68,
  },
  accent: {
    color: colors.primary,
    fontFamily: fonts.headingItalic,
  },
});
