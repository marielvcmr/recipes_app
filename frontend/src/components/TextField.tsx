import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, fonts } from '@/styles/global';

type TextFieldProps = TextInputProps & {
  label: string;
};

export default function TextField({ label, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 7,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
  },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.input,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
});
