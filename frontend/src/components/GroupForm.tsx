import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { GroupDetail } from '@/api/types';
import Button from '@/components/Button';
import FormErrorSummary from '@/components/FormErrorSummary';
import IconButton from '@/components/IconButton';
import RecipePicker from '@/components/RecipePicker';
import TextField from '@/components/TextField';
import { colors, fonts } from '@/styles/global';
import type { FormErrors } from '@/utils/errors';

export type GroupFormValues = {
  name: string;
  recipeIds: string[];
};

type GroupFormProps = {
  // Si viene, el formulario edita ese grupo (nombre y recetas marcadas)
  group?: GroupDetail;
  onSubmit: (values: GroupFormValues) => void;
  onClose: () => void;
  loading?: boolean;
  errors?: FormErrors;
};

// Mismos límites que el backend
const NAME_MIN = 2;
const NAME_MAX = 20;

// Nombre de cada campo del backend como se ve en el formulario
function fieldLabel(field: string) {
  if (field === 'name') return 'Nombre';
  if (field.startsWith('recipeIds')) return 'Recetas';
  return field;
}

export default function GroupForm({ group, onSubmit, onClose, loading = false, errors }: GroupFormProps) {
  const editing = !!group;
  const [name, setName] = useState(group?.name ?? '');
  const [recipeIds, setRecipeIds] = useState<string[]>(() => group?.recipes.map((recipe) => recipe.id) ?? []);
  // Error que se detecta aquí mismo (nombre muy corto), antes de llamar al backend
  const [localErrors, setLocalErrors] = useState<FormErrors>();
  const shown = localErrors ?? errors;
  const fields = shown?.fields ?? {};

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length < NAME_MIN) {
      setLocalErrors({ fields: { name: `El nombre del grupo debe tener entre ${NAME_MIN} y ${NAME_MAX} caracteres.` } });
      return;
    }
    setLocalErrors(undefined);
    onSubmit({ name: trimmed, recipeIds });
  };

  return (
    <View style={styles.form}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ORGANIZA TUS RECETAS</Text>
          <Text style={styles.title}>{editing ? 'Editar grupo' : 'Nuevo grupo'}</Text>
        </View>
        <IconButton
          icon={require('@/assets/images/recipes/close.svg')}
          onPress={onClose}
          accessibilityLabel="Cerrar"
          disabled={loading}
        />
      </View>

      <TextField
        label="Nombre"
        labelStyle={styles.label}
        placeholder="Ej. Domingos en familia"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setLocalErrors(undefined);
        }}
        maxLength={NAME_MAX}
        error={fields.name}
      />

      <View>
        <Text style={styles.label}>
          Recetas propias <Text style={styles.optional}>Opcional</Text>
        </Text>
        <RecipePicker selected={recipeIds} onChange={setRecipeIds} />
        {fields.recipeIds && <Text style={styles.error}>{fields.recipeIds}</Text>}
      </View>

      <FormErrorSummary errors={shown} labelFor={fieldLabel} />

      <Button title={editing ? 'Guardar cambios' : 'Crear grupo'} onPress={handleSubmit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
    paddingTop: 25,
    paddingBottom: 40,
    paddingHorizontal: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 16.5,
    letterSpacing: 1.54,
  },
  title: {
    paddingTop: 7,
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 27,
    lineHeight: 31.05,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 22.5,
  },
  optional: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  error: {
    paddingTop: 6,
    color: colors.error,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
});
