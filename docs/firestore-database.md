# Firestore Database Design — Horarios CCD

## Principios de diseño

- **NoSQL (Firestore)**: datos desnormalizados donde sea necesario para lecturas eficientes.
- **Escalable**: colecciones independientes, sin subcolecciones anidadas profundamente.
- **Sustentable**: estructura que soporta crecimiento (nuevas carreras, edificios, turnos) sin romper queries existentes.
- **Seguridad por reglas**: Firestore Security Rules basadas en `rol` del usuario.

---

## Colecciones

### 1. `carreras`

Documentos de las carreras ofertadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | Siglas: `"DSM"`, `"ITI"`, `"ISA"` |
| `nombre` | `string` | Nombre completo: `"Desarrollo de Software Multiplataforma"` |
| `color` | `string` | Color representativo (hex): `"#01696f"` |
| `activa` | `boolean` | Si la carrera está vigente |
| `createdAt` | `timestamp` | Fecha de creación |

### 2. `turnos`

Turnos disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | `"Matutino"`, `"Vespertino"` |
| `nombre` | `string` | `"Matutino"`, `"Vespertino"` |
| `horaInicio` | `string` | `"07:00"`, `"15:30"` |
| `horaFin` | `string` | `"14:10"`, `"21:20"` |
| `activo` | `boolean` | |

### 3. `bloques`

Bloques horarios por turno.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | Compuesto: `"{turno}_bloque_{n}"` ej. `"Matutino_1"` |
| `turnoId` | `reference` → `turnos` | |
| `numero` | `number` | 1–8 (matutino), 1–7 (vespertino) |
| `inicio` | `string` | `"07:00"` |
| `fin` | `string` | `"07:50"` |
| `duracionMin` | `number` | `50` |

### 4. `edificios`

Edificios/zonas del campus.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | `"edificio_aulas"`, `"edificio_labs"` |
| `nombre` | `string` | `"Edificio de Aulas"` |
| `pisos` | `array<number>` | `[1, 5]` |
| `tieneMezzanine` | `boolean` | |
| `tienePB` | `boolean` | |

### 5. `salones`

Cada salón, aula o laboratorio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | Nombre normalizado: `"Aula 501"` |
| `nombre` | `string` | `"Aula 501"` |
| `edificioId` | `reference` → `edificios` | Opcional |
| `piso` | `string` | `"Planta Baja"`, `"Piso 1"`, `"Piso 5"`, `"Mezzanine"` |
| `tipo` | `string` | `"Aula"`, `"Laboratorio"`, `"Taller"` |
| `capacidad` | `number` | Opcional |
| `tieneProyector` | `boolean` | Si tiene proyector fijo |
| `tienePantalla` | `boolean` | Si tiene pantalla |
| `tienePC` | `boolean` | Si tiene computadora |
| `activo` | `boolean` | |

**Índice compuesto**: `piso ASC, nombre ASC`

### 6. `profesores`

Docentes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | UID de Firebase Auth o email |
| `nombre` | `string` | `"Juan Carlos López Lucio"` |
| `email` | `string` | Opcional |
| `carreras` | `array<reference>` → `carreras` | Carreras que imparte |
| `activo` | `boolean` | |
| `createdAt` | `timestamp` | |

**Índice compuesto**: `nombre ASC`

### 7. `materias`

Materias.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | Generado automáticamente |
| `nombre` | `string` | `"Fundamentos de programación"` |
| `carreraId` | `reference` → `carreras` | Carrera a la que pertenece |
| `semestre` | `number` | 1–12 |
| `horasSemana` | `number` | Opcional |
| `activa` | `boolean` | |

**Índice compuesto**: `carreraId ASC, semestre ASC`

### 8. `grupos`

Grupos por carrera, turno y período.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | Generado automáticamente |
| `carreraId` | `reference` → `carreras` | |
| `turnoId` | `reference` → `turnos` | |
| `nombre` | `string` | `"1A"`, `"2B"`, `"3A"` |
| `semestre` | `number` | `1`, `2`, `3` |
| `ciclo` | `string` | `"2026B"` |
| `label` | `string` | Denormalizado: `"DSM 1A Matutino"` |
| `activo` | `boolean` | |

**Índice compuesto**: `carreraId ASC, turnoId ASC, nombre ASC`

### 9. `horarios` ⭐ — Colección principal

Cada documento = una clase en un día, bloque y salón.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | Generado automáticamente |
| `carreraId` | `reference` → `carreras` | |
| `turnoId` | `reference` → `turnos` | |
| `grupoId` | `reference` → `grupos` | |
| `materiaId` | `reference` → `materias` | |
| `profesorId` | `reference` → `profesores` | |
| `salonId` | `reference` → `salones` | |
| `dia` | `string` | `"Lunes"`–`"Viernes"` |
| `diaVirtual` | `string` | Día de clase virtual (si aplica) |
| `bloqueNumero` | `number` | 1–8 |
| `requiereProyector` | `boolean` | Si necesita proyector portátil |
| `proyectorAsignado` | `string` | Opcional: ID del proyector físico |
| `observaciones` | `string` | Opcional |
| `ciclo` | `string` | `"2026B"` |

