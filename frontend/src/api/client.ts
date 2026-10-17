import Constants from 'expo-constants';

import type { ApiErrorBody, ApiErrorDetail, ApiPage, ApiSuccess } from '@/api/types';

// Puerto y prefijo del backend: PORT en backend/.env y app.use('/api/v1', ...) en backend/src/app.js
const API_PORT = 3000;
const API_PREFIX = '/api/v1';

function resolveApiUrl() {
  // 1. Si está definida en frontend/.env, manda (backend desplegado o forzar una IP)
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  // 2. En desarrollo: el teléfono bajó el código de Metro desde "<IP de la PC>:8081",
  //    y el backend corre en esa misma PC → http://<IP de la PC>:3000/api/v1
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:${API_PORT}${API_PREFIX}` : undefined;
}

const API_URL = resolveApiUrl();

// Si el servidor no responde en este tiempo, se corta la petición
const TIMEOUT_MS = 10_000;
// Subir una foto tarda más: el backend además la reenvía a Cloudinary
const UPLOAD_TIMEOUT_MS = 30_000;

// Error con el mismo formato que devuelve el backend: { error: { code, message, details } }
export class ApiError extends Error {
  status: number;
  code: string;
  details: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// El token lo pone AuthContext al iniciar sesión, y se manda en todas las peticiones
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// AuthContext registra aquí qué hacer si el token deja de valer (vencido o cuenta borrada): cerrar sesión
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
};

// Hace la petición y devuelve el cuerpo completo: { data } o, en listas, { data, meta }
async function request<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<ApiSuccess<T>> {
  if (!API_URL) {
    throw new ApiError(0, 'CONFIG_ERROR', 'No se encontró la URL del backend (EXPO_PUBLIC_API_URL).');
  }

  // FormData (subir una foto) va tal cual: fetch pone solo el Content-Type multipart con su boundary
  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), isFormData ? UPLOAD_TIMEOUT_MS : TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    // No hubo respuesta: IP o puerto equivocados, backend apagado, otra red WiFi o firewall
    throw new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor.');
  } finally {
    clearTimeout(timeout);
  }

  // 204 No Content (ej. DELETE /users/me) no trae cuerpo
  if (response.status === 204) {
    return { data: undefined as T };
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const error = (json as ApiErrorBody | null)?.error;

    // Solo UNAUTHORIZED con token: una clave mala en el login es INVALID_CREDENTIALS y no cierra nada
    if (response.status === 401 && error?.code === 'UNAUTHORIZED' && authToken) {
      onUnauthorized?.();
    }

    throw new ApiError(
      response.status,
      error?.code ?? 'INTERNAL_ERROR',
      error?.message ?? 'Error inesperado.',
      error?.details,
    );
  }

  return json as ApiSuccess<T>;
}

export async function apiFetch<T>(path: string, options?: RequestOptions): Promise<T> {
  return (await request<T>(path, options)).data;
}

// Para listas paginadas (GET /groups, /recipes...): conserva meta con page, limit y total
export async function apiFetchPage<T>(path: string, options?: RequestOptions): Promise<ApiPage<T>> {
  return (await request<T[]>(path, options)) as ApiPage<T>;
}
