import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { RecipeInput } from '@/api/recipes';
import type { Group, Recipe } from '@/api/types';
import Button from '@/components/Button';
import FormErrorSummary from '@/components/FormErrorSummary';
import RecipeImage from '@/components/RecipeImage';
import Select from '@/components/Select';
import TextField from '@/components/TextField';
import { colors, fonts, glass, glassCircle, glassInput } from '@/styles/global';
import type { FormErrors } from '@/utils/errors';
import { pickRecipeImage, type ImageSourceKind } from '@/utils/pickImage';
import {
  DIFFICULTIES,
  UNITS,
  VISIBILITIES,
  type Difficulty,
  type Unit,
  type Visibility,
} from '@/utils/recipeOptions';

// Qué hacer con la foto al guardar
export type PhotoChange = { kind: 'keep' } | { kind: 'new'; uri: string } | { kind: 'remove' };

export type RecipeFormValues = {
  input: RecipeInput;
  photo: PhotoChange;
};

type RecipeFormProps = {
  // Si viene, el formulario es para editar esa receta; si no, para crear una nueva
  recipe?: Recipe;
  // Mis grupos, para el dropdown de "Grupos"
  groups: Group[];
  onSubmit: (values: RecipeFormValues) => void;
  onClose: () => void;
  loading?: boolean;
  errors?: FormErrors;
};

const DESCRIPTION_MAX = 200;
// Título: el mismo máximo que el backend, para que quepa en 2 líneas de la tarjeta sin "…"
const NAME_MAX = 35;
const STEP_MAX = 300;

// Cada fila necesita una key estable para que React no mezcle los inputs al borrar una del medio
let lastKey = 0;
const newKey = () => String(++lastKey);

type IngredientRow = { key: string; name: string; quantity: string; unit: Unit };
type StepRow = { key: string; description: string };
type GroupRow = { key: string; groupId: string | undefined };

const emptyIngredient = (): IngredientRow => ({ key: newKey(), name: '', quantity: '', unit: 'unidades' });
const emptyStep = (): StepRow => ({ key: newKey(), description: '' });

function RemoveRowButton({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={styles.remove}>
      <Image
        source={require('@/assets/images/recipes/close.svg')}
        style={styles.removeIcon}
        tintColor={colors.textSecondary}
        contentFit="contain"
      />
    </Pressable>
  );
}

function AddRowButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}>
      <Image source={require('@/assets/images/recipes/add.svg')} style={styles.addIcon} contentFit="contain" />
      <Text style={styles.addRowText}>{title}</Text>
    </Pressable>
  );
}

// Nombre de cada campo del backend como se ve en el formulario
function fieldLabel(field: string) {
  const [name, index] = field.split('.');
  const row = index !== undefined ? Number(index) + 1 : undefined;
  switch (name) {
    case 'name':
      return 'Título';
    case 'description':
      return 'Descripción';
    case 'timeMinutes':
      return 'Tiempo';
    case 'difficulty':
      return 'Dificultad';
    case 'isPublic':
      return 'Visibilidad';
    case 'ingredients':
      return row ? `Ingrediente ${row}` : 'Ingredientes';
    case 'steps':
      return row ? `Paso ${row}` : 'Pasos';
    case 'groupIds':
      return 'Grupos';
    default:
      return field;
  }
}

