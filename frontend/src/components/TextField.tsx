import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { colors, fonts } from '@/styles/global';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  labelStyle?: StyleProp<TextStyle>;
};

export default function TextField({ label, error, labelStyle, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, error && styles.inputError, style]}
        {...inputProps}
      />
      {error && <Text style={styles.error}>{error}</Text>}
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
  inputError: {
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
});
