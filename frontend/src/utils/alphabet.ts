// Letras del índice alfabético (AlphabetIndex): sin tildes, la Ñ va con la N y # para lo que no empieza con letra
export const INDEX_LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'];

// Letra con la que se agrupa una receta: "Ángel" → "A", "Ñoquis" → "N", "7 quesos" → "#" (igual que ordena el backend)
export function initialOf(name: string) {
  const letter = name.trim().charAt(0).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  return /[A-Z]/.test(letter) ? letter : '#';
}