export default function RecipeForm({ recipe, groups, onSubmit, onClose, loading = false, errors }: RecipeFormProps) {
  const editing = !!recipe;
  const fields = errors?.fields ?? {};

  const [name, setName] = useState(recipe?.name ?? '');
  const [description, setDescription] = useState(recipe?.description ?? '');
  const [time, setTime] = useState(recipe ? String(recipe.timeMinutes) : '');
  const [difficulty, setDifficulty] = useState<Difficulty>((recipe?.difficulty as Difficulty) ?? 'facil');
  const [visibility, setVisibility] = useState<Visibility>(recipe?.isPublic ? 'public' : 'private');
  const [ingredients, setIngredients] = useState<IngredientRow[]>(() =>
    recipe?.ingredients.length
      ? recipe.ingredients.map((item) => ({
          key: newKey(),
          name: item.name,
          quantity: String(item.quantity),
          unit: item.unit as Unit,
        }))
      : [emptyIngredient()],
  );
  const [steps, setSteps] = useState<StepRow[]>(() =>
    recipe?.steps.length
      ? recipe.steps.map((step) => ({ key: newKey(), description: step.description }))
      : [emptyStep()],
  );
  const [groupRows, setGroupRows] = useState<GroupRow[]>(() =>
    recipe?.groupIds?.length
      ? recipe.groupIds.map((groupId) => ({ key: newKey(), groupId }))
      : [{ key: newKey(), groupId: undefined }],
  );

  // La foto que se ve en el formulario y qué cambió respecto a la guardada
  const [photoUri, setPhotoUri] = useState<string | null>(recipe?.imageUrl ?? null);
  const [photo, setPhoto] = useState<PhotoChange>({ kind: 'keep' });

  const updateIngredient = (key: string, changes: Partial<IngredientRow>) =>
    setIngredients((rows) => rows.map((row) => (row.key === key ? { ...row, ...changes } : row)));
  const updateStep = (key: string, value: string) =>
    setSteps((rows) => rows.map((row) => (row.key === key ? { ...row, description: value } : row)));
  const updateGroup = (key: string, groupId: string) =>
    setGroupRows((rows) => rows.map((row) => (row.key === key ? { ...row, groupId } : row)));

  const choosePhoto = async (kind: ImageSourceKind) => {
    try {
      const uri = await pickRecipeImage(kind);
      if (!uri) return;
      setPhotoUri(uri);
      setPhoto({ kind: 'new', uri });
    } catch (error) {
      Alert.alert('No se pudo cargar la foto', error instanceof Error ? error.message : 'Intenta de nuevo.');
    }
  };

  const askPhotoSource = () => {
    Alert.alert('Foto de la receta', 'Elige de dónde sacar la foto.', [
      { text: 'Galería', onPress: () => choosePhoto('library') },
      { text: 'Cámara', onPress: () => choosePhoto('camera') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const removePhoto = () => {
    setPhotoUri(null);
    // Si la receta tenía foto guardada, hay que borrarla en el backend; si era nueva, basta con olvidarla
    setPhoto(recipe?.imageUrl ? { kind: 'remove' } : { kind: 'keep' });
  };

  const handleSubmit = () => {
    // Las filas de ingredientes y pasos se mandan todas, en orden, para que los errores del backend
    // ("ingredients.1.quantity") coincidan con la fila que se ve. Los grupos vacíos se ignoran.
    const input: RecipeInput = {
      name: name.trim(),
      description: description.trim(),
      timeMinutes: Number(time),
      difficulty,
      isPublic: visibility === 'public',
      ingredients: ingredients.map((row) => ({
        name: row.name.trim(),
        quantity: Number(row.quantity.replace(',', '.')),
        unit: row.unit,
      })),
      steps: steps.map((row) => ({ description: row.description.trim() })),
      groupIds: groupRows.map((row) => row.groupId).filter((id): id is string => !!id),
    };
    onSubmit({ input, photo });
  };

  const groupOptions = groups.map((group) => ({ value: group.id, label: group.name }));
  const usedGroupIds = groupRows.map((row) => row.groupId);

  return (
    <View style={styles.form}>
      <View style={styles.header}>
        <Text style={styles.title}>{editing ? 'Editar receta' : 'Nueva receta'}</Text>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          hitSlop={8}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        >
          <Image source={require('@/assets/images/recipes/close.svg')} style={styles.closeIcon} contentFit="contain" />
        </Pressable>
      </View>

      <TextField
        label="Título"
        labelStyle={styles.label}
        placeholder="Ej. Sopa de tomate"
        value={name}
        onChangeText={setName}
        maxLength={NAME_MAX}
        error={fields.name}
      />

      {/* Foto: no está en el mockup, pero la pide RF-12 (opcional, desde galería o cámara) */}
      <View style={styles.field}>
        <Text style={styles.label}>
          Foto <Text style={styles.optional}>Opcional</Text>
        </Text>
        {photoUri ? (
          <View>
            <View style={styles.photoPreview}>
              <RecipeImage uri={photoUri} />
            </View>
            <View style={styles.photoActions}>
              <Pressable onPress={askPhotoSource} accessibilityRole="button" style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]}>
                <Text style={styles.photoActionText}>Cambiar foto</Text>
              </Pressable>
              <Pressable onPress={removePhoto} accessibilityRole="button" style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]}>
                <Text style={[styles.photoActionText, styles.photoRemoveText]}>Quitar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={askPhotoSource}
            accessibilityRole="button"
            accessibilityLabel="Añadir foto"
            style={({ pressed }) => [styles.photoEmpty, pressed && styles.pressed]}
          >
            <Image source={require('@/assets/images/recipes/add.svg')} style={styles.addIcon} contentFit="contain" />
            <Text style={styles.addRowText}>Añadir foto</Text>
            <Text style={styles.small}>Galería o cámara · JPG, PNG o WebP</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Descripción</Text>
        <Text style={styles.small}>
          {description.length}/{DESCRIPTION_MAX}
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Cuéntanos brevemente sobre esta receta"
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={DESCRIPTION_MAX}
          textAlignVertical="top"
          style={[styles.textArea, styles.descriptionArea, fields.description && styles.inputError]}
        />
        {fields.description && <Text style={styles.fieldError}>{fields.description}</Text>}
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <TextField
            label="Tiempo (min)"
            labelStyle={styles.label}
            placeholder="25"
            value={time}
            onChangeText={(text) => setTime(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={4}
            error={fields.timeMinutes}
          />
        </View>
        <View style={[styles.half, styles.field]}>
          <Text style={styles.label}>Dificultad</Text>
          <Select
            options={DIFFICULTIES}
            value={difficulty}
            onChange={setDifficulty}
            accessibilityLabel="Dificultad"
            error={!!fields.difficulty}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Visibilidad</Text>
        <Select options={VISIBILITIES} value={visibility} onChange={setVisibility} accessibilityLabel="Visibilidad" />
      </View>

      {/* Ingredientes */}
      <View>
        <Text style={styles.label}>Ingredientes</Text>
        <View style={styles.ingredientHeader}>
          <Text style={[styles.columnLabel, styles.nameColumn]}>Nombre</Text>
          <Text style={[styles.columnLabel, styles.quantityColumn]}>Cantidad</Text>
          <Text style={[styles.columnLabel, styles.unitColumn]}>Unidad</Text>
        </View>
        <View style={styles.rows}>
          {ingredients.map((row, index) => {
            const rowError =
              fields[`ingredients.${index}.name`] ??
              fields[`ingredients.${index}.quantity`] ??
              fields[`ingredients.${index}.unit`];
            return (
              <View key={row.key}>
                <View style={styles.ingredientRow}>
                  <View style={styles.bullet} />
                  <TextInput
                    value={row.name}
                    onChangeText={(text) => updateIngredient(row.key, { name: text })}
                    placeholder="Tomate"
                    placeholderTextColor={colors.textSecondary}
                    maxLength={20}
                    accessibilityLabel={`Nombre del ingrediente ${index + 1}`}
                    style={[styles.smallInput, styles.nameColumn, fields[`ingredients.${index}.name`] && styles.inputError]}
                  />
                  <TextInput
                    value={row.quantity}
                    onChangeText={(text) => updateIngredient(row.key, { quantity: text.replace(/[^0-9.,]/g, '') })}
                    placeholder="2"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                    maxLength={6}
                    accessibilityLabel={`Cantidad del ingrediente ${index + 1}`}
                    style={[
                      styles.smallInput,
                      styles.quantityColumn,
                      fields[`ingredients.${index}.quantity`] && styles.inputError,
                    ]}
                  />
                  <Select
                    compact
                    options={UNITS}
                    value={row.unit}
                    onChange={(unit) => updateIngredient(row.key, { unit })}
                    accessibilityLabel={`Unidad del ingrediente ${index + 1}`}
                    style={styles.unitColumn}
                  />
                  {ingredients.length > 1 ? (
                    <RemoveRowButton
                      label={`Quitar ingrediente ${index + 1}`}
                      onPress={() => setIngredients((rows) => rows.filter((item) => item.key !== row.key))}
                    />
                  ) : (
                    <View style={styles.remove} />
                  )}
                </View>
                {rowError && <Text style={[styles.fieldError, styles.rowError]}>{rowError}</Text>}
              </View>
            );
          })}
        </View>
        {fields.ingredients && <Text style={styles.fieldError}>{fields.ingredients}</Text>}
        <AddRowButton title="Añadir ingrediente" onPress={() => setIngredients((rows) => [...rows, emptyIngredient()])} />
      </View>

      {/* Pasos */}
      <View>
        <Text style={styles.label}>Pasos</Text>
        <View style={[styles.rows, styles.rowsTop]}>
          {steps.map((row, index) => {
            const stepError = fields[`steps.${index}.description`];
            return (
              <View key={row.key} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepBody}>
                  <TextInput
                    value={row.description}
                    onChangeText={(text) => updateStep(row.key, text)}
                    placeholder={`Paso ${index + 1}`}
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    maxLength={STEP_MAX}
                    textAlignVertical="top"
                    accessibilityLabel={`Paso ${index + 1}`}
                    style={[styles.textArea, styles.stepArea, stepError && styles.inputError]}
                  />
                  <Text style={[styles.small, styles.counterRight]}>
                    {row.description.length}/{STEP_MAX}
                  </Text>
                  {stepError && <Text style={styles.fieldError}>{stepError}</Text>}
                </View>
                {steps.length > 1 ? (
                  <RemoveRowButton
                    label={`Quitar paso ${index + 1}`}
                    onPress={() => setSteps((rows) => rows.filter((item) => item.key !== row.key))}
                  />
                ) : (
                  <View style={styles.remove} />
                )}
              </View>
            );
          })}
        </View>
        {fields.steps && <Text style={styles.fieldError}>{fields.steps}</Text>}
        <AddRowButton title="Añadir paso" onPress={() => setSteps((rows) => [...rows, emptyStep()])} />
      </View>

      {/* Grupos (opcional) */}
      <View>
        <Text style={styles.label}>
          Grupos <Text style={styles.optional}>Opcional</Text>
        </Text>
        {groups.length === 0 ? (
          <Text style={[styles.small, styles.rowsTop]}>Aún no tienes grupos. Créalos en la pestaña Grupos.</Text>
        ) : (
          <>
            <View style={[styles.rows, styles.rowsTop]}>
              {groupRows.map((row, index) => (
                <View key={row.key} style={styles.groupRow}>
                  <View style={[styles.bullet, styles.groupBullet]} />
                  <Select
                    // No se puede elegir dos veces el mismo grupo
                    options={groupOptions.filter(
                      (option) => option.value === row.groupId || !usedGroupIds.includes(option.value),
                    )}
                    value={row.groupId}
                    onChange={(groupId) => updateGroup(row.key, groupId)}
                    placeholder="Seleccionar grupo"
                    accessibilityLabel={`Grupo ${index + 1}`}
                    style={styles.flex}
                  />
                  <RemoveRowButton
                    label={`Quitar grupo ${index + 1}`}
                    onPress={() => setGroupRows((rows) => rows.filter((item) => item.key !== row.key))}
                  />
                </View>
              ))}
            </View>
            {fields.groupIds && <Text style={styles.fieldError}>{fields.groupIds}</Text>}
            {groupRows.length < groups.length && (
              <AddRowButton
                title="Añadir grupo"
                onPress={() => setGroupRows((rows) => [...rows, { key: newKey(), groupId: undefined }])}
              />
            )}
          </>
        )}
      </View>

      <FormErrorSummary errors={errors} labelFor={fieldLabel} />

      <Button title={editing ? 'Guardar cambios' : 'Crear receta'} onPress={handleSubmit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
    paddingTop: 25,
    paddingBottom: 35,
    paddingHorizontal: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 34.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...glassCircle,
  },
  closeIcon: {
    width: 22,
    height: 22,
  },
  pressed: {
    opacity: 0.7,
  },
  field: {
    gap: 7,
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
  small: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  textArea: {
    paddingHorizontal: 13,
    paddingVertical: 12,
    ...glassInput,
    borderRadius: 12,
    color: colors.text,
    fontSize: 16,
    lineHeight: 23.2,
  },
  descriptionArea: {
    minHeight: 82,
    fontFamily: fonts.bold,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    marginTop: 4,
    color: colors.error,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  // Foto
  photoPreview: {
    height: 170,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: colors.border,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 9,
  },
  photoAction: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...glassInput,
    borderRadius: 12,
  },
  photoActionText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  photoRemoveText: {
    color: colors.danger,
  },
  photoEmpty: {
    minHeight: 104,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: glass.fill,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 12,
  },
  // Filas de ingredientes, pasos y grupos
  rows: {
    gap: 9,
  },
  rowsTop: {
    marginTop: 9,
  },
  ingredientHeader: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 9,
    marginBottom: 10,
    paddingLeft: 16,
    paddingRight: 34,
  },
  columnLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 18,
  },
  nameColumn: {
    flex: 1,
  },
  quantityColumn: {
    flex: 0.6,
  },
  unitColumn: {
    flex: 1.35,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bullet: {
    width: 7,
    height: 7,
    marginTop: 19,
    marginRight: 3,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  groupBullet: {
    marginTop: 20,
  },
  smallInput: {
    height: 45,
    paddingHorizontal: 9,
    ...glassInput,
    borderRadius: 12,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  rowError: {
    paddingLeft: 16,
  },
  remove: {
    width: 28,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: 16,
    height: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stepNumber: {
    width: 27,
    height: 27,
    marginTop: 10,
    borderRadius: 13.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.badge,
  },
  stepNumberText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: 19.5,
  },
  stepBody: {
    flex: 1,
    gap: 4,
  },
  stepArea: {
    minHeight: 72,
    fontFamily: fonts.regular,
  },
  counterRight: {
    alignSelf: 'flex-end',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 9,
    paddingVertical: 3,
  },
  addIcon: {
    width: 17,
    height: 17,
  },
  addRowText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
  },
});
