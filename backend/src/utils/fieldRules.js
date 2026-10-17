// keep the README's regex rules in one place.

export const USERNAME_REGEX = /^[A-Za-z0-9_.]{3,10}$/;
export const PASSWORD_REGEX = /^[A-Za-z0-9_.\-/#$]{6,15}$/;
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

// rules for recipes fields
export const DIFFICULTIES = ['facil', 'media', 'dificil'];
export const UNITS = ['unidades', 'g', 'ml', 'tazas', 'cucharadas'];

// rule for MongoDB ids sent by the client
export const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
