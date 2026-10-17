import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/styles/global';

type ProfileBriefProps = {
  recipes: number;
  groups: number;
};

export default function ProfileBrief({ recipes, groups }: ProfileBriefProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.stat, styles.divider]}>
        <Text style={styles.value}>{recipes}</Text>
        <Text style={styles.label}>Recetas</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.value}>{groups}</Text>
        <Text style={styles.label}>Grupos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 20,
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 17,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    borderRightWidth: 1.2,
    borderRightColor: colors.border,
  },
  value: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 22,
  },
  label: {
    marginTop: 2,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
