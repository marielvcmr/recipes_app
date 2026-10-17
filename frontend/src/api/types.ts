// Formato de las respuestas del backend (ver backend/README.md → Respuestas y errores)

export type ApiSuccess<T> = {
  data: T;
};

// Las listas paginadas traen además meta
export type PageMeta = {
  page: number;
  limit: number;
  total: number;
};

export type ApiPage<T> = {
  data: T[];
  meta: PageMeta;
};

export type ApiErrorDetail = {
  field: string;
  message: string;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
};

// Forma del usuario tal como lo devuelve la API (nunca incluye la clave)
export type User = {
  id: string;
  username: string;
  email: string;
  avatarColor?: string;
  createdAt: string;
  updatedAt: string;
};

// Grupo del usuario tal como lo devuelve GET /groups
export type Group = {
  id: string;
  name: string;
  recipeCount: number;
  createdAt: string;
  updatedAt: string;
};
