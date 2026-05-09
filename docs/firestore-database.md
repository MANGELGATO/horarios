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

Perfiles vinculados a Firebase Auth.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (doc id) | UID de Firebase Auth |
| `email` | `string` | |
| `nombre` | `string` | `"Máximo Murillo"` |
| `foto` | `string` | URL de avatar |
| `rol` | `string` | `"estudiante"` \| `"admin"` \| `"superadmin"` |
| `domino` | `string` | `"soy.utj.edu.mx"` \| `"utj.edu.mx"` |
| `activo` | `boolean` | |
| `ultimoAcceso` | `timestamp` | |
| `createdAt` | `timestamp` | |

**Regla de seguridad**: solo el propio usuario o un `superadmin` puede leer/escribir su documento.

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

## Firestore Security Rules (resumen)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuarios: solo lectura/escritura del propio usuario o admin
    match /usuarios/{userId} {
      allow read, write: if request.auth != null
        && (request.auth.uid == userId
          || get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol in ['admin', 'superadmin']);
    }

    // Horarios y colecciones de lectura: cualquier usuario autenticado
    match /{collection}/{doc} {
      allow read: if request.auth != null;
    }

    // Escritura: solo admin/superadmin
    match /{collection}/{doc} {
      allow create, update, delete: if request.auth != null
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol in ['admin', 'superadmin'];
    }

    // Prestamos: cualquier usuario autenticado puede crear (registrar préstamo)
    match /prestamos_proyectores/{doc} {
      allow create: if request.auth != null
        && request.resource.data.usuarioId == request.auth.uid;
      allow read, update, delete: if request.auth != null
        && (request.auth.uid == resource.data.usuarioId
          || get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol in ['admin', 'superadmin']);
    }
  }
}
```

---

## Estrategia de migración desde datos actuales

Los datos actuales están en `src/data/horarios.js`. El script `scripts/cargarHorarios.js` ya existe y puede adaptarse para:

1. Subir primero las colecciones base: `carreras`, `turnos`, `bloques`, `edificios`, `salones`, `profesores`, `materias`, `grupos`
2. Subir `horarios` con referencias a los IDs creados en el paso anterior
3. Crear documento en `usuarios` para cada Firebase Auth UID que haga login (on first sign-in via Cloud Function o desde la app)

### Recomendación

Usar **Firestore emulator** en desarrollo y un script Node.js (el existente `cargarHorarios.js`) que lea `horarios.js` y escriba en Firestore con `batch` writes (máximo 500 docs por batch).
