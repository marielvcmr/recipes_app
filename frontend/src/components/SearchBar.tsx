import { Image } from 'expo-image';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts } from '@/styles/global';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder = 'Buscar recetas' }: SearchBarProps) {
  return (
    <View style={styles.box}>
      <Image source={require('@/assets/images/recipes/search.svg')} style={styles.icon} contentFit="contain" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
        maxLength={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 15,
    boxShadow: '0px 4px 9px rgba(43, 38, 30, 0.04)',
  },
  icon: {
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
});
