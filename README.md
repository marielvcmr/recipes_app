# CookPlan 🍳

## Descripción

CookPlan es una aplicación móvil para guardar, organizar y descubrir recetas de cocina.

Cada usuario puede:

- Registrarse, iniciar sesión, editar su perfil y borrar su cuenta.
- Crear sus propias recetas con ingredientes, pasos, tiempo de preparación, dificultad y una foto opcional tomada desde el teléfono.
- Ver sus recetas ordenadas alfabéticamente, editarlas y borrarlas.
- Organizar sus recetas en **grupos** (por ejemplo, "Cenas rápidas" o "Favoritas"). Una receta puede estar en varios grupos.
- Marcar cada receta como pública o privada.
- Explorar las recetas públicas de todos los usuarios.

---

## Arquitectura

### Vista general

```mermaid
flowchart LR
    APP["📱 App móvil<br/>React Native"]
    API["⚙️ API REST<br/>Node.js + Express"]
    DB[("🗄️ MongoDB Atlas<br/>users · recipes · groups")]
    IMG[("☁️ Cloudinary<br/>fotos de recetas")]

    APP -- "Peticiones HTTPS + token JWT" --> API
    API -- "Lee y guarda datos" --> DB
    API -- "Sube y borra fotos" --> IMG
    APP -. "Muestra las fotos por URL" .-> IMG
```

- **App móvil** (`frontend/`): React Native. Habla solo con la API; nunca accede directamente a la base de datos.
- **API REST** (`backend/`): Node.js + Express. Autentica con JWT, aplica las reglas de negocio y valida los datos.
- **MongoDB Atlas**: guarda usuarios, recetas y grupos. Los ingredientes y pasos viven dentro de cada receta.
- **Cloudinary**: guarda las fotos de las recetas. La API sube la foto y guarda solo su URL; la app la muestra directamente desde esa URL.

### Capas del backend

```mermaid
flowchart LR
    REQ(["Petición"]) --> R["Routes"] --> MW["Middlewares<br/>auth · upload"] --> C["Controllers"] --> S["Services"] --> M["Models"] --> DB[("MongoDB")]
    S -.-> IMG[("Cloudinary")]
    MW -. error .-> ERR["Error handler"]
    S -. error .-> ERR
    ERR --> RES(["Respuesta de error"])
```

Cada petición pasa por las mismas capas en orden. Si algo falla en cualquier punto, el error va al manejador de errores, que responde siempre con el mismo formato.

| Capa          | Responsabilidad                                              |
| ------------- | ------------------------------------------------------------ |
| `routes`      | Define los endpoints y los asocia a su controlador.          |
| `middlewares` | Autenticación, recepción de imágenes y manejo de errores.    |
| `controllers` | Reciben la petición HTTP y devuelven la respuesta.           |
| `services`    | Contienen la lógica de negocio.                              |
| `models`      | Esquemas de Mongoose: forma de los datos y sus validaciones. |

### Capas del frontend

```mermaid
flowchart LR
    U(["Usuario"]) --> P["Pantallas<br/>app"] --> CMP["Components"]
    P --> CTX["Context<br/>sesión"] --> ST["Storage<br/>token"]
    P --> API["api"] --> CL["client.ts"] -- "HTTP + JWT" --> BE[("API REST")]
    CL -. lee el token .-> ST
    CL -. error .-> ERR["utils/errors"]
    ERR --> MSG(["Mensaje en pantalla"])
```

Las pantallas nunca llaman al backend directamente: piden los datos a `api`, y `client.ts` es el único que hace `fetch`, añade el token y convierte los errores del backend en mensajes para el usuario.

| Capa         | Responsabilidad                                                                  |
| ------------ | -------------------------------------------------------------------------------- |
| `app`        | Pantallas y navegación (Expo Router). Cada archivo es una ruta.                  |
| `components` | Piezas de UI reutilizables. Reciben todo por props; no llaman a la API.          |
| `api`        | Un archivo por recurso del backend. `client.ts` pone la URL base y el token.     |
| `context`    | Estado global de la sesión: usuario, token, login y logout.                      |
| `storage`    | Guarda el token en el teléfono para mantener la sesión abierta.                  |
| `styles`     | Colores, tipografía y estilos compartidos, según el diseño en Figma.             |
| `types`      | Tipos de TypeScript que reflejan las respuestas de la API.                       |
| `utils`      | Funciones de apoyo: mensajes de error y validaciones iguales a las del backend. |

---

## Estructura de carpetas

```
cookplan/
├── README.md
├── .gitignore
├── docs/
│   └── requisitos.md
├── backend/
│   ├── README.md
│   ├── docs/
│   │   └── DESIGN.md
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── pnpm-lock.yaml
└── frontend/
    ├── README.md
    ├── assets/
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   ├── (tabs)/
    │   │   ├── recipes/
    │   │   ├── groups/
    │   │   └── _layout.tsx
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── storage/
    │   ├── styles/
    │   ├── types/
    │   └── utils/
    ├── .env.example
    ├── app.json
    ├── package.json
    └── pnpm-lock.yaml
```

---

## Documentación

| Documento | Contenido |
| --------- | --------- |
| [`docs/requisitos.md`](docs/requisitos.md) | Requisitos funcionales de la aplicación. |
| [`backend/README.md`](backend/README.md) | Stack, reglas de negocio, validaciones, endpoints y cómo ejecutar la API. |
| [`backend/docs/DESIGN.md`](backend/docs/DESIGN.md) | Entidades, relaciones y diseño de la base de datos en MongoDB. |
| [`frontend/README.md`](frontend/README.md) | Stack, estructura, pantallas y cómo ejecutar la app móvil. |

La documentación de la API y del deployment se irá completando en `backend/` a medida que avance el proyecto.
