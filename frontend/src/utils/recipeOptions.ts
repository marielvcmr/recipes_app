// Opciones de los dropdowns del formulario de receta.
// El backend no tiene un endpoint que las devuelva: son constantes en backend/src/utils/fieldRules.js
// (DIFFICULTIES y UNITS). Si allá cambian, hay que cambiarlas aquí también.
// `value` es lo que se manda al backend; `label` es lo que ve el usuario.

export type Option<T extends string = string> = {
  value: T;
  label: string;
};

export const DIFFICULTIES = [
  { value: 'facil', label: 'Fácil' },
  { value: 'media', label: 'Media' },
  { value: 'dificil', label: 'Difícil' },
] as const satisfies readonly Option[];

export const UNITS = [
  { value: 'unidades', label: 'Unidad' },
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
  { value: 'tazas', label: 'Tazas' },
  { value: 'cucharadas', label: 'Cucharadas' },
] as const satisfies readonly Option[];

// En el backend la visibilidad es el booleano isPublic
export const VISIBILITIES = [
  { value: 'private', label: 'Privada' },
  { value: 'public', label: 'Pública' },
] as const satisfies readonly Option[];

export type Difficulty = (typeof DIFFICULTIES)[number]['value'];
export type Unit = (typeof UNITS)[number]['value'];
export type Visibility = (typeof VISIBILITIES)[number]['value'];

export function difficultyLabel(value: string) {
  return DIFFICULTIES.find((option) => option.value === value)?.label ?? value;
}
