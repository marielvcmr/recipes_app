# CookPlan — Contrato de la API para el frontend

Lo que la app necesita para consumir la API. El detalle de validaciones, endpoints y códigos de error está en [`backend/README.md`](../backend/README.md).

---

## Conexión

- **Base URL:** `http://<host>:3000/api/v1`. Desde un teléfono, `localhost` no funciona: usar la IP local de la computadora que corre el backend (por ejemplo `http://192.168.1.10:3000/api/v1`).
- **Token:** `POST /auth/register` y `POST /auth/login` devuelven `data.token`. Guardarlo (SecureStore) y enviarlo en todas las demás peticiones:
  `Authorization: Bearer <token>`
- **Expiración:** el token dura 7 días. Cualquier `401` → descartar el token y volver al login.
- **Cerrar sesión:** solo en la app, borrando el token. No hay endpoint.
- **Body:** JSON (`Content-Type: application/json`), salvo la foto (ver [Imágenes](#imágenes)).

---

## Formato de respuestas

| Caso | Forma |
| ---- | ----- |
| Un elemento | `{ "data": { "recipe": { ... } } }` (o `user`, `group`) |
| Lista | `{ "data": [ ... ], "meta": { "page": 1, "limit": 20, "total": 42 } }` |
| Borrado | `204` sin cuerpo |
| Error | `{ "error": { "code": "...", "message": "...", "details": [ { "field": "ingredients.1.unit", "message": "..." } ] } }` |

- `message` está en español y se puede mostrar tal cual.
- `details` solo aparece en errores de validación. `field` indica el campo exacto (con índice en listas), útil para marcar el input.
- Códigos de error: [tabla en el README del backend](../backend/README.md#respuestas-y-errores).
- Las fechas (`createdAt`, `updatedAt`) son texto ISO 8601.

---

## Objetos

### User

```json
{ "id": "...", "username": "ana_01", "email": "ana@mail.com", "avatarColor": "#FF8800", "createdAt": "...", "updatedAt": "..." }
```

`GET /users/me` además devuelve `counts: { "recipes": 3, "groups": 2 }`.

### Recipe: detalle (`GET /recipes/:id`)

```json
{
  "id": "...", "name": "Arepas", "description": "...", "timeMinutes": 30,
  "difficulty": "facil", "isPublic": true, "imageUrl": "https://res.cloudinary.com/...",
  "ingredients": [ { "name": "Harina", "quantity": 2, "unit": "tazas" } ],
  "steps": [ { "position": 1, "description": "..." } ],
  "owner": { "id": "...", "username": "ana_01", "avatarColor": "#FF8800" },
  "isMine": true,
  "groupIds": ["..."],
  "createdAt": "...", "updatedAt": "..."
}
```

- `isMine` decide si se muestran los botones de editar y borrar.
- `groupIds` solo viene si `isMine` es `true`.
- En las respuestas de `POST` y `PATCH`, `owner` es solo el id y no viene `isMine`.

### Recipe: tarjeta (listas `GET /recipes/mine` y `GET /recipes`)

Igual que el detalle, **sin** `ingredients`, `steps`, `groupIds` ni `isMine`.

### Group

```json
{ "id": "...", "name": "Desayunos", "recipeCount": 2, "coverUrl": "https://res.cloudinary.com/...", "createdAt": "...", "updatedAt": "..." }
```

`GET /groups/:id` además incluye `recipes`: las tarjetas de sus recetas, en orden alfabético.

---

## Imágenes

- `imageUrl` (receta) y `coverUrl` (grupo) son URLs públicas: se usan directo en `<Image>`. Si son `null`, mostrar la imagen por defecto.
- **Subir o reemplazar:** `PUT /recipes/:id/image` con `multipart/form-data`, campo **`image`**. JPG, PNG o WebP, máx. 5 MB. Comprimir y redimensionar en la app antes de enviar. Responde la receta con el nuevo `imageUrl`.
- **Quitar:** `DELETE /recipes/:id/image` → `204`.
- **Crear una receta con foto:** primero `POST /recipes`, luego `PUT /recipes/:id/image` con el `id` recibido.

---

## Comportamientos a tener en cuenta

- **`PATCH` es parcial:** enviar solo los campos que cambian. Si se envía `ingredients` o `steps`, la lista nueva **reemplaza** a la anterior completa.
- **Pasos:** se envían en orden, solo con `description`. El servidor asigna `position` (1, 2, 3…).
- **`groupIds`** en `POST` y `PATCH /recipes` deja la receta **exactamente** en esos grupos. `[]` la saca de todos; no enviarlo no cambia nada.
- **Borrar un grupo borra sus recetas activas**, aunque estén en otros grupos. Antes de borrar, avisar al usuario usando `recipeCount`.
- **Quitar una receta de un grupo** (`DELETE /groups/:id/recipes/:recipeId`) no borra la receta.
- **Borrar la cuenta** borra todas sus recetas, grupos y fotos.
- **Listas:** orden alfabético. Parámetros: `q` (búsqueda por nombre, ignora mayúsculas y acentos), `page`, `limit` (1–50). En `/recipes/mine`, `visibility=public|private`; en `/recipes`, `excludeMine=true`.
- **Login:** 5 intentos fallidos en 15 minutos → `429`.
