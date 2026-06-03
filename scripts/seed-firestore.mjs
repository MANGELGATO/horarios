import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";
import { horarios, getPiso, aMinutos, BLOQUES, BLOQUES_VESPERTINO } from "../src/data/horarios.js";

const CICLO = "2026B";

const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json";

if (!getApps().length) {
  if (existsSync(KEY_PATH)) {
    const serviceAccount = JSON.parse(readFileSync(KEY_PATH, "utf-8"));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    console.error(
      "\n❌ No se encontró archivo de service account.\n" +
      "  Para seedear la base de datos necesitas una clave de servicio:\n\n" +
      "  1. Ve a https://console.firebase.google.com/project/horarios-ccd/settings/serviceaccounts/adminsdk\n" +
      "  2. Genera una nueva clave privada\n" +
      "  3. Guarda el JSON como serviceAccountKey.json en la raíz del proyecto\n" +
      "  4. Vuelve a ejecutar: npm run seed\n"
    );
    process.exit(1);
  }
}

const db = getFirestore();

function ref(path) {
  return db.doc(path);
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['´`]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

async function runBatch(entries) {
  for (let i = 0; i < entries.length; i += 499) {
    const batch = db.batch();
    const chunk = entries.slice(i, i + 499);
    chunk.forEach(([refPath, data]) => batch.set(ref(refPath), data));
    await batch.commit();
    process.stdout.write(`  → ${Math.min(i + 499, entries.length)}/${entries.length}\r`);
  }
  console.log(`  ✓ ${entries.length} documentos`);
}

async function seed() {
  console.log("\n🚀 Iniciando seed completo de Firestore — Horarios CCD\n");

  /* ─── 1. CARRERAS ─── */
  console.log("1/10 Carreras...");
  const carrerasList = [...new Set(horarios.map(h => h.carrera))].sort();
  const COLORES = { DSM: "#01696f", EVND: "#7b2d8b", IDGS: "#c0392b", IEVND: "#2c3e50" };
  const NOMBRES = {
    DSM: "Desarrollo de Software Multiplataforma",
    EVND: "Entornos Virtuales y Negocios Digitales",
    IDGS: "Ingeniería en Desarrollo y Gestión de Software",
    IEVND: "Ingeniería en Entornos Virtuales y Negocios Digitales",
  };
  await runBatch(
    carrerasList.map(siglas => [
      `carreras/${siglas}`,
      {
        nombre: NOMBRES[siglas] || siglas,
        siglas,
        color: COLORES[siglas] || "#666",
        activa: true,
        createdAt: new Date(),
      },
    ])
  );

  /* ─── 2. TURNOS ─── */
  console.log("2/10 Turnos...");
  const turnosList = [...new Set(horarios.map(h => h.turno))].sort();
  const TURNOS_INFO = {
    Matutino: { horaInicio: "07:00", horaFin: "14:10", bloques: 8 },
    Vespertino: { horaInicio: "15:30", horaFin: "21:20", bloques: 7 },
  };
  await runBatch(
    turnosList.map(nombre => [
      `turnos/${nombre}`,
      {
        nombre,
        horaInicio: TURNOS_INFO[nombre].horaInicio,
        horaFin: TURNOS_INFO[nombre].horaFin,
        cantidadBloques: TURNOS_INFO[nombre].bloques,
        activo: true,
      },
    ])
  );

  /* ─── 3. BLOQUES ─── */
  console.log("3/10 Bloques...");
  const bloquesEntries = [];
  for (const turno of turnosList) {
    const bloques = turno === "Vespertino" ? BLOQUES_VESPERTINO : BLOQUES;
    for (const b of bloques) {
      bloquesEntries.push([
        `bloques/${turno}_bloque_${b.id}`,
        {
          turnoId: ref(`turnos/${turno}`),
          turnoLabel: turno,
          numero: b.id,
          inicio: b.inicio,
          fin: b.fin,
          duracionMin: 50,
          timestampInicio: aMinutos(b.inicio),
          timestampFin: aMinutos(b.fin),
        },
      ]);
    }
  }
  await runBatch(bloquesEntries);

  /* ─── 4. EDIFICIOS ─── */
  console.log("4/10 Edificios...");
  await runBatch([
    ["edificios/edificio_aulas", { nombre: "Edificio de Aulas", pisos: [1, 5], tieneMezzanine: false, tienePB: false }],
    ["edificios/edificio_mezzanine", { nombre: "Mezzanine", pisos: [0], tieneMezzanine: true, tienePB: false }],
    ["edificios/edificio_planta_baja", { nombre: "Planta Baja", pisos: [0], tieneMezzanine: false, tienePB: true }],
  ]);

  /* ─── 5. SALONES ─── */
  console.log("5/10 Salones...");
  const salonesList = [...new Set(horarios.map(h => h.salon))].sort();
  await runBatch(
    salonesList.map(nombre => {
      const tipo = nombre.startsWith("Aula") ? "Aula"
        : nombre.startsWith("Laboratorio") ? "Laboratorio"
        : nombre.startsWith("Taller") ? "Taller" : "Otro";
      const piso = getPiso(nombre);
      const edificioId = piso === "Mezzanine" ? "edificio_mezzanine"
        : piso === "Planta Baja" ? "edificio_planta_baja"
        : "edificio_aulas";
      return [
        `salones/${nombre}`,
        {
          nombre,
          piso,
          tipo,
          edificioId: ref(`edificios/${edificioId}`),
          edificioLabel: edificioId.replace("edificio_", "").replace(/_/g, " "),
          activo: true,
        },
      ];
    })
  );

  /* ─── 6. PROFESORES ─── */
  console.log("6/10 Profesores...");
  const profesoresSet = [...new Set(horarios.map(h => h.profesor))].sort();
  const profesoresCarreras = {};
  for (const h of horarios) {
    if (!profesoresCarreras[h.profesor]) profesoresCarreras[h.profesor] = new Set();
    profesoresCarreras[h.profesor].add(h.carrera);
  }
  await runBatch(
    profesoresSet.map(nombre => [
      `profesores/${slugify(nombre)}`,
      {
        nombre,
        email: `${slugify(nombre).replace(/_/g, ".")}@utj.edu.mx`,
        carreras: [...profesoresCarreras[nombre]].map(c => ref(`carreras/${c}`)),
        carrerasLabel: [...profesoresCarreras[nombre]],
        activo: true,
        createdAt: new Date(),
      },
    ])
  );

  /* ─── 7. MATERIAS ─── */
  console.log("7/10 Materias...");
  const materiaKeys = [...new Set(horarios.map(h => `${h.carrera}|${h.materia}`))].sort();
  await runBatch(
    materiaKeys.map(key => {
      const [carrera, nombre] = key.split("|");
      return [
        `materias/${carrera}_${slugify(nombre)}`,
        {
          nombre,
          carreraId: ref(`carreras/${carrera}`),
          carreraLabel: carrera,
          activa: true,
        },
      ];
    })
  );

  /* ─── 8. GRUPOS ─── */
  console.log("8/10 Grupos...");
  const grupoKeys = [...new Set(horarios.map(h => `${h.carrera}|${h.turno}|${h.grupo}`))].sort();
  await runBatch(
    grupoKeys.map(key => {
      const [carrera, turno, nombre] = key.split("|");
      const cuatrimestre = parseInt(nombre.replace(/\D/g, "")) || 0;
      return [
        `grupos/${carrera}_${nombre}_${turno}`,
        {
          carreraId: ref(`carreras/${carrera}`),
          turnoId: ref(`turnos/${turno}`),
          nombre,
          cuatrimestre,
          ciclo: CICLO,
          label: `${carrera} ${nombre} ${turno}`,
          carreraLabel: carrera,
          turnoLabel: turno,
          activo: true,
        },
      ];
    })
  );

  /* ─── 9. USUARIOS (perfiles base) ─── */
  console.log("9/10 Usuarios base...");
  const USUARIOS_BASE = [
    { uid: "admin-maximo", email: "maximo.murillo@utj.edu.mx", nombre: "Máximo Murillo", rol: "admin" },
    { uid: "admin-miguel", email: "miguel.garcia@utj.edu.mx", nombre: "Miguel García", rol: "admin" },
    { uid: "admin-jose", email: "jose.rodriguez@utj.edu.mx", nombre: "José Rodríguez", rol: "admin" },
  ];
  await runBatch(
    USUARIOS_BASE.map(u => [
      `usuarios/${u.uid}`,
      {
        email: u.email,
        nombre: u.nombre,
        foto: "",
        uid: u.uid,
        rol: u.rol,
        dominio: "utj.edu.mx",
        activo: true,
        ultimoAcceso: new Date("2026-01-15"),
        createdAt: new Date("2025-12-01"),
      },
    ])
  );
  console.log("  ⚠ Los usuarios reales se crean al iniciar sesión con Google.");

  /* ─── 10. HORARIOS ─── */
  console.log("10/10 Horarios...");
  const getBloques = (turno) => turno === "Vespertino" ? BLOQUES_VESPERTINO : BLOQUES;
  await runBatch(
    horarios.map((h, i) => {
      const inicioBloque = getBloques(h.turno).find(b => b.id === h.bloque)?.inicio || "00:00";
      const finBloque = getBloques(h.turno).find(b => b.id === h.bloque)?.fin || "00:00";
      return [
        `horarios/${CICLO}_${String(i + 1).padStart(4, "0")}`,
        {
          carreraId: ref(`carreras/${h.carrera}`),
          turnoId: ref(`turnos/${h.turno}`),
          grupoId: ref(`grupos/${h.carrera}_${h.grupo}_${h.turno}`),
          materiaId: ref(`materias/${h.carrera}_${slugify(h.materia)}`),
          profesorId: ref(`profesores/${slugify(h.profesor)}`),
          salonId: ref(`salones/${h.salon}`),

          dia: h.dia,
          diaVirtual: h.diaVirtual || null,
          bloqueNumero: h.bloque,
          ciclo: CICLO,

          carreraLabel: h.carrera,
          turnoLabel: h.turno,
          grupoLabel: h.grupo,
          materiaLabel: h.materia,
          profesorLabel: h.profesor,
          salonLabel: h.salon,
          pisoLabel: getPiso(h.salon),

          horaInicio: inicioBloque,
          horaFin: finBloque,
          timestampInicio: aMinutos(inicioBloque),
          timestampFin: aMinutos(finBloque),

          requiereProyector: !!h.proyector,
          proyectorAsignado: h.proyector || null,
          requiereWebcam: !!h.webcam,
          requiereAbrir: !!h.abrir,

          observaciones: [h.webcam ? "Webcam" : "", h.abrir ? "Abrir taller" : ""].filter(Boolean).join(", ") || null,
        },
      ];
    })
  );

  console.log(`\n✅ Seed completado: ${horarios.length} horarios cargados en ciclo ${CICLO}`);
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
