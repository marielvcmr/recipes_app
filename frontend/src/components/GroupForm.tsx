import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { GroupDetail } from '@/api/types';
import Button from '@/components/Button';
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

export default function GroupForm({ group, onSubmit, onClose, loading = false, errors }: GroupFormProps) {
  const editing = !!group;
  const [name, setName] = useState(group?.name ?? '');
  const [recipeIds, setRecipeIds] = useState<string[]>(() => group?.recipes.map((recipe) => recipe.id) ?? []);
  const fields = errors?.fields ?? {};

  const validName = name.trim().length >= NAME_MIN;

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
        onChangeText={setName}
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

      {errors?.message && <Text style={styles.error}>{errors.message}</Text>}

      <Button
        title={editing ? 'Guardar cambios' : 'Crear grupo'}
        onPress={() => onSubmit({ name: name.trim(), recipeIds })}
        loading={loading}
        disabled={!validName}
      />
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
