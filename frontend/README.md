# CookPlan — Frontend

App móvil de CookPlan, hecha con React Native y Expo. Habla solo con la API del [`backend/`](../backend/README.md).
Requisitos funcionales: [`docs/requisitos.md`](../docs/requisitos.md)

---

## Stack

| Capa               | Tecnología                                  |
| ------------------ | ------------------------------------------- |
| Framework          | Expo SDK 57 + React Native 0.86             |
| Lenguaje           | TypeScript                                  |
| Navegación         | Expo Router (rutas por archivos)            |
| Gestor de paquetes | pnpm                                        |
| Sesión             | JWT guardado con `expo-secure-store`        |
| Fotos              | `expo-image-picker` (galería y cámara)      |
| Iconos             | `@expo/vector-icons`                        |

> `expo-secure-store`, `expo-image-picker` y `@expo/vector-icons` se instalan cuando se empiece cada parte.

---

## Cómo ejecutar

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Crear `frontend/.env` a partir de [`.env.example`](.env.example) y poner la IP de la PC donde corre el backend.

3. Arrancar el backend (ver [`backend/README.md`](../backend/README.md)) y luego la app:

   ```bash
   pnpm start
   ```

4. Escanear el QR con **Expo Go** (debe soportar **SDK 57**: Expo Go → Settings → Supported SDKs).

El teléfono y la PC tienen que estar en la misma red WiFi. Si no conecta, usar `pnpm start --tunnel`.

---

## Variables de entorno

| Variable              | Ejemplo                     | Descripción                     |
| --------------------- | --------------------------- | ------------------------------- |
| `EXPO_PUBLIC_API_URL` | `http://192.168.1.50:3000`  | URL base de la API              |

- En el teléfono, `localhost` es el propio teléfono: hay que usar la **IP local de la PC** (`ipconfig`). Es la misma IP que muestra `pnpm start` en `exp://...`.
- Las variables `EXPO_PUBLIC_*` se incluyen en la app y cualquiera puede leerlas: nunca poner secretos ahí.
- Después de cambiar `.env`, reiniciar con `pnpm start -c`.

---

## Estructura de carpetas

```
frontend/
├── README.md
├── app.json                 → configuración de Expo y EAS
├── .env.example
├── assets/                  → íconos, splash e imágenes fijas (ej. foto por defecto de receta)
└── src/
    ├── app/                 → pantallas: cada archivo es una ruta (ver Navegación)
    ├── api/                 → llamadas al backend, un archivo por recurso
    │   ├── client.ts        → URL base, header Authorization y formato { data } / { error }
    │   ├── auth.ts
    │   ├── users.ts
    │   ├── recipes.ts
    │   └── groups.ts
    ├── components/          → piezas reutilizables (RecipeCard, Button, TextField, EmptyState…)
    ├── context/
    │   └── AuthContext.tsx  → usuario y token en memoria; login, register y logout
    ├── storage/
    │   └── token.ts         → guarda y lee el token en el teléfono
    ├── styles/
    │   └── global.ts        → colores, tipografía y estilos compartidos
    ├── types/               → User, Recipe, Ingredient, Step, Group, ApiError
    └── utils/
        ├── errors.ts        → traduce los códigos del backend (EMAIL_TAKEN…) a mensajes
        └── validation.ts    → mismas reglas de validación que el backend
```

| Carpeta      | Responsabilidad |
| ------------ | --------------- |
| `app`        | Pantallas y navegación. Arman la vista con componentes y piden datos a `api`. |
| `api`        | Única capa que hace `fetch` al backend. |
| `components` | UI reutilizable. No llaman a la API: reciben todo por props. |
| `context`    | Estado global de la sesión. |
| `storage`    | Persistencia local en el teléfono. |
| `styles`     | Tema visual (sacado del Figma). |
| `types`      | Tipos de TypeScript que reflejan las respuestas de la API. |
| `utils`      | Funciones puras de apoyo. |

---

## Navegación

```
src/app/
├── _layout.tsx              → Stack raíz; manda a (auth) o a (tabs) según haya sesión
├── (auth)/                  → sin sesión
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/                  → con sesión; barra de pestañas
│   ├── _layout.tsx
│   ├── index.tsx            → Explorar
│   ├── my-recipes.tsx       → Mis recetas
│   ├── groups.tsx           → Mis grupos
│   └── profile.tsx          → Perfil
├── recipes/
│   ├── new.tsx
│   └── [id]/
│       ├── index.tsx        → detalle
│       └── edit.tsx
└── groups/
    ├── new.tsx
    └── [id].tsx             → detalle del grupo
```

Las carpetas entre paréntesis son **grupos de rutas**: ordenan archivos sin cambiar la URL. Las pestañas pueden cambiar según el diseño final en Figma.

| Pantalla        | Ruta                 | Requisitos          | Endpoints |
| --------------- | -------------------- | ------------------- | --------- |
| Login           | `/login`             | RF-02               | `POST /auth/login` |
| Registro        | `/register`          | RF-01               | `POST /auth/register` |
| Explorar        | `/`                  | RF-20               | `GET /recipes?excludeMine=true` |
| Mis recetas     | `/my-recipes`        | RF-09, RF-19        | `GET /recipes/mine?visibility=` |
| Mis grupos      | `/groups`            | RF-13, RF-14        | `GET /groups` |
| Perfil          | `/profile`           | RF-03, RF-04        | `GET`, `PATCH`, `DELETE /users/me` |
| Nueva receta    | `/recipes/new`       | RF-05 a RF-07, RF-10 a RF-12 | `POST /recipes`, luego `PUT /recipes/:id/image` |
| Detalle receta  | `/recipes/:id`       | RF-08, RF-15        | `GET /recipes/:id`, `DELETE /recipes/:id`, `POST /groups/:id/recipes` |
| Editar receta   | `/recipes/:id/edit`  | RF-08, RF-12        | `PATCH /recipes/:id`, `PUT` / `DELETE /recipes/:id/image` |
| Nuevo grupo     | `/groups/new`        | RF-13               | `POST /groups` |
| Detalle grupo   | `/groups/:id`        | RF-14, RF-16, RF-17 | `GET`, `PATCH`, `DELETE /groups/:id`, `DELETE /groups/:id/recipes/:recipeId` |

**Puntos a cuidar**

- La foto se sube **después** de crear la receta, en un segundo paso.
- Si `imageUrl` es `null`, se muestra la imagen por defecto de `assets/`.
- Antes de borrar un grupo, avisar cuántas recetas se borrarán (`recipeCount`).
- Si la API responde `401`, cerrar la sesión y volver al login.

---

## Convenciones

- Importar desde `src/` con el alias `@/` (ej. `import { RecipeCard } from '@/components/RecipeCard'`).
- Instalar paquetes de Expo con `pnpm exec expo install <paquete>`, que elige la versión compatible con el SDK.
- Las pantallas no llaman a `fetch` directamente: siempre pasan por `src/api`.
- La URL del backend nunca va escrita en el código: se lee de `EXPO_PUBLIC_API_URL`.
- Nombres: componentes en `PascalCase.tsx`, rutas en `kebab-case.tsx`, el resto en `camelCase.ts`.