**Campos denormalizados** (para queries sin joins):
| `carreraLabel` | `string` | `"DSM"` |
| `turnoLabel` | `string` | `"Matutino"` |
| `grupoLabel` | `string` | `"1A"` |
| `materiaLabel` | `string` | `"Fundamentos de programación"` |
| `profesorLabel` | `string` | `"Marisol Guzmán Padilla"` |
| `salonLabel` | `string` | `"Laboratorio M05"` |
| `pisoLabel` | `string` | `"Mezzanine"` |
| `horaInicio` | `string` | `"07:00"` |
| `horaFin` | `string` | `"07:50"` |
| `timestampInicio` | `number` | Minutos desde medianoche para filtrado numérico |

**Índices compuestos necesarios:**

| Colección | Campos | Razón |
|-----------|--------|-------|
| `horarios` | `dia ASC, timestampInicio ASC` | Clases del día ordenadas |
| `horarios` | `ciclo ASC, carreraId ASC, turnoId ASC, grupoId ASC` | Filtrar por grupo |
| `horarios` | `dia ASC, timestampInicio ASC, requiereProyector == true` | Proyectores del momento |
| `horarios` | `dia ASC, salonId ASC, timestampInicio ASC` | Ocupación de salón |
| `horarios` | `dia ASC, profesorId ASC, timestampInicio ASC` | Horario de profesor |
| `horarios` | `dia ASC, timestampInicio ASC, carreraId ASC` | Filtrar por carrera + día |

### 10. `usuarios`

Perfiles vinculados a Firebase Auth. El documento se crea **automáticamente** al primer inicio de sesión con Google (`src/firebase.js:obtenerCrearPerfilUsuario`).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | UID de Firebase Auth |
| `email` | `string` | Correo institucional |
| `nombre` | `string` | `"Máximo Murillo"` |
| `foto` | `string` | URL de avatar |
| `rol` | `string` | `"estudiante"` \| `"docente"` \| `"admin"` \| `"superadmin"` |
| `dominio` | `string` | `"soy.utj.edu.mx"` \| `"utj.edu.mx"` |
| `activo` | `boolean` | Si `false`, el usuario no puede acceder |
| `ultimoAcceso` | `timestamp` | Se actualiza en cada login |
| `createdAt` | `timestamp` | Fecha de registro |

**Sistema de roles (3 niveles):**

| Rol | Dominio | Acceso |
|-----|---------|--------|
| `estudiante` | `@soy.utj.edu.mx` | Ver horarios, filtrar, vista de tabla y salones |
| `docente` | `@utj.edu.mx` | Todo lo de estudiante + panel de proyectores, vista de proyectores, notificaciones |
| `admin` | `@utj.edu.mx` (asignado manualmente) | Todo lo de docente + administración de usuarios, edición de datos |

**Flujo de creación:**
1. Usuario inicia sesión con Google
2. `onAuthStateChanged` en `App.jsx` detecta el usuario
3. Llama a `obtenerCrearPerfilUsuario()` en `firebase.js`
4. Si no existe documento: lo crea con `rol` basado en el dominio
5. Si existe: actualiza `ultimoAcceso`, `nombre`, `foto`
6. Si `activo === false`: cierra sesión y muestra error

### 11. `proyectores`

Inventario de proyectores portátiles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | `"PROY-001"` |
| `nombre` | `string` | `"Proyector Epson X"` |
| `estado` | `string` | `"disponible"` \| `"prestado"` \| `"mantenimiento"` |
| `ultimoMantenimiento` | `timestamp` | |
| `createdAt` | `timestamp` | |

### 12. `prestamos_proyectores`

Registro de quién y cuándo tomó un proyector.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | Generado |
| `proyectorId` | `reference` → `proyectores` | |
| `horarioId` | `reference` → `horarios` | Clase para la que se prestó |
| `usuarioId` | `reference` → `usuarios` | Quién lo tomó |
| `fechaPrestamo` | `timestamp` | |
| `fechaDevolucion` | `timestamp` | Null si no devuelto |
| `nota` | `string` | Opcional |

---

## Firestore Security Rules

Ver archivo `firestore.rules` en la raíz del proyecto. Resumen de reglas:

- **`usuarios`**: cada usuario lee/escribe su propio perfil; `admin`/`superadmin` pueden leer/escribir cualquiera
- **Colecciones de datos** (`carreras`, `turnos`, `bloques`, `edificios`, `salones`, `profesores`, `materias`, `grupos`, `horarios`):
  - Lectura: cualquier usuario autenticado
  - Escritura: solo `admin`/`superadmin`
- **`proyectores`**: lectura pública autenticada; escritura solo `admin`/`superadmin`
- **`prestamos_proyectores`**: cualquier autenticado puede crear (solo para sí mismo); modificar solo el propio o `admin`

---

## Estrategia de migración desde datos actuales

Usar el script `scripts/seed-firestore.mjs` que:

1. Sube colecciones base: `carreras`, `turnos`, `bloques`, `edificios`, `salones`, `profesores`, `materias`, `grupos`, `usuarios`
2. Sube `horarios` con referencias a los IDs creados + denormalización de labels
3. Crea usuarios base para administradores

### Flujo de usuarios reales

Los usuarios NO se seedean masivamente. Se crean **bajo demanda** al iniciar sesión con Google (Firebase Auth). La app (`src/firebase.js:obtenerCrearPerfilUsuario`) detecta si el documento existe en Firestore y lo crea si es necesario.

### Recomendación

Usar **Firestore emulator** en desarrollo y `node scripts/seed-firestore.mjs` para poblar la base de datos inicial.
