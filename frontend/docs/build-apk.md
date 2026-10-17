# Generar el APK de CookPlan

Pendiente para el final del desarrollo. Resume qué cambia entre probar con Expo Go y entregar un APK.

---

## Por qué la URL del backend funciona distinto en el APK

En desarrollo, [`src/api/client.ts`](../src/api/client.ts) arma la URL sola con la IP de la PC que corre Metro (`Constants.expoConfig.hostUri` → `http://<IP>:3000/api/v1`). En el APK eso no sirve:

| | Expo Go (desarrollo) | APK |
| --- | --- | --- |
| Código de la app | Se descarga de Metro en la PC (`exp://<IP>:8081`) | Viene dentro del APK |
| `hostUri` | IP de la PC | No apunta a ninguna PC (no hay Metro) |
| Backend | Corriendo en la PC, misma WiFi | Tiene que estar **desplegado en internet** |

Sin `hostUri`, `resolveApiUrl()` usa **`EXPO_PUBLIC_API_URL`**. Si no está definida, la app muestra "No se encontró la URL del backend".

| Situación | De dónde sale la URL |
| --- | --- |
| Desarrollo en Expo Go | Automática (IP de la PC) |
| `pnpm start --tunnel` | `frontend/.env` |
| APK | `eas.json` o variables de EAS → backend desplegado |

---

## Pasos

### 1. Desplegar el backend con HTTPS

En Render, Railway u otro hosting. La URL queda, por ejemplo, `https://cookplan-api.onrender.com/api/v1`.

- Tiene que ser **https**: Android bloquea `http://` en los APK. En Expo Go funciona solo porque es una app de desarrollo.
- MongoDB Atlas ya tiene `0.0.0.0/0` en Network Access, que es lo que necesita un hosting sin IP fija.
- Cargar en el hosting las mismas variables de `backend/.env` (ver [`backend/README.md`](../../backend/README.md#variables-de-entorno)).

### 2. Darle la URL al build de EAS

`frontend/.env` **no se sube** a los servidores de EAS (está en `.gitignore`). La URL va en `eas.json`:

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "env": { "EXPO_PUBLIC_API_URL": "https://cookplan-api.onrender.com/api/v1" }
    }
  }
}
```

O como variable de entorno del proyecto en expo.dev → Environment variables.

### 3. Generar el APK

Desde `frontend/`:

```bash
eas build -p android --profile preview
```

Al terminar, EAS da un enlace para descargar el APK.

### 4. Probar

Instalar el APK en un teléfono **sin** el backend local corriendo y con datos móviles (fuera del WiFi de la PC): registro, login y cerrar sesión deben funcionar contra el backend desplegado.
