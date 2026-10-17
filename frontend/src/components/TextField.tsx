import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Pressable,
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
  // Campo de clave con ojito para mostrar u ocultar lo escrito (empieza oculto)
  revealable?: boolean;
};

export default function TextField({
  label,
  error,
  labelStyle,
  revealable = false,
  style,
  secureTextEntry,
  ...inputProps
}: TextFieldProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.field}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View>
        <TextInput
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, revealable && styles.inputWithToggle, error && styles.inputError, style]}
          secureTextEntry={revealable ? hidden : secureTextEntry}
          {...inputProps}
        />
        {revealable && (
          <Pressable
            onPress={() => setHidden((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar clave' : 'Ocultar clave'}
            hitSlop={6}
            style={styles.toggle}
          >
            <Image
              source={
                hidden
                  ? require('@/assets/images/profile/eye.svg')
                  : require('@/assets/images/profile/eye-off.svg')
              }
              style={styles.toggleIcon}
              tintColor={colors.textSecondary}
              contentFit="contain"
            />
          </Pressable>
        )}
      </View>
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
  // Deja espacio a la derecha para que el texto no quede debajo del ojito
  inputWithToggle: {
    paddingRight: 50,
  },
  inputError: {
    borderColor: colors.error,
  },
  toggle: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIcon: {
    width: 22,
    height: 22,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
});
