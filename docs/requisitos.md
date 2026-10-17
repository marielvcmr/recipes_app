# Requisitos funcionales — CookPlan

## 1. Usuarios (CRUD)

- **RF-01** El usuario puede registrarse con nombre de usuario, correo y clave.
- **RF-02** El usuario puede iniciar sesión con correo y clave.
- **RF-03** El usuario puede ver y editar su perfil.
- **RF-04** El usuario puede borrar su cuenta. Al hacerlo se eliminan también sus recetas y grupos.

## 2. Recetas (CRUD)

- **RF-05** El usuario puede crear múltiples recetas, cada una con nombre, descripción, tiempo de preparación (minutos), dificultad (Fácil, Media, Difícil), ingredientes y pasos.
- **RF-06** Cada ingrediente tiene nombre, cantidad y unidad (Gramos (g), Kilogramos (kg), Mililitros (ml), Litros (l), Libras (lb), Onzas (oz), Onzas líquidas (fl. oz.), Tazas, Cucharadas, Cucharaditas, Unidades / Piezas, Dientes, Hojas, Pizcas, Puñados, Chorritos, Sobres / Paquetes).
- **RF-07** Cada paso tiene una posición y una descripción.
- **RF-08** El usuario puede ver, editar y borrar sus recetas.
- **RF-09** Las recetas se presentan ordenadas alfabéticamente.
- **RF-10** Un usuario no puede tener dos recetas con el mismo nombre.
- **RF-11** Cada receta es pública o privada. Las públicas aparecen en el feed de todos los usuarios; las privadas solo las ve su dueño.
- **RF-12** Cada receta puede tener una foto opcional, cargada desde la galería o la cámara del teléfono. El usuario puede reemplazarla o quitarla. Si no tiene foto, se muestra una imagen por defecto.

## 3. Grupos (CRUD)

- **RF-13** El usuario puede crear grupos para organizar sus recetas.
- **RF-14** El usuario puede ver, editar y borrar sus grupos.
- **RF-15** Una receta puede pertenecer a cualquier cantidad de grupos.
- **RF-16** Quitar una receta de un grupo es un borrado lógico: la asociación se marca como inactiva (no se elimina) y la receta queda fuera del grupo, sin borrarse. Si la receta se vuelve a añadir al grupo, la asociación se reactiva.
- **RF-17** Borrar un grupo borra también las recetas que contiene en ese momento. Antes de borrarlo, la app informa al usuario.
- **RF-18** Borrar una receta la quita de todos los grupos donde estaba.

## 4. Vistas

- **RF-19** Vista de **recetas personales**: todas las recetas del usuario, con filtro Todas / Públicas / Privadas.
- **RF-20** Vista de **recetas en general** (feed): recetas públicas de todos los usuarios, en modo lectura.

## 5. Restricciones generales

- **RF-21** Ningún campo obligatorio puede quedar vacío; cada campo tiene longitud mínima, máxima y formato definidos.
- **RF-22** El detalle de cada restricción está en [`backend/README.md`](../backend/README.md#validaciones).
