import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/styles/global';
import type { FormErrors } from '@/utils/errors';

type FormErrorSummaryProps = {
  errors?: FormErrors;
  // Nombre que ve el usuario para cada campo del backend ("ingredients.1.quantity" → "Ingrediente 2")
  labelFor: (field: string) => string;
};

// Aviso junto al botón de guardar: si algo falló, se ve ahí mismo, sin tener que subir por el formulario.
// Cada campo con error también se marca en su lugar.
export default function FormErrorSummary({ errors, labelFor }: FormErrorSummaryProps) {
  const fields = Object.entries(errors?.fields ?? {});
  if (!errors?.message && fields.length === 0) return null;

  return (
    <View style={styles.box} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text style={styles.title}>No se pudo guardar</Text>
      {errors?.message && <Text style={styles.text}>{errors.message}</Text>}
      {fields.length > 0 && <Text style={styles.text}>Revisa los campos marcados en rojo:</Text>}
      {fields.map(([field, message]) => (
        <Text key={field} style={styles.item}>
          • <Text style={styles.field}>{labelFor(field)}:</Text> {message}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1.2,
    borderColor: colors.dangerBorder,
    borderRadius: 12,
  },
  title: {
    color: colors.error,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
  },
  text: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  item: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  field: {
    color: colors.text,
    fontFamily: fonts.bold,
  },
});
