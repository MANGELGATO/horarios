import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, writeBatch } from "firebase/firestore";
import { horarios, getPiso, aMinutos, BLOQUES, BLOQUES_VESPERTINO } from "../src/data/horarios.js";

const CICLO = "2026B";

const firebaseConfig = {
  apiKey: "AIzaSyDpnWad3uYy1qVQyQlxjOSHt7JLPzCUa3E",
  authDomain: "horarios-ccd.firebaseapp.com",
  projectId: "horarios-ccd",
  storageBucket: "horarios-ccd.firebasestorage.app",
  messagingSenderId: "888408866342",
  appId: "1:888408866342:web:688519cef16e670a8c70e7",
  measurementId: "G-YLR0YZQQQK",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    const batch = writeBatch(db);
    const chunk = entries.slice(i, i + 499);
    chunk.forEach(([ref, data]) => batch.set(ref, data));
    await batch.commit();
    console.log(`  → ${Math.min(i + 499, entries.length)}/${entries.length}`);
  }
}

async function seed() {
  console.log("Iniciando seed de Firestore...\n");

  /* ─── 1. CARRERAS ─── */
  console.log("Carreras...");
  const carrerasList = [...new Set(horarios.map(h => h.carrera))].sort();
  const COLORES = { DSM: "#01696f", EVND: "#7b2d8b", IDGS: "#c0392b", IEVND: "#2c3e50" };
  await runBatch(
    carrerasList.map(siglas => [
      doc(db, "carreras", siglas),
      { nombre: siglas, color: COLORES[siglas] || "#666", activa: true, createdAt: new Date() },
    ])
  );

  /* ─── 2. TURNOS ─── */
  console.log("Turnos...");
  const turnosList = [...new Set(horarios.map(h => h.turno))].sort();
  const TURNOS_INFO = { Matutino: { horaInicio: "07:00", horaFin: "14:10" }, Vespertino: { horaInicio: "15:30", horaFin: "21:20" } };
  await runBatch(
    turnosList.map(nombre => [
      doc(db, "turnos", nombre),
      { nombre, horaInicio: TURNOS_INFO[nombre].horaInicio, horaFin: TURNOS_INFO[nombre].horaFin, activo: true },
    ])
  );

  /* ─── 3. BLOQUES ─── */
  console.log("Bloques...");
  const bloquesEntries = [];
  for (const turno of turnosList) {
    const bloques = turno === "Vespertino" ? BLOQUES_VESPERTINO : BLOQUES;
    for (const b of bloques) {
      bloquesEntries.push([
        doc(db, "bloques", `${turno}_bloque_${b.id}`),
        { turnoId: doc(db, "turnos", turno), numero: b.id, inicio: b.inicio, fin: b.fin, duracionMin: 50 },
      ]);
    }
  }
  await runBatch(bloquesEntries);

  /* ─── 4. EDIFICIOS ─── */
  console.log("Edificios...");
  await runBatch([
    [doc(db, "edificios", "edificio_aulas"), { nombre: "Edificio de Aulas", pisos: [1, 5], tieneMezzanine: true, tienePB: true }],
  ]);

  /* ─── 5. SALONES ─── */
  console.log("Salones...");
  const salonesList = [...new Set(horarios.map(h => h.salon))].sort();
  await runBatch(
    salonesList.map(nombre => {
      const tipo = nombre.startsWith("Aula") ? "Aula"
        : nombre.startsWith("Laboratorio") ? "Laboratorio"
        : nombre.startsWith("Taller") ? "Taller" : "Otro";
      return [
        doc(db, "salones", nombre),
        { nombre, piso: getPiso(nombre), tipo, activo: true },
      ];
    })
  );

  /* ─── 6. PROFESORES ─── */
  console.log("Profesores...");
  await runBatch(
    [...new Set(horarios.map(h => h.profesor))].sort().map(nombre => [
      doc(db, "profesores", slugify(nombre)),
      { nombre, activo: true, createdAt: new Date() },
    ])
  );

  /* ─── 7. MATERIAS ─── */
  console.log("Materias...");
  const materiaKeys = [...new Set(horarios.map(h => `${h.carrera}|${h.materia}`))].sort();
  await runBatch(
    materiaKeys.map(key => {
      const [carrera, nombre] = key.split("|");
      return [
        doc(db, "materias", `${carrera}_${slugify(nombre)}`),
        { nombre, carreraId: doc(db, "carreras", carrera), activa: true },
      ];
    })
  );

  /* ─── 8. GRUPOS ─── */
  console.log("Grupos...");
  const grupoKeys = [...new Set(horarios.map(h => `${h.carrera}|${h.turno}|${h.grupo}`))].sort();
  await runBatch(
    grupoKeys.map(key => {
      const [carrera, turno, nombre] = key.split("|");
      return [
        doc(db, "grupos", `${carrera}_${nombre}_${turno}`),
        { carreraId: doc(db, "carreras", carrera), turnoId: doc(db, "turnos", turno), nombre, label: `${carrera} ${nombre} ${turno}`, ciclo: CICLO, activo: true },
      ];
    })
  );

  /* ─── 9. HORARIOS ─── */
  console.log("Horarios...");
  const getBloques = (turno) => turno === "Vespertino" ? BLOQUES_VESPERTINO : BLOQUES;
  await runBatch(
    horarios.map((h, i) => {
      const inicioBloque = getBloques(h.turno).find(b => b.id === h.bloque)?.inicio || "00:00";
      return [
        doc(db, "horarios", `${CICLO}_${String(i + 1).padStart(4, "0")}`),
        {
          carreraId: doc(db, "carreras", h.carrera),
          turnoId: doc(db, "turnos", h.turno),
          grupoId: doc(db, "grupos", `${h.carrera}_${h.grupo}_${h.turno}`),
          materiaId: doc(db, "materias", `${h.carrera}_${slugify(h.materia)}`),
          profesorId: doc(db, "profesores", slugify(h.profesor)),
          salonId: doc(db, "salones", h.salon),
          dia: h.dia,
          diaVirtual: h.diaVirtual,
          bloqueNumero: h.bloque,
          ciclo: CICLO,
          carreraLabel: h.carrera,
          turnoLabel: h.turno,
          grupoLabel: h.grupo,
          materiaLabel: h.materia,
          profesorLabel: h.profesor,
          salonLabel: h.salon,
          pisoLabel: getPiso(h.salon),
          timestampInicio: aMinutos(inicioBloque),
        },
      ];
    })
  );

  console.log(`\nSeed completado: ${horarios.length} horarios cargados en ${CICLO}`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
