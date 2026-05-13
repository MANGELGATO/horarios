// ─────────────────────────────────────────────
// BLOQUES HORARIOS - MATUTINO (7:00 a 14:10)
// ─────────────────────────────────────────────
export const BLOQUES = [
  { id: 1, inicio: "07:00", fin: "07:50" },
  { id: 2, inicio: "07:50", fin: "08:40" },
  { id: 3, inicio: "09:10", fin: "10:00" },
  { id: 4, inicio: "10:00", fin: "10:50" },
  { id: 5, inicio: "10:50", fin: "11:40" },
  { id: 6, inicio: "11:40", fin: "12:30" },
  { id: 7, inicio: "12:30", fin: "13:20" },
  { id: 8, inicio: "13:20", fin: "14:10" },
];

// ─────────────────────────────────────────────
// BLOQUES HORARIOS - VESPERTINO (15:30 a 21:20)
// ─────────────────────────────────────────────
export const BLOQUES_VESPERTINO = [
  { id: 1, inicio: "15:30", fin: "16:20" },
  { id: 2, inicio: "16:20", fin: "17:10" },
  { id: 3, inicio: "17:10", fin: "18:00" },
  { id: 4, inicio: "18:00", fin: "18:50" },
  { id: 5, inicio: "18:50", fin: "19:40" },
  { id: 6, inicio: "19:40", fin: "20:30" },
  { id: 7, inicio: "20:30", fin: "21:20" },
];

export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export const aMinutos = (hora) => {
  const [hh, mm] = hora.split(':').map(Number);
  return hh * 60 + mm;
};

export const getBloqueById = (id, turno = "Matutino") => {
  const lista = turno === "Vespertino" ? BLOQUES_VESPERTINO : BLOQUES;
  return lista.find(b => b.id === id);
};

export const getClasesActuales = () => {
  const ahora = new Date();
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaActual = diasSemana[ahora.getDay()];
  const horaActual = ahora.toTimeString().slice(0, 5);
  return horarios.filter(h => {
    const bloque = getBloqueById(h.bloque, h.turno);
    if (!bloque) return false;
    return h.dia === diaActual && horaActual >= bloque.inicio && horaActual < bloque.fin;
  });
};

export const getClasesProximas = (minutos = 5) => {
  const ahora = new Date();
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaActual = diasSemana[ahora.getDay()];
  const minActual = aMinutos(ahora.toTimeString().slice(0, 5));
  return horarios
    .filter(h => {
      if (!h.proyector) return false;
      const bloque = getBloqueById(h.bloque, h.turno);
      if (!bloque || h.dia !== diaActual) return false;
      const minBloque = aMinutos(bloque.inicio);
      return minActual >= minBloque - minutos && minActual < minBloque;
    })
    .map(h => {
      const bloque = getBloqueById(h.bloque, h.turno);
      const esContinuacion = horarios.some(other =>
        other.carrera === h.carrera &&
        other.grupo === h.grupo &&
        other.turno === h.turno &&
        other.dia === h.dia &&
        other.materia === h.materia &&
        other.profesor === h.profesor &&
        other.salon === h.salon &&
        other.proyector === h.proyector &&
        other.bloque === h.bloque - 1
      );
      return { ...h, _inicio: bloque.inicio, _firstBlock: !esContinuacion };
    });
};

export const getClasesTerminando = (minutos = 5) => {
  const ahora = new Date();
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaActual = diasSemana[ahora.getDay()];
  const minActual = aMinutos(ahora.toTimeString().slice(0, 5));
  return horarios
    .filter(h => {
      if (!h.proyector) return false;
      const bloque = getBloqueById(h.bloque, h.turno);
      if (!bloque || h.dia !== diaActual) return false;
      const minFin = aMinutos(bloque.fin);
      return minActual >= minFin - minutos && minActual < minFin;
    })
    .map(h => {
      const bloque = getBloqueById(h.bloque, h.turno);
      const esUltimoBloque = !horarios.some(other =>
        other.carrera === h.carrera &&
        other.grupo === h.grupo &&
        other.turno === h.turno &&
        other.dia === h.dia &&
        other.materia === h.materia &&
        other.profesor === h.profesor &&
        other.salon === h.salon &&
        other.proyector === h.proyector &&
        other.bloque === h.bloque + 1
      );
      return { ...h, _fin: bloque.fin, _lastBlock: esUltimoBloque };
    });
};

export const getTurnoActual = () => {
  const ahora = new Date();
  const h = ahora.getHours(), m = ahora.getMinutes();
  const minutos = h * 60 + m;
  if (minutos >= 7 * 60 && minutos < 14 * 60 + 10) return 'Matutino';
  if (minutos >= 15 * 60 + 30 && minutos < 21 * 60 + 20) return 'Vespertino';
  return null;
};

export const getPiso = (salon) => {
  const ultimo = salon.split(' ').pop()
  if (ultimo.startsWith('PB')) return 'Planta Baja'
  if (ultimo.startsWith('M')) return 'Mezzanine'
  const n = parseInt(ultimo.charAt(0))
  if (n === 1) return 'Piso 1'
  if (n === 5) return 'Piso 5'
  return 'Otro'
}

export const getSalones = () => [...new Set(horarios.map(h => h.salon))].sort();
export const getGrupos = () => [...new Set(horarios.map(h => `${h.carrera}-${h.grupo}`))].sort();
export const getCarreras = () => [...new Set(horarios.map(h => h.carrera))].sort();
export const getTurnos = () => [...new Set(horarios.map(h => h.turno))].sort();

export const USUARIOS = [
  { email: "maximo.murillo@utj.edu.mx", password: "maximo.murillo@utj.edu.mx", nombre: "Máximo Murillo" },
  { email: "miguel.garcia@utj.edu.mx",  password: "miguel.garcia@utj.edu.mx",  nombre: "Miguel García" },
  { email: "jose.rodriguez@utj.edu.mx", password: "jose.rodriguez@utj.edu.mx", nombre: "José Rodríguez" },
];

// ─────────────────────────────────────────────
// ESTRUCTURA DE CADA ENTRADA:
// { carrera, turno, grupo, dia, bloque, materia, profesor, salon }
// ─────────────────────────────────────────────
export const horarios = [
  // ═══════════════════════════════════════════════════════════════════════════
  // TSU DSM - TURNO MATUTINO (Basado en PDF: 2026B TSU DSM M Distribución.pdf)
  // ═══════════════════════════════════════════════════════════════════════════

  // ==========================================
  // GRUPO: PRIMERO A
  // ==========================================
  // LUNES
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Lunes", bloque: 1, materia: "Desarrollo humano y valores", profesor: "Juan Carlos López Lucio", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Lunes", bloque: 2, materia: "Desarrollo humano y valores", profesor: "Juan Carlos López Lucio", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Lunes", bloque: 3, materia: "Comunicación y habilidades digitales", profesor: "Ana Luz Velázquez Moreno", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Lunes", bloque: 4, materia: "Comunicación y habilidades digitales", profesor: "Ana Luz Velázquez Moreno", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Lunes", bloque: 5, materia: "Inglés I", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Lunes", bloque: 6, materia: "Física", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Lunes", bloque: 7, materia: "Física", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula 501" },

  // MARTES
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Martes", bloque: 1, materia: "Fundamentos matemáticos", profesor: "Juan Antonio Martínez Carbajal", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Martes", bloque: 2, materia: "Fundamentos matemáticos", profesor: "Juan Antonio Martínez Carbajal", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Martes", bloque: 3, materia: "Fundamentos matemáticos", profesor: "Juan Antonio Martínez Carbajal", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Martes", bloque: 4, materia: "Fundamentos de programación", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Martes", bloque: 5, materia: "Fundamentos de programación", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Martes", bloque: 6, materia: "Inglés I", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Martes", bloque: 7, materia: "Inglés I", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula 501" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 1, materia: "Tutoría", profesor: "Sergio Ramírez Ulloa", salon: "Taller PB07" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 2, materia: "Fundamentos de programación", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 3, materia: "Fundamentos de programación", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 4, materia: "Comunicación y habilidades digitales", profesor: "Ana Luz Velázquez Moreno", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 5, materia: "Comunicación y habilidades digitales", profesor: "Ana Luz Velázquez Moreno", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 6, materia: "Comunicación y habilidades digitales", profesor: "Ana Luz Velázquez Moreno", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 7, materia: "Inglés I", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 8, materia: "Inglés I", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula 501" },

  // JUEVES
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Jueves", bloque: 1, materia: "Fundamentos matemáticos", profesor: "Juan Antonio Martínez Carbajal", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Jueves", bloque: 2, materia: "Fundamentos matemáticos", profesor: "Juan Antonio Martínez Carbajal", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Jueves", bloque: 3, materia: "Física", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Jueves", bloque: 4, materia: "Física", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Jueves", bloque: 5, materia: "Fundamentos de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Jueves", bloque: 6, materia: "Fundamentos de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M02" },

  // VIERNES
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Viernes", bloque: 1, materia: "Desarrollo humano y valores", profesor: "Juan Carlos López Lucio", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Viernes", bloque: 2, materia: "Desarrollo humano y valores", profesor: "Juan Carlos López Lucio", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Viernes", bloque: 3, materia: "Fundamentos matemáticos", profesor: "Juan Antonio Martínez Carbajal", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Viernes", bloque: 4, materia: "Fundamentos matemáticos", profesor: "Juan Antonio Martínez Carbajal", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Viernes", bloque: 5, materia: "Física", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Viernes", bloque: 6, materia: "Física", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Viernes", bloque: 7, materia: "Fundamentos de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "1A", diaVirtual: "Jueves", dia: "Viernes", bloque: 8, materia: "Fundamentos de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio 506" },

  // ==========================================
  // GRUPO: PRIMERO B
  // ==========================================
  // LUNES
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Lunes", bloque: 3, materia: "Tutoría", profesor: "Andrea Villaseñor Sahagún", salon: "Taller PB07" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Lunes", bloque: 4, materia: "Fundamentos de programación", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Lunes", bloque: 5, materia: "Fundamentos de programación", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Lunes", bloque: 6, materia: "Fundamentos matemáticos", profesor: "José Luis Rojas Cisneros", salon: "Taller PB07" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Lunes", bloque: 7, materia: "Fundamentos matemáticos", profesor: "José Luis Rojas Cisneros", salon: "Taller PB07" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Lunes", bloque: 8, materia: "Inglés I", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Taller PB07" },

  // MARTES
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Martes", bloque: 1, materia: "Comunicación y habilidades digitales", profesor: "Ana Luz Velázquez Moreno", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Martes", bloque: 2, materia: "Comunicación y habilidades digitales", profesor: "Ana Luz Velázquez Moreno", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Martes", bloque: 3, materia: "Fundamentos de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Martes", bloque: 4, materia: "Fundamentos de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Martes", bloque: 5, materia: "Fundamentos matemáticos", profesor: "José Luis Rojas Cisneros", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Martes", bloque: 6, materia: "Fundamentos matemáticos", profesor: "José Luis Rojas Cisneros", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Martes", bloque: 7, materia: "Física", profesor: "Eduardo Barbosa Olivares", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Martes", bloque: 8, materia: "Física", profesor: "Eduardo Barbosa Olivares", salon: "Aula M08" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 1, materia: "Comunicación y habilidades digitales", profesor: "Ana Luz Velázquez Moreno", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 2, materia: "Comunicación y habilidades digitales", profesor: "Ana Luz Velázquez Moreno", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 3, materia: "Comunicación y habilidades digitales", profesor: "Ana Luz Velázquez Moreno", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 4, materia: "Fundamentos de programación", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 5, materia: "Fundamentos de programación", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 6, materia: "Fundamentos matemáticos", profesor: "José Luis Rojas Cisneros", salon: "Taller PB07" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 7, materia: "Física", profesor: "Eduardo Barbosa Olivares", salon: "Taller PB07" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 8, materia: "Física", profesor: "Eduardo Barbosa Olivares", salon: "Taller PB07" },

  // JUEVES
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Jueves", bloque: 1, materia: "Inglés I", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Taller PB07" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Jueves", bloque: 2, materia: "Inglés I", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Taller PB07" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Jueves", bloque: 3, materia: "Desarrollo humano y valores", profesor: "Juan Carlos López Lucio", salon: "Taller PB07" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Jueves", bloque: 4, materia: "Desarrollo humano y valores", profesor: "Juan Carlos López Lucio", salon: "Taller PB07" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Jueves", bloque: 5, materia: "Fundamentos matemáticos", profesor: "José Luis Rojas Cisneros", salon: "Taller PB07" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Jueves", bloque: 6, materia: "Fundamentos matemáticos", profesor: "José Luis Rojas Cisneros", salon: "Taller PB07" },

  // VIERNES
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Viernes", bloque: 1, materia: "Fundamentos de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Viernes", bloque: 2, materia: "Fundamentos de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Viernes", bloque: 3, materia: "Desarrollo humano y valores", profesor: "Juan Carlos López Lucio", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Viernes", bloque: 4, materia: "Desarrollo humano y valores", profesor: "Juan Carlos López Lucio", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Viernes", bloque: 5, materia: "Inglés I", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Viernes", bloque: 6, materia: "Inglés I", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Viernes", bloque: 7, materia: "Física", profesor: "Eduardo Barbosa Olivares", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "1B", diaVirtual: "Jueves", dia: "Viernes", bloque: 8, materia: "Física", profesor: "Eduardo Barbosa Olivares", salon: "Aula M08" },

  // ==========================================
  // GRUPO: SEGUNDO A
  // ==========================================
  // LUNES
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 1, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 2, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 3, materia: "Habilidades socioemocionales y manejo", profesor: "Juan Carlos López Lucio", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 4, materia: "Habilidades socioemocionales y manejo", profesor: "Juan Carlos López Lucio", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 5, materia: "Inglés II", profesor: "Tania Sarai Jauregui López", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 6, materia: "Inglés II", profesor: "Tania Sarai Jauregui López", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 7, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 8, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M05" },

  // MARTES
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Martes", bloque: 1, materia: "Programación estructurada", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Martes", bloque: 2, materia: "Programación estructurada", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Martes", bloque: 3, materia: "Tutoría", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Martes", bloque: 4, materia: "Conmutación y enrutamiento de redes", profesor: "Juan Antonio Martínez Carbajal", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Martes", bloque: 5, materia: "Inglés II", profesor: "Tania Sarai Jauregui López", salon: "Aula 504" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Martes", bloque: 6, materia: "Inglés II", profesor: "Tania Sarai Jauregui López", salon: "Aula 504" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Martes", bloque: 7, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula 504" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Martes", bloque: 8, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula 504" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 1, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 2, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 3, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 4, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 6, materia: "Programación estructurada", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 7, materia: "Programación estructurada", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio M05" },

  // JUEVES
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 1, materia: "Habilidades socioemocionales y manejo", profesor: "Juan Carlos López Lucio", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 2, materia: "Habilidades socioemocionales y manejo", profesor: "Juan Carlos López Lucio", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 3, materia: "Conmutación y enrutamiento de redes", profesor: "Juan Antonio Martínez Carbajal", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 4, materia: "Conmutación y enrutamiento de redes", profesor: "Juan Antonio Martínez Carbajal", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 6, materia: "Programación estructurada", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 7, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 8, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula 502" },

  // VIERNES
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 1, materia: "Conmutación y enrutamiento de redes", profesor: "Juan Antonio Martínez Carbajal", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 2, materia: "Conmutación y enrutamiento de redes", profesor: "Juan Antonio Martínez Carbajal", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 3, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 4, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 5, materia: "Inglés II", profesor: "Tania Sarai Jauregui López", salon: "Aula M07" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 6, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "2A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 7, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M02" },

  // ==========================================
  // GRUPO: SEGUNDO B
  // ==========================================
  // LUNES
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 1, materia: "Conmutación y enrutamiento de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 2, materia: "Inglés II", profesor: "Tania Sarai Jauregui López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 3, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 4, materia: "Programación estructurada", profesor: "José Navarro Ríos", salon: "Laboratorio 109" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 5, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 109" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 6, materia: "Tutoría", profesor: "Marlene Mora Olmos", salon: "Aula M08" },

  // MARTES
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Martes", bloque: 1, materia: "Habilidades socioemocionales y manejo", profesor: "Astrid Gómez Sahagun", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Martes", bloque: 2, materia: "Habilidades socioemocionales y manejo", profesor: "Astrid Gómez Sahagun", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Martes", bloque: 3, materia: "Inglés II", profesor: "Tania Sarai Jauregui López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Martes", bloque: 4, materia: "Inglés II", profesor: "Tania Sarai Jauregui López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Martes", bloque: 5, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Martes", bloque: 6, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Martes", bloque: 7, materia: "Cálculo diferencial", profesor: "José Luis Rojas Cisneros", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Martes", bloque: 8, materia: "Cálculo diferencial", profesor: "José Luis Rojas Cisneros", salon: "Aula 505" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 1, materia: "Conmutación y enrutamiento de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 2, materia: "Conmutación y enrutamiento de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 3, materia: "Habilidades socioemocionales y manejo", profesor: "Astrid Gómez Sahagun", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 4, materia: "Habilidades socioemocionales y manejo", profesor: "Astrid Gómez Sahagun", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 5, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 6, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 7, materia: "Cálculo diferencial", profesor: "José Luis Rojas Cisneros", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 8, materia: "Cálculo diferencial", profesor: "José Luis Rojas Cisneros", salon: "Aula M10" },

  // JUEVES
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 1, materia: "Programación estructurada", profesor: "José Navarro Ríos", salon: "Laboratorio 109" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 2, materia: "Programación estructurada", profesor: "José Navarro Ríos", salon: "Laboratorio 109" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 3, materia: "Conmutación y enrutamiento de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 4, materia: "Conmutación y enrutamiento de redes", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 5, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 6, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 7, materia: "Cálculo diferencial", profesor: "José Luis Rojas Cisneros", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 8, materia: "Cálculo diferencial", profesor: "José Luis Rojas Cisneros", salon: "Aula 505" },

  // VIERNES
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Viernes", bloque: 1, materia: "Inglés II", profesor: "Tania Sarai Jauregui López", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Viernes", bloque: 2, materia: "Inglés II", profesor: "Tania Sarai Jauregui López", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Viernes", bloque: 3, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Viernes", bloque: 4, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Viernes", bloque: 5, materia: "Programación estructurada", profesor: "José Navarro Ríos", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "2B", diaVirtual: "Miércoles", dia: "Viernes", bloque: 6, materia: "Programación estructurada", profesor: "José Navarro Ríos", salon: "Laboratorio M05" },

  // ==========================================
  // GRUPO: TERCERO A
  // ==========================================
  // LUNES
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Lunes", bloque: 1, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Lunes", bloque: 2, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Lunes", bloque: 3, materia: "Programación orientada a objetos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Lunes", bloque: 4, materia: "Programación orientada a objetos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Lunes", bloque: 5, materia: "Programación orientada a objetos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Lunes", bloque: 6, materia: "Tutoría", profesor: "Héctor Orlando Gómez Castellanos", salon: "Aula 110" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Lunes", bloque: 7, materia: "Proyecto Integrador I", profesor: "Marlene Mora Olmos", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Lunes", bloque: 8, materia: "Proyecto Integrador I", profesor: "Marlene Mora Olmos", salon: "Laboratorio 506" },

  // MARTES
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Martes", bloque: 1, materia: "Programación orientada a objetos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Martes", bloque: 2, materia: "Programación orientada a objetos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Martes", bloque: 3, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula 504" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Martes", bloque: 4, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula 504" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Martes", bloque: 6, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Martes", bloque: 7, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Martes", bloque: 8, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Laboratorio 506" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 1, materia: "Inglés III", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 2, materia: "Inglés III", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 3, materia: "Proyecto Integrador I", profesor: "Marlene Mora Olmos", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 4, materia: "Proyecto Integrador I", profesor: "Marlene Mora Olmos", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 5, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 6, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 7, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 8, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula 505" },

  // JUEVES
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Jueves", bloque: 1, materia: "Programación orientada a objetos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Jueves", bloque: 2, materia: "Programación orientada a objetos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Jueves", bloque: 3, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Jueves", bloque: 4, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Jueves", bloque: 5, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Jueves", bloque: 6, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio M05" },

  // VIERNES
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Viernes", bloque: 1, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Viernes", bloque: 2, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Viernes", bloque: 4, materia: "Inglés III", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Viernes", bloque: 5, materia: "Inglés III", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Viernes", bloque: 6, materia: "Inglés III", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Viernes", bloque: 7, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "3A", diaVirtual: "Viernes", dia: "Viernes", bloque: 8, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Aula 505" },

  // ==========================================
  // GRUPO: TERCERO B
  // ==========================================

  // LUNES
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Lunes", bloque: 2, materia: "Cálculo integral", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Lunes", bloque: 3, materia: "Cálculo integral", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Lunes", bloque: 4, materia: "Proyecto Integrador I", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Lunes", bloque: 5, materia: "Proyecto Integrador I", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Lunes", bloque: 6, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Lunes", bloque: 7, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Lunes", bloque: 8, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio 503" },

  // MARTES
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Martes", bloque: 1, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Martes", bloque: 2, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Martes", bloque: 3, materia: "Inglés III", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Martes", bloque: 4, materia: "Inglés III", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Martes", bloque: 5, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Martes", bloque: 6, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Martes", bloque: 7, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Martes", bloque: 8, materia: "Tutoría", profesor: "Andrea Villaseñor Sahagún", salon: "Aula M07" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Miércoles", bloque: 1, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Miércoles", bloque: 2, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Miércoles", bloque: 3, materia: "Inglés III", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Miércoles", bloque: 4, materia: "Inglés III", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Miércoles", bloque: 5, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Miércoles", bloque: 6, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Miércoles", bloque: 7, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Miércoles", bloque: 8, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio M13" },

  // JUEVES
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Jueves", bloque: 1, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Jueves", bloque: 2, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Jueves", bloque: 3, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Jueves", bloque: 4, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Jueves", bloque: 5, materia: "Cálculo integral", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Jueves", bloque: 6, materia: "Cálculo integral", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Jueves", bloque: 7, materia: "Proyecto Integrador I", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Jueves", bloque: 8, materia: "Proyecto Integrador I", profesor: "Andrea Villaseñor Sahagún", salon: "Laboratorio M14" },

  // VIERNES
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Viernes", bloque: 1, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Viernes", bloque: 2, materia: "Inglés III", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Viernes", bloque: 3, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Viernes", bloque: 4, materia: "Tópicos de calidad para el diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio M05" },
  { carrera: "DSM", turno: "Matutino", grupo: "3B", diaVirtual: "Lunes", dia: "Viernes", bloque: 6, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 503" },

  // ==========================================
  // GRUPO: TERCERO D
  // ==========================================

  // LUNES
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Lunes", bloque: 1, materia: "Proyecto Integrador I", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Lunes", bloque: 2, materia: "Proyecto Integrador I", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Lunes", bloque: 3, materia: "Inglés III", profesor: "Tania Sarai Jauregui López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Lunes", bloque: 4, materia: "Inglés III", profesor: "Tania Sarai Jauregui López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Lunes", bloque: 5, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Lunes", bloque: 6, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Lunes", bloque: 7, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Lunes", bloque: 8, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },

  // MARTES
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Martes", bloque: 1, materia: "Inglés III", profesor: "Tania Sarai Jauregui López", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Martes", bloque: 2, materia: "Inglés III", profesor: "Tania Sarai Jauregui López", salon: "Aula 501" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Martes", bloque: 3, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Martes", bloque: 4, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Martes", bloque: 5, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Martes", bloque: 6, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula M10" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Miércoles", bloque: 1, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Miércoles", bloque: 2, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Miércoles", bloque: 3, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Miércoles", bloque: 4, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Miércoles", bloque: 5, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Miércoles", bloque: 6, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Aula 505" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Miércoles", bloque: 7, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Miércoles", bloque: 8, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 506" },

  // JUEVES
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Jueves", bloque: 1, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Jueves", bloque: 2, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Jueves", bloque: 3, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Jueves", bloque: 4, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Jueves", bloque: 5, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Jueves", bloque: 6, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Jueves", bloque: 7, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Jueves", bloque: 8, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Laboratorio 506" },

  // VIERNES
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Viernes", bloque: 1, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Viernes", bloque: 2, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Viernes", bloque: 3, materia: "Inglés III", profesor: "Tania Sarai Jauregui López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Viernes", bloque: 4, materia: "Tutoría", profesor: "Tania Sarai Jauregui López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Viernes", bloque: 5, materia: "Proyecto Integrador I", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "3D", diaVirtual: "Martes", dia: "Viernes", bloque: 6, materia: "Proyecto Integrador I", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  // ==========================================
  // GRUPO: CUARTO A
  // ==========================================

  // LUNES
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 1, materia: "Estructura de datos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 2, materia: "Estructura de datos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 3, materia: "Análisis y diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 4, materia: "Análisis y diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 5, materia: "Aplicaciones Web", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 6, materia: "Cálculo de varias variables", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 7, materia: "Cálculo de varias variables", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },

  // MARTES
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 1, materia: "Inglés IV", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 2, materia: "Inglés IV", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 3, materia: "Estructura de datos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 4, materia: "Estructura de datos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 5, materia: "Análisis y diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 6, materia: "Cálculo de varias variables", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 7, materia: "Ética profesional", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 8, materia: "Ética profesional", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 1, materia: "Aplicaciones Web", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 2, materia: "Aplicaciones Web", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 3, materia: "Desarrollo de aplicaciones móviles", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 109" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 4, materia: "Desarrollo de aplicaciones móviles", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 109" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 5, materia: "Ética profesional", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 6, materia: "Ética profesional", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 7, materia: "Cálculo de varias variables", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 8, materia: "Cálculo de varias variables", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },

  // JUEVES
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 1, materia: "Inglés IV", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 2, materia: "Inglés IV", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 3, materia: "Inglés IV", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 502" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 4, materia: "Desarrollo de aplicaciones móviles", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 5, materia: "Estructura de datos", profesor: "Nelida Abril Zaragoza Carrillo", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 6, materia: "Análisis y diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 7, materia: "Análisis y diseño de software", profesor: "Marlene Mora Olmos", salon: "Laboratorio M13" },

  // VIERNES
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 1, materia: "Aplicaciones Web", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 2, materia: "Aplicaciones Web", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 3, materia: "Desarrollo de aplicaciones móviles", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 4, materia: "Desarrollo de aplicaciones móviles", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 5, materia: "Desarrollo de aplicaciones móviles", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 503" },
  { carrera: "DSM", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 6, materia: "Tutoría", profesor: "Eduardo Barbosa Olivares", salon: "Aula M07" },

  // ==========================================
  // GRUPO: QUINTO AB
  // ==========================================

  // LUNES
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Lunes", bloque: 2, materia: "Proyecto Integrador II", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Lunes", bloque: 3, materia: "Proyecto Integrador II", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Lunes", bloque: 4, materia: "Ecuaciones Diferenciales", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Lunes", bloque: 5, materia: "Ecuaciones Diferenciales", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Lunes", bloque: 6, materia: "Aplicaciones Web orientadas a servicios", profesor: "José Navarro Ríos", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Lunes", bloque: 7, materia: "Aplicaciones Web orientadas a servicios", profesor: "José Navarro Ríos", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Lunes", bloque: 8, materia: "Inglés V", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Laboratorio M13" },

  // MARTES
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Martes", bloque: 2, materia: "Proyecto Integrador II", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Martes", bloque: 3, materia: "Proyecto Integrador II", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Martes", bloque: 4, materia: "Inglés V", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M07" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Martes", bloque: 5, materia: "Inglés V", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M07" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Martes", bloque: 6, materia: "Liderazgo de equipos de alto desempeño", profesor: "Ana Luz Velázquez Moreno", salon: "Aula M07" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Martes", bloque: 7, materia: "Liderazgo de equipos de alto desempeño", profesor: "Ana Luz Velázquez Moreno", salon: "Aula M07" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Miércoles", bloque: 1, materia: "Inglés V", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Miércoles", bloque: 2, materia: "Inglés V", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Miércoles", bloque: 3, materia: "Estándares y métricas para el desarrollo de software", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Miércoles", bloque: 4, materia: "Estándares y métricas para el desarrollo de software", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Miércoles", bloque: 5, materia: "Tutoría", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Aula M10" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Miércoles", bloque: 6, materia: "Bases de datos avanzadas", profesor: "Carlos Iván Media López", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Miércoles", bloque: 7, materia: "Liderazgo de equipos de alto desempeño", profesor: "Ana Luz Velázquez Moreno", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Miércoles", bloque: 8, materia: "Liderazgo de equipos de alto desempeño", profesor: "Ana Luz Velázquez Moreno", salon: "Aula M08" },

  // JUEVES
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Jueves", bloque: 1, materia: "Estándares y métricas para el desarrollo de software", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Jueves", bloque: 2, materia: "Estándares y métricas para el desarrollo de software", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Jueves", bloque: 3, materia: "Bases de datos avanzadas", profesor: "Carlos Iván Media López", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Jueves", bloque: 4, materia: "Bases de datos avanzadas", profesor: "Carlos Iván Media López", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Jueves", bloque: 5, materia: "Aplicaciones Web orientadas a servicios", profesor: "José Navarro Ríos", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Jueves", bloque: 6, materia: "Aplicaciones Web orientadas a servicios", profesor: "José Navarro Ríos", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Jueves", bloque: 7, materia: "Ecuaciones Diferenciales", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M08" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Jueves", bloque: 8, materia: "Ecuaciones Diferenciales", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M08" },

  // VIERNES
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Viernes", bloque: 1, materia: "Aplicaciones Web orientadas a servicios", profesor: "José Navarro Ríos", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Viernes", bloque: 2, materia: "Aplicaciones Web orientadas a servicios", profesor: "José Navarro Ríos", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Viernes", bloque: 3, materia: "Estándares y métricas para el desarrollo de software", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Viernes", bloque: 4, materia: "Estándares y métricas para el desarrollo de software", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Viernes", bloque: 5, materia: "Bases de datos avanzadas", profesor: "Carlos Iván Media López", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Viernes", bloque: 6, materia: "Bases de datos avanzadas", profesor: "Carlos Iván Media López", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Matutino", grupo: "5AB", diaVirtual: "Viernes", dia: "Viernes", bloque: 7, materia: "Ecuaciones Diferenciales", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M07" },
  // ═══════════════════════════════════════════════════════════════════════════
  // TSU EVND - TURNO MATUTINO (Basado en PDF: 2026B TSU EVND Distribución.pdf)
  // ═══════════════════════════════════════════════════════════════════════════

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 2A (EVND)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Lunes", bloque: 1, materia: "Habilidades socioemocionales y manejo", profesor: "Ana Luz Velázquez Moreno", salon: "Aula 505" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Lunes", bloque: 2, materia: "Habilidades socioemocionales y manejo", profesor: "Ana Luz Velázquez Moreno", salon: "Aula 505" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Lunes", bloque: 3, materia: "Programación estructurada", profesor: "José Navarro Ríos", salon: "Laboratorio M11" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Lunes", bloque: 4, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula 505" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Lunes", bloque: 5, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula 505" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Lunes", bloque: 6, materia: "Inglés II", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula 505" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Lunes", bloque: 7, materia: "Inglés II", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula 505" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Lunes", bloque: 8, materia: "Tutoría", profesor: "Marlene Mora Olmos", salon: "Aula 505" },

  // MARTES
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Martes", bloque: 1, materia: "Inglés II", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula 505" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Martes", bloque: 2, materia: "Inglés II", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula 505" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Martes", bloque: 3, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula 505" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Martes", bloque: 4, materia: "Habilidades socioemocionales y manejo", profesor: "Ana Luz Velázquez Moreno", salon: "Aula 501" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Martes", bloque: 5, materia: "Habilidades socioemocionales y manejo", profesor: "Ana Luz Velázquez Moreno", salon: "Aula 501" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Martes", bloque: 6, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M02" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Martes", bloque: 7, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M02" },

  // MIÉRCOLES
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Miércoles", bloque: 1, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula 501" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Miércoles", bloque: 2, materia: "Probabilidad y estadística", profesor: "Ernesto Roque Rodríguez", salon: "Aula 501" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Miércoles", bloque: 3, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula 501" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Miércoles", bloque: 4, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula 501" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Miércoles", bloque: 5, materia: "Conmutación y enrutamiento de redes", profesor: "Carlos Iván Media López", salon: "Laboratorio M11" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Miércoles", bloque: 6, materia: "Inglés II", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula 501" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Miércoles", bloque: 7, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M02" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Miércoles", bloque: 8, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M02" },

  // JUEVES
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Jueves", bloque: 1, materia: "Conmutación y enrutamiento de redes", profesor: "Carlos Iván Media López", salon: "Laboratorio M02" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Jueves", bloque: 2, materia: "Conmutación y enrutamiento de redes", profesor: "Carlos Iván Media López", salon: "Laboratorio M02" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Jueves", bloque: 3, materia: "Programación estructurada", profesor: "José Navarro Ríos", salon: "Laboratorio M11" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Jueves", bloque: 4, materia: "Programación estructurada", profesor: "José Navarro Ríos", salon: "Laboratorio M11" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Jueves", bloque: 5, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula 501" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Jueves", bloque: 6, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula 501" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Jueves", bloque: 7, materia: "Sistemas Operativos", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio M02" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Jueves", bloque: 8, materia: "Tutoría", profesor: "Marlene Mora Olmos", salon: "Aula 501" },

  // VIERNES
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Viernes", bloque: 1, materia: "Conmutación y enrutamiento de redes", profesor: "Carlos Iván Media López", salon: "Laboratorio M11" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Viernes", bloque: 2, materia: "Conmutación y enrutamiento de redes", profesor: "Carlos Iván Media López", salon: "Laboratorio M11" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Viernes", bloque: 3, materia: "Programación estructurada", profesor: "José Navarro Ríos", salon: "Laboratorio M11" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Viernes", bloque: 4, materia: "Programación estructurada", profesor: "José Navarro Ríos", salon: "Laboratorio M11" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Viernes", bloque: 5, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula M10" },
  { carrera: "EVND", turno: "Matutino", grupo: "2A", diaVirtual: "Martes", dia: "Viernes", bloque: 6, materia: "Cálculo diferencial", profesor: "Candelario Castañeda Castañeda", salon: "Aula M10" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 3A (EVND)
  // ──────────────────────────────────────────────────────────────────────────

  // LUNES
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Lunes", bloque: 1, materia: "Proyecto Integrador I", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Lunes", bloque: 2, materia: "Proyecto Integrador I", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Lunes", bloque: 3, materia: "Inglés III", profesor: "Tania Sarai Jauregui López", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Lunes", bloque: 4, materia: "Inglés III", profesor: "Tania Sarai Jauregui López", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Lunes", bloque: 5, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio M02" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Lunes", bloque: 6, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio M02" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Lunes", bloque: 7, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio M02" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Lunes", bloque: 8, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },

  // MARTES
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Martes", bloque: 1, materia: "Inglés III", profesor: "Tania Sarai Jauregui López", salon: "Aula 501" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Martes", bloque: 2, materia: "Inglés III", profesor: "Tania Sarai Jauregui López", salon: "Aula 501" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Martes", bloque: 3, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Martes", bloque: 4, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Martes", bloque: 5, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula M10" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Martes", bloque: 6, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula M10" },

  // MIÉRCOLES
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Miércoles", bloque: 1, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Miércoles", bloque: 2, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Miércoles", bloque: 3, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Miércoles", bloque: 4, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Miércoles", bloque: 5, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Miércoles", bloque: 6, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Aula 505" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Miércoles", bloque: 7, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Miércoles", bloque: 8, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 506" },

  // JUEVES
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Jueves", bloque: 1, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Jueves", bloque: 2, materia: "Base de datos", profesor: "Eduardo Barbosa Olivares", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Jueves", bloque: 3, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Jueves", bloque: 4, materia: "Tópicos de calidad para el diseño de software", profesor: "Héctor Orlando Gómez Castellanos", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Jueves", bloque: 5, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Jueves", bloque: 6, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Jueves", bloque: 7, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Jueves", bloque: 8, materia: "Cálculo integral", profesor: "Bronislava Franco Llamas", salon: "Laboratorio 506" },

  // VIERNES
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Viernes", bloque: 1, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio M02" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Viernes", bloque: 2, materia: "Programación orientada a objetos", profesor: "Sergio Ramírez Ulloa", salon: "Laboratorio M02" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Viernes", bloque: 3, materia: "Inglés III", profesor: "Tania Sarai Jauregui López", salon: "Aula 505" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Viernes", bloque: 4, materia: "Tutoría", profesor: "Eduardo Barbosa Olivares", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Viernes", bloque: 5, materia: "Proyecto Integrador I", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "3A", diaVirtual: "Martes", dia: "Viernes", bloque: 6, materia: "Proyecto Integrador I", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 4A (EVND)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 1, materia: "Modelado y animación digital", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 2, materia: "Modelado y animación digital", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 3, materia: "Mercadotecnia digital", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 4, materia: "Mercadotecnia digital", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 5, materia: "Aplicaciones Web", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 6, materia: "Cálculo de varias variables", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Lunes", bloque: 7, materia: "Cálculo de varias variables", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },

  // MARTES
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 1, materia: "Inglés IV", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 2, materia: "Inglés IV", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 3, materia: "Tutoría", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 4, materia: "Diseño digital y producción audiovisual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 5, materia: "Diseño digital y producción audiovisual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 6, materia: "Cálculo de varias variables", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 7, materia: "Ética profesional", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Martes", bloque: 8, materia: "Ética profesional", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },

  // MIÉRCOLES
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 1, materia: "Aplicaciones Web", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 2, materia: "Aplicaciones Web", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 3, materia: "Mercadotecnia digital", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Laboratorio 503" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 4, materia: "Mercadotecnia digital", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Laboratorio 503" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 5, materia: "Ética profesional", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 6, materia: "Ética profesional", profesor: "Astrid Gómez Sahagun", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 7, materia: "Cálculo de varias variables", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Miércoles", bloque: 8, materia: "Cálculo de varias variables", profesor: "Bronislava Franco Llamas", salon: "Aula 502" },

  // JUEVES
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 1, materia: "Inglés IV", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 2, materia: "Inglés IV", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 3, materia: "Inglés IV", profesor: "Bertha Guadalupe Vázquez López", salon: "Aula 502" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 5, materia: "Diseño digital y producción audiovisual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 6, materia: "Diseño digital y producción audiovisual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 7, materia: "Modelado y animación digital", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Jueves", bloque: 8, materia: "Modelado y animación digital", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },

  // VIERNES
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 1, materia: "Aplicaciones Web", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 2, materia: "Aplicaciones Web", profesor: "Edgardo Emmanuel Gonzalez Del C", salon: "Laboratorio 506" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 4, materia: "Diseño digital y producción audiovisual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 5, materia: "Diseño digital y producción audiovisual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 6, materia: "Modelado y animación digital", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "4A", diaVirtual: "Lunes", dia: "Viernes", bloque: 7, materia: "Modelado y animación digital", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 5A (EVND)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Lunes", bloque: 2, materia: "Proyecto Integrador II", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M14" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Lunes", bloque: 3, materia: "Proyecto Integrador II", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M14" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Lunes", bloque: 4, materia: "Ecuaciones Diferenciales", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M08" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Lunes", bloque: 5, materia: "Ecuaciones Diferenciales", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M08" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Lunes", bloque: 6, materia: "Aplicaciones para realidad virtual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Lunes", bloque: 7, materia: "Aplicaciones para realidad virtual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Lunes", bloque: 8, materia: "Inglés V", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Laboratorio M13" },

  // MARTES
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Martes", bloque: 1, materia: "Aplicaciones para realidad aumentada", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Martes", bloque: 2, materia: "Proyecto Integrador II", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M14" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Martes", bloque: 3, materia: "Proyecto Integrador II", profesor: "Marisol Guzmán Padilla", salon: "Laboratorio M14" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Martes", bloque: 4, materia: "Inglés V", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M07" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Martes", bloque: 5, materia: "Inglés V", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M07" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Martes", bloque: 6, materia: "Liderazgo de equipos de alto desempeño", profesor: "Ana Luz Velázquez Moreno", salon: "Aula M07" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Martes", bloque: 7, materia: "Liderazgo de equipos de alto desempeño", profesor: "Ana Luz Velázquez Moreno", salon: "Aula M07" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Martes", bloque: 8, materia: "Tutoría", profesor: "Omar Enrique Moreno López", salon: "Aula 110" },

  // MIÉRCOLES
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 1, materia: "Inglés V", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M08" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 2, materia: "Inglés V", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M08" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 3, materia: "Frameworks para desarrollo Web", profesor: "Carlos Iván Media López", salon: "Laboratorio M12" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 4, materia: "Frameworks para desarrollo Web", profesor: "Carlos Iván Media López", salon: "Laboratorio M12" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 5, materia: "Aplicaciones para realidad aumentada", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 6, materia: "Aplicaciones para realidad aumentada", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 7, materia: "Liderazgo de equipos de alto desempeño", profesor: "Ana Luz Velázquez Moreno", salon: "Aula M08" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 8, materia: "Liderazgo de equipos de alto desempeño", profesor: "Ana Luz Velázquez Moreno", salon: "Aula M08" },

  // JUEVES
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Jueves", bloque: 1, materia: "Aplicaciones para realidad aumentada", profesor: "Omar Enrique Moreno López", salon: "Laboratorio M12" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Jueves", bloque: 2, materia: "Aplicaciones para realidad aumentada", profesor: "Omar Enrique Moreno López", salon: "Laboratorio M12" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Jueves", bloque: 3, materia: "Aplicaciones para realidad virtual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Jueves", bloque: 4, materia: "Aplicaciones para realidad virtual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Jueves", bloque: 5, materia: "Frameworks para desarrollo Web", profesor: "Carlos Iván Media López", salon: "Laboratorio M12" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Jueves", bloque: 6, materia: "Frameworks para desarrollo Web", profesor: "Carlos Iván Media López", salon: "Laboratorio M12" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Jueves", bloque: 7, materia: "Ecuaciones Diferenciales", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M08" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Jueves", bloque: 8, materia: "Ecuaciones Diferenciales", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M08" },

  // VIERNES
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Viernes", bloque: 1, materia: "Aplicaciones para realidad virtual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Viernes", bloque: 2, materia: "Aplicaciones para realidad virtual", profesor: "Omar Enrique Moreno López", salon: "Laboratorio 109" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Viernes", bloque: 3, materia: "Frameworks para desarrollo Web", profesor: "Carlos Iván Media López", salon: "Laboratorio M12" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Viernes", bloque: 4, materia: "Frameworks para desarrollo Web", profesor: "Carlos Iván Media López", salon: "Laboratorio M12" },
  { carrera: "EVND", turno: "Matutino", grupo: "5A", diaVirtual: "Viernes", dia: "Viernes", bloque: 7, materia: "Ecuaciones Diferenciales", profesor: "Héctor Jesús Guzmán Colín", salon: "Aula M07" },
  // ═══════════════════════════════════════════════════════════════════════════
  // TSU DSM - TURNO VESPERTINO (Basado en PDF: 2026B TSU DSM V Distribución.pdf)
  // ═══════════════════════════════════════════════════════════════════════════

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 2C (DSM)
  // ──────────────────────────────────────────────────────────────────────────

  // LUNES
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Lunes", bloque: 1, materia: "Habilidades socioemocionales y manejo de conflictos", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M08" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Lunes", bloque: 2, materia: "Conmutación y enrutamiento de redes", profesor: "Iliana López Guillen", salon: "Laboratorio M02", proyector: "M02" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Lunes", bloque: 3, materia: "Probabilidad y estadística", profesor: "Jaime Antonio Cerda Soto", salon: "Aula 504" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Lunes", bloque: 4, materia: "Probabilidad y estadística", profesor: "Jaime Antonio Cerda Soto", salon: "Aula 504" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Lunes", bloque: 5, materia: "Probabilidad y estadística", profesor: "Jaime Antonio Cerda Soto", salon: "Aula 504" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Lunes", bloque: 6, materia: "Inglés II", profesor: "José Antonio Ayllón Ríos", salon: "Aula M08" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Lunes", bloque: 7, materia: "Inglés II", profesor: "José Antonio Ayllón Ríos", salon: "Aula M08" },

  // MARTES
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Martes", bloque: 1, materia: "Sistemas Operativos", profesor: "Iliana López Guillen", salon: "Laboratorio M02", proyector: "M02" },

  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Martes", bloque: 2, materia: "Sistemas Operativos", profesor: "Iliana López Guillen", salon: "Laboratorio M02", proyector: "M02" },

  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Martes", bloque: 3, materia: "Sistemas Operativos", profesor: "Iliana López Guillen", salon: "Laboratorio M02", proyector: "M02" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Martes", bloque: 4, materia: "Cálculo diferencial", profesor: "Edgar Ulises Toledo Nares", salon: "Aula M08" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Martes", bloque: 5, materia: "Cálculo diferencial", profesor: "Edgar Ulises Toledo Nares", salon: "Aula M08" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Martes", bloque: 6, materia: "Probabilidad y estadística", profesor: "Jaime Antonio Cerda Soto", salon: "Aula M10" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Martes", bloque: 7, materia: "Probabilidad y estadística", profesor: "Jaime Antonio Cerda Soto", salon: "Aula M10" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 1, materia: "Habilidades socioemocionales y manejo de conflictos", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M08" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 2, materia: "Cálculo diferencial", profesor: "Edgar Ulises Toledo Nares", salon: "Aula M10" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 3, materia: "Cálculo diferencial", profesor: "Edgar Ulises Toledo Nares", salon: "Aula M10" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 4, materia: "Inglés II", profesor: "José Antonio Ayllón Ríos", salon: "Aula M08" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 5, materia: "Inglés II", profesor: "José Antonio Ayllón Ríos", salon: "Aula M08" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 6, materia: "Sistemas Operativos", profesor: "Iliana López Guillen", salon: "Laboratorio M02" },

  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 7, materia: "Sistemas Operativos", profesor: "Iliana López Guillen", salon: "Laboratorio M02" },
  // JUEVES
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Jueves", bloque: 1, materia: "Habilidades socioemocionales y manejo de conflictos", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M08" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Jueves", bloque: 2, materia: "Programación estructurada", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M11", proyector: "M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Jueves", bloque: 3, materia: "Programación estructurada", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M11", proyector: "M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Jueves", bloque: 4, materia: "Cálculo diferencial", profesor: "Edgar Ulises Toledo Nares", salon: "Aula M07", proyector: "M07" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Jueves", bloque: 5, materia: "Cálculo diferencial", profesor: "Edgar Ulises Toledo Nares", salon: "Aula M07", proyector: "M07" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Jueves", bloque: 6, materia: "Conmutación y enrutamiento de redes", profesor: "Iliana López Guillen", salon: "Laboratorio M02", proyector: "M02" },

  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Jueves", bloque: 7, materia: "Conmutación y enrutamiento de redes", profesor: "Iliana López Guillen", salon: "Laboratorio M02", proyector: "M02" },
  // VIERNES
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Viernes", bloque: 1, materia: "Habilidades socioemocionales y manejo de conflictos", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M08" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Viernes", bloque: 2, materia: "Inglés II", profesor: "José Antonio Ayllón Ríos", salon: "Aula M08" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Viernes", bloque: 3, materia: "Conmutación y enrutamiento de redes", profesor: "Iliana López Guillen", salon: "Laboratorio M11", proyector: "M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Viernes", bloque: 4, materia: "Conmutación y enrutamiento de redes", profesor: "Iliana López Guillen", salon: "Laboratorio M11", proyector: "M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Viernes", bloque: 5, materia: "Programación estructurada", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M11", proyector: "M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Viernes", bloque: 6, materia: "Programación estructurada", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M11", proyector: "M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "2C", diaVirtual: "Miércoles", dia: "Viernes", bloque: 7, materia: "Programación estructurada", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M11", proyector: "M11" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 3C (DSM)
  // ──────────────────────────────────────────────────────────────────────────

  // LUNES
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Lunes", bloque: 1, materia: "Programación orientada a objetos", profesor: "Olivia Hernández Arce", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Lunes", bloque: 2, materia: "Programación orientada a objetos", profesor: "Olivia Hernández Arce", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Lunes", bloque: 3, materia: "Programación orientada a objetos", profesor: "Olivia Hernández Arce", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Lunes", bloque: 4, materia: "Cálculo integral", profesor: "Jorge Rodríguez Gallegos", salon: "Aula M10", proyector: "M10", webcam: true },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Lunes", bloque: 5, materia: "Cálculo integral", profesor: "Jorge Rodríguez Gallegos", salon: "Aula M10" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Lunes", bloque: 6, materia: "Base de datos", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Lunes", bloque: 7, materia: "Base de datos", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M11" },

  // MARTES
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Martes", bloque: 1, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula M07" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Martes", bloque: 2, materia: "Base de datos", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Martes", bloque: 3, materia: "Base de datos", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Martes", bloque: 4, materia: "Proyecto Integrador I", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Martes", bloque: 5, materia: "Proyecto Integrador I", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Martes", bloque: 6, materia: "Programación orientada a objetos", profesor: "Olivia Hernández Arce", salon: "Laboratorio M02" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Martes", bloque: 7, materia: "Programación orientada a objetos", profesor: "Olivia Hernández Arce", salon: "Laboratorio M02" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Miércoles", bloque: 1, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula M07" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Miércoles", bloque: 2, materia: "Cálculo integral", profesor: "Jorge Rodríguez Gallegos", salon: "Aula 110" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Miércoles", bloque: 3, materia: "Cálculo integral", profesor: "Jorge Rodríguez Gallegos", salon: "Aula 110" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Miércoles", bloque: 4, materia: "Tópicos de calidad para el diseño de software", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M14", proyector: "M14" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Miércoles", bloque: 5, materia: "Tópicos de calidad para el diseño de software", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M14", proyector: "M14" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Miércoles", bloque: 6, materia: "Tópicos de calidad para el diseño de software", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M14", proyector: "M14" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Miércoles", bloque: 7, materia: "Base de datos", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M14" },

  // JUEVES
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Jueves", bloque: 1, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula M07" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Jueves", bloque: 2, materia: "Inglés III", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M07" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Jueves", bloque: 3, materia: "Inglés III", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M07" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Jueves", bloque: 4, materia: "Programación orientada a objetos", profesor: "Olivia Hernández Arce", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Jueves", bloque: 5, materia: "Programación orientada a objetos", profesor: "Olivia Hernández Arce", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Jueves", bloque: 6, materia: "Proyecto Integrador I", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Jueves", bloque: 7, materia: "Proyecto Integrador I", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M11" },

  // VIERNES
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Viernes", bloque: 1, materia: "Desarrollo de pensamiento y toma de decisiones", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula M07" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Viernes", bloque: 2, materia: "Tópicos de calidad para el diseño de software", profesor: "Roberto Cazares Gomez", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Viernes", bloque: 3, materia: "Tópicos de calidad para el diseño de software", profesor: "Roberto Cazares Gomez", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Viernes", bloque: 4, materia: "Tópicos de calidad para el diseño de software", profesor: "Roberto Cazares Gomez", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Viernes", bloque: 5, materia: "Inglés III", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M10" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Viernes", bloque: 6, materia: "Inglés III", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M10" },
  { carrera: "DSM", turno: "Vespertino", grupo: "3C", diaVirtual: "Lunes", dia: "Viernes", bloque: 7, materia: "Inglés III", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M10" },
  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 4B (DSM)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Lunes", bloque: 2, materia: "Base de datos", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Lunes", bloque: 3, materia: "Base de datos", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Lunes", bloque: 4, materia: "Tutoría", profesor: "Olivia Hernández Arce", salon: "Aula 110" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Lunes", bloque: 5, materia: "Inglés III", profesor: "José Antonio Ayllón Ríos", salon: "Aula 110" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Lunes", bloque: 6, materia: "Probabilidad y estadística", profesor: "Jaime Antonio Cerda Soto", salon: "Aula M10" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Lunes", bloque: 7, materia: "Probabilidad y estadística", profesor: "Jaime Antonio Cerda Soto", salon: "Aula M10" },

  // MARTES
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Martes", bloque: 2, materia: "Probabilidad y estadística", profesor: "Jaime Antonio Cerda Soto", salon: "Aula M10" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Martes", bloque: 3, materia: "Probabilidad y estadística", profesor: "Jaime Antonio Cerda Soto", salon: "Aula M10" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Martes", bloque: 4, materia: "Probabilidad y estadística", profesor: "Jaime Antonio Cerda Soto", salon: "Aula M10" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Martes", bloque: 5, materia: "Base de datos", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Martes", bloque: 6, materia: "Programación orientada a objetos", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Martes", bloque: 7, materia: "Programación orientada a objetos", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M11" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 2, materia: "Base de datos", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 3, materia: "Base de datos", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 4, materia: "Programación orientada a objetos", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 5, materia: "Programación orientada a objetos", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M11" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 6, materia: "Programación orientada a objetos", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M11" },

  // JUEVES
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Jueves", bloque: 4, materia: "Inglés III", profesor: "José Antonio Ayllón Ríos", salon: "Laboratorio M13" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Jueves", bloque: 5, materia: "Inglés III", profesor: "José Antonio Ayllón Ríos", salon: "Laboratorio M13" },

  // VIERNES
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Viernes", bloque: 2, materia: "Programación orientada a objetos", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Viernes", bloque: 3, materia: "Programación orientada a objetos", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M14" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Viernes", bloque: 4, materia: "Inglés III", profesor: "José Antonio Ayllón Ríos", salon: "Aula M08" },
  { carrera: "DSM", turno: "Vespertino", grupo: "4B", diaVirtual: "Jueves", dia: "Viernes", bloque: 5, materia: "Inglés III", profesor: "José Antonio Ayllón Ríos", salon: "Aula M08" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 6C (DSM) - CORREGIDO
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Lunes", bloque: 2, materia: "Aplicaciones Web", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Lunes", bloque: 3, materia: "Aplicaciones Web", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Lunes", bloque: 4, materia: "Análisis y diseño de software", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Lunes", bloque: 5, materia: "Análisis y diseño de software", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Lunes", bloque: 6, materia: "Desarrollo de aplicaciones móviles", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Lunes", bloque: 7, materia: "Desarrollo de aplicaciones móviles", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12", proyector: "M12" },

  // MARTES
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Martes", bloque: 2, materia: "Desarrollo de aplicaciones móviles", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Martes", bloque: 3, materia: "Desarrollo de aplicaciones móviles", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Martes", bloque: 4, materia: "Análisis y diseño de software", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Martes", bloque: 5, materia: "Estructura de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Martes", bloque: 6, materia: "Estructura de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Martes", bloque: 7, materia: "Estructura de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M12", proyector: "M12" },

  // MIÉRCOLES
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Miércoles", bloque: 2, materia: "Desarrollo de aplicaciones móviles", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Miércoles", bloque: 3, materia: "Desarrollo de aplicaciones móviles", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Miércoles", bloque: 4, materia: "Análisis y diseño de software", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Miércoles", bloque: 5, materia: "Análisis y diseño de software", profesor: "Diego Iñiguez Jiménez", salon: "Laboratorio M12" },

  // JUEVES
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Jueves", bloque: 2, materia: "Estructura de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Jueves", bloque: 3, materia: "Estructura de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Jueves", bloque: 4, materia: "Tutoría", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Jueves", bloque: 5, materia: "Aplicaciones Web", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Jueves", bloque: 6, materia: "Aplicaciones Web", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12", proyector: "M12" },
  { carrera: "DSM", turno: "Vespertino", grupo: "6C", dia: "Jueves", bloque: 7, materia: "Aplicaciones Web", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M12", proyector: "M12" },
  // ═══════════════════════════════════════════════════════════════════════════
  // IDGS - TURNO VESPERTINO (Basado en PDF: 2026B IDGS Distribución.pdf)
  // ═══════════════════════════════════════════════════════════════════════════

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 7A (IDGS)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES

  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Lunes", bloque: 2, materia: "Seguridad informática", profesor: "Jesús Simental Pacheco", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Lunes", bloque: 3, materia: "Seguridad informática", profesor: "Jesús Simental Pacheco", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Lunes", bloque: 4, materia: "Arquitecturas de software", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Lunes", bloque: 5, materia: "Arquitecturas de software", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Lunes", bloque: 6, materia: "Metodologías para el desarrollo de proyectos", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Lunes", bloque: 7, materia: "Metodologías para el desarrollo de proyectos", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },

  // MARTES
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 2, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 3, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 4, materia: "Experiencia de usuario", profesor: "Rubén González Ruiz", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 5, materia: "Experiencia de usuario", profesor: "Rubén González Ruiz", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 6, materia: "Arquitecturas de software", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 7, materia: "Arquitecturas de software", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M13" },

  // MIÉRCOLES
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 2, materia: "Tutoría", profesor: "Iliana López Guillen", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 3, materia: "Metodologías para el desarrollo de proyectos", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 4, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M10" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 5, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M10" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 6, materia: "Experiencia de usuario", profesor: "Rubén González Ruiz", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 7, materia: "Seguridad informática", profesor: "Jesús Simental Pacheco", salon: "Laboratorio M13" },

  // JUEVES
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 2, materia: "Administración del Tiempo", profesor: "Olivia Hernández Arce", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 3, materia: "Arquitecturas de software", profesor: "Victor Hugo Ramírez Salazar", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 4, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M10" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 5, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula M10" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 6, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 7, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula 501" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 7B (IDGS)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  // (Sin clases asignadas el lunes según la imagen)

  // MARTES
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Martes", bloque: 2, materia: "Arquitecturas de software", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Martes", bloque: 3, materia: "Arquitecturas de software", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Martes", bloque: 4, materia: "Metodologías para el desarrollo de proyectos", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Martes", bloque: 5, materia: "Metodologías para el desarrollo de proyectos", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Martes", bloque: 6, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Martes", bloque: 7, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula 502" },

  // MIÉRCOLES
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Miércoles", bloque: 2, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Miércoles", bloque: 3, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Miércoles", bloque: 4, materia: "Tutoría", profesor: "Marcia Josefina Barajas Solorzano", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Miércoles", bloque: 5, materia: "Seguridad informática", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Miércoles", bloque: 6, materia: "Seguridad informática", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Miércoles", bloque: 7, materia: "Metodologías para el desarrollo de proyectos", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },

  // JUEVES
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Jueves", bloque: 2, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Jueves", bloque: 3, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Jueves", bloque: 4, materia: "Experiencia de usuario", profesor: "Rubén González Ruiz", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Jueves", bloque: 5, materia: "Experiencia de usuario", profesor: "Rubén González Ruiz", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Jueves", bloque: 6, materia: "Experiencia de usuario", profesor: "Rubén González Ruiz", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Jueves", bloque: 7, materia: "Administración del Tiempo", profesor: "Lorena del Rocio Santoyo Palafox", salon: "Aula 502" },

  // VIERNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Viernes", bloque: 2, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Viernes", bloque: 3, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Viernes", bloque: 4, materia: "Arquitecturas de software", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Viernes", bloque: 5, materia: "Arquitecturas de software", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Viernes", bloque: 6, materia: "Arquitecturas de software", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "7B", dia: "Viernes", bloque: 7, materia: "Seguridad informática", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio M14" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 8A (IDGS)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Lunes", bloque: 4, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Jesús Simental Pacheco", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Lunes", bloque: 5, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Jesús Simental Pacheco", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Lunes", bloque: 6, materia: "Desarrollo web profesional", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Lunes", bloque: 7, materia: "Desarrollo web profesional", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M14" },

  // MARTES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Martes", bloque: 2, materia: "Inglés VII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Martes", bloque: 3, materia: "Inglés VII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Martes", bloque: 4, materia: "Matemáticas para Ingeniería II", profesor: "Juan Carlos Morales Aragón", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Martes", bloque: 5, materia: "Matemáticas para Ingeniería II", profesor: "Juan Carlos Morales Aragón", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Martes", bloque: 6, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Martes", bloque: 7, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio M14" },

  // MIÉRCOLES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 2, materia: "Desarrollo web profesional", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 3, materia: "Desarrollo web profesional", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 4, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio M02" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Miércoles", bloque: 5, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio M02" },

  // JUEVES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Jueves", bloque: 2, materia: "Tutoría", profesor: "Victor Hugo Ramírez Salazar", salon: "Aula M10" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Jueves", bloque: 3, materia: "Planeación y organización del trabajo", profesor: "Lorena del Rocio Santoyo Palafox", salon: "Aula M10" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Jueves", bloque: 4, materia: "Inglés VII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Jueves", bloque: 5, materia: "Inglés VII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Jueves", bloque: 6, materia: "Matemáticas para Ingeniería II", profesor: "Juan Carlos Morales Aragón", salon: "Aula M10" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Jueves", bloque: 7, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio M14" },

  // VIERNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Viernes", bloque: 2, materia: "Matemáticas para Ingeniería II", profesor: "Juan Carlos Morales Aragón", salon: "Aula 504" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Viernes", bloque: 3, materia: "Matemáticas para Ingeniería II", profesor: "Juan Carlos Morales Aragón", salon: "Aula 504" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Viernes", bloque: 4, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Jesús Simental Pacheco", salon: "Laboratorio 503" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8A", diaVirtual: "Viernes", dia: "Viernes", bloque: 5, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Jesús Simental Pacheco", salon: "Laboratorio 503" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 8B (IDGS)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Lunes", bloque: 2, materia: "Matemáticas para Ingeniería II", profesor: "Jorge Rodríguez Gallegos", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Lunes", bloque: 3, materia: "Inglés VII", profesor: "José Antonio Ayllón Ríos", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Lunes", bloque: 4, materia: "Inglés VII", profesor: "José Antonio Ayllón Ríos", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Lunes", bloque: 5, materia: "Planeación y organización del trabajo", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Lunes", bloque: 6, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio M05" },

  // MARTES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Martes", bloque: 2, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Martes", bloque: 3, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Martes", bloque: 4, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Martes", bloque: 5, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio 506" },

  // MIÉRCOLES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Miércoles", bloque: 2, materia: "Desarrollo web profesional", profesor: "Jesús Simental Pacheco", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Miércoles", bloque: 3, materia: "Desarrollo web profesional", profesor: "Jesús Simental Pacheco", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Miércoles", bloque: 4, materia: "Matemáticas para Ingeniería II", profesor: "Jorge Rodríguez Gallegos", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Miércoles", bloque: 5, materia: "Matemáticas para Ingeniería II", profesor: "Jorge Rodríguez Gallegos", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Miércoles", bloque: 6, materia: "Inglés VII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Miércoles", bloque: 7, materia: "Inglés VII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 502" },

  // JUEVES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Jueves", bloque: 2, materia: "Matemáticas para Ingeniería II", profesor: "Jorge Rodríguez Gallegos", salon: "Aula 504" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Jueves", bloque: 3, materia: "Matemáticas para Ingeniería II", profesor: "Jorge Rodríguez Gallegos", salon: "Aula 504" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Jueves", bloque: 4, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Jueves", bloque: 5, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio 506" },

  // VIERNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Viernes", bloque: 2, materia: "Desarrollo web profesional", profesor: "Jesús Simental Pacheco", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Viernes", bloque: 3, materia: "Desarrollo web profesional", profesor: "Jesús Simental Pacheco", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Viernes", bloque: 4, materia: "Tutoría", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Viernes", bloque: 5, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8B", diaVirtual: "Martes", dia: "Viernes", bloque: 6, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio M05" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 8C (IDGS)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Lunes", bloque: 2, materia: "Planeación y organización del trabajo", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Lunes", bloque: 3, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio 503" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Lunes", bloque: 4, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio 503" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Lunes", bloque: 5, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio 503" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Lunes", bloque: 6, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Jesús Simental Pacheco", salon: "Laboratorio 503" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Lunes", bloque: 7, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Jesús Simental Pacheco", salon: "Laboratorio 503" },

  // MARTES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Martes", bloque: 4, materia: "Inglés VII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Martes", bloque: 5, materia: "Inglés VII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Martes", bloque: 6, materia: "Matemáticas para Ingeniería II", profesor: "Juan Carlos Morales Aragón", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Martes", bloque: 7, materia: "Matemáticas para Ingeniería II", profesor: "Juan Carlos Morales Aragón", salon: "Aula M08" },

  // MIÉRCOLES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Miércoles", bloque: 2, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio 503" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Miércoles", bloque: 3, materia: "Administración de Base de datos", profesor: "Pedro González Echeverría", salon: "Laboratorio 503" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Miércoles", bloque: 4, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Jesús Simental Pacheco", salon: "Laboratorio 503" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Miércoles", bloque: 5, materia: "Seguridad en el desarrollo de aplicaciones", profesor: "Jesús Simental Pacheco", salon: "Laboratorio 503" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Miércoles", bloque: 6, materia: "Tutoría", profesor: "Ricardo Ortiz Ponce", salon: "Aula M10" },

  // JUEVES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Jueves", bloque: 2, materia: "Matemáticas para Ingeniería II", profesor: "Juan Carlos Morales Aragón", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Jueves", bloque: 3, materia: "Matemáticas para Ingeniería II", profesor: "Juan Carlos Morales Aragón", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Jueves", bloque: 6, materia: "Desarrollo web profesional", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Jueves", bloque: 7, materia: "Desarrollo web profesional", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },

  // VIERNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Viernes", bloque: 2, materia: "Desarrollo web profesional", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Viernes", bloque: 3, materia: "Desarrollo web profesional", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "8C", diaVirtual: "Jueves", dia: "Viernes", bloque: 5, materia: "Matemáticas para Ingeniería II", profesor: "Juan Carlos Morales Aragón", salon: "Aula 502" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 9A (IDGS)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Lunes", bloque: 2, materia: "Inglés VIII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Lunes", bloque: 3, materia: "Inglés VIII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Lunes", bloque: 4, materia: "Administración de proyectos de TI", profesor: "Saúl Gutiérrez Garibay", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Lunes", bloque: 5, materia: "Administración de proyectos de TI", profesor: "Saúl Gutiérrez Garibay", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Lunes", bloque: 6, materia: "Desarrollo para dispositivos inteligentes", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M02" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Lunes", bloque: 7, materia: "Desarrollo para dispositivos inteligentes", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M02" },

  // MARTES
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Martes", bloque: 3, materia: "Desarrollo para dispositivos inteligentes", profesor: "Luis Manuel López Hernández", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Martes", bloque: 4, materia: "Extracción de conocimiento en bases de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Martes", bloque: 6, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio 503" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Martes", bloque: 7, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio 503" },

  // MIÉRCOLES
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Miércoles", bloque: 2, materia: "Inglés VIII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Miércoles", bloque: 3, materia: "Inglés VIII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Miércoles", bloque: 4, materia: "Tutoría", profesor: "Felipe Belmont Polanco", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Miércoles", bloque: 5, materia: "Dirección de Equipos de Alto Rendimiento", profesor: "Edgar Ulises Toledo Nares", salon: "Aula 505", proyector: "505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Miércoles", bloque: 6, materia: "Administración de proyectos de TI", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },

  // JUEVES
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Jueves", bloque: 2, materia: "Desarrollo para dispositivos inteligentes", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Jueves", bloque: 3, materia: "Desarrollo para dispositivos inteligentes", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Jueves", bloque: 4, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M02" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Jueves", bloque: 5, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M02" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Jueves", bloque: 6, materia: "Extracción de conocimiento en bases de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M05", proyector: "M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Jueves", bloque: 7, materia: "Extracción de conocimiento en bases de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M05", proyector: "M05" },

  // VIERNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Viernes", bloque: 2, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M02" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Viernes", bloque: 3, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M02" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Viernes", bloque: 4, materia: "Extracción de conocimiento en bases de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M13", proyector: "M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9A", diaVirtual: "Martes", dia: "Viernes", bloque: 5, materia: "Extracción de conocimiento en bases de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M13", proyector: "M13" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 9B (IDGS)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 2, materia: "Dirección de Equipos de Alto Rendimiento", profesor: "Jesus Osvaldo Cortés Guerra", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 3, materia: "Administración de proyectos de TI", profesor: "Saúl Gutiérrez Garibay", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 4, materia: "Desarrollo para dispositivos inteligentes", profesor: "Luis Manuel López Hernández", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 5, materia: "Desarrollo para dispositivos inteligentes", profesor: "Luis Manuel López Hernández", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 6, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Lunes", bloque: 7, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio 506" },

  // MARTES
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Martes", bloque: 2, materia: "Extracción de conocimiento en bases de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M14", proyector: "M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Martes", bloque: 3, materia: "Extracción de conocimiento en bases de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M14", proyector: "M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Martes", bloque: 4, materia: "Inglés VIII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Martes", bloque: 5, materia: "Inglés VIII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 501" },

  // MIÉRCOLES
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 2, materia: "Desarrollo para dispositivos inteligentes", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M02" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 3, materia: "Desarrollo para dispositivos inteligentes", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M02" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 4, materia: "Administración de proyectos de TI", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 5, materia: "Administración de proyectos de TI", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },

  // JUEVES
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 2, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 3, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 4, materia: "Extracción de conocimiento en bases de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M05", proyector: "M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 5, materia: "Extracción de conocimiento en bases de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio M05", proyector: "M05" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 6, materia: "Inglés VIII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Jueves", bloque: 7, materia: "Inglés VIII", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula M08" },

  // VIERNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Viernes", bloque: 2, materia: "Extracción de conocimiento en bases de datos", profesor: "Adolfo Yakov Castañeda Navarrete", salon: "Laboratorio 506", proyector: "506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Viernes", bloque: 3, materia: "Tutoría", profesor: "José Antonio Ayllón Ríos", salon: "Aula M08" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Viernes", bloque: 4, materia: "Desarrollo para dispositivos inteligentes", profesor: "Luis Manuel López Hernández", salon: "Laboratorio M02" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Viernes", bloque: 5, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M02" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "9B", diaVirtual: "Miércoles", dia: "Viernes", bloque: 6, materia: "Desarrollo web integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M02" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 10A (IDGS)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Lunes", bloque: 2, materia: "Negociación Empresarial", profesor: "Jaime Antonio Cerda Soto", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Lunes", bloque: 3, materia: "Desarrollo móvil integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Lunes", bloque: 4, materia: "Desarrollo móvil integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Lunes", bloque: 5, materia: "Tutoría", profesor: "Roberto Cazares Gomez", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Lunes", bloque: 6, materia: "Inglés IX", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Lunes", bloque: 7, materia: "Inglés IX", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 501" },

  // MARTES
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Martes", bloque: 4, materia: "Integradora", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Martes", bloque: 5, materia: "Integradora", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M14" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Martes", bloque: 6, materia: "Optativa 1: Creación de videojuegos", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Martes", bloque: 7, materia: "Optativa 1: Creación de videojuegos", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },

  // MIÉRCOLES
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 2, materia: "Desarrollo móvil integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 3, materia: "Desarrollo móvil integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 4, materia: "Gestión del proceso de desarrollo de software", profesor: "Iliana López Guillen", salon: "Aula 501", proyector: "501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 5, materia: "Gestión del proceso de desarrollo de software", profesor: "Iliana López Guillen", salon: "Aula 501", proyector: "501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 6, materia: "Inglés IX", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 501" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 7, materia: "Inglés IX", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 501" },

  // JUEVES
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Jueves", bloque: 4, materia: "Aplicaciones Web progresivas", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Jueves", bloque: 5, materia: "Aplicaciones Web progresivas", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Jueves", bloque: 6, materia: "Desarrollo móvil integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M13" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Jueves", bloque: 7, materia: "Desarrollo móvil integral", profesor: "Felipe Belmont Polanco", salon: "Laboratorio M13" },

  // VIERNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Viernes", bloque: 2, materia: "Optativa 1: Creación de videojuegos", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Viernes", bloque: 3, materia: "Optativa 1: Creación de videojuegos", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Viernes", bloque: 5, materia: "Gestión del proceso de desarrollo de software", profesor: "Iliana López Guillen", salon: "Aula 504", proyector: "504" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Viernes", bloque: 6, materia: "Gestión del proceso de desarrollo de software", profesor: "Iliana López Guillen", salon: "Aula 504", proyector: "504" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Viernes", bloque: 7, materia: "Aplicaciones Web progresivas", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio 506" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 10B (IDGS)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Lunes", bloque: 2, materia: "Optativa 1: Creación de videojuegos", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Lunes", bloque: 3, materia: "Optativa 1: Creación de videojuegos", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Lunes", bloque: 4, materia: "Inglés IX", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Lunes", bloque: 5, materia: "Inglés IX", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Lunes", bloque: 6, materia: "Gestión del proceso de desarrollo de software", profesor: "Iliana López Guillen", salon: "Aula 502", proyector: "502" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Lunes", bloque: 7, materia: "Gestión del proceso de desarrollo de software", profesor: "Iliana López Guillen", salon: "Aula 502", proyector: "502" },

  // MARTES
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Martes", bloque: 3, materia: "Tutoría", profesor: "Rubén González Ruiz", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Martes", bloque: 4, materia: "Optativa 1: Creación de videojuegos", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Martes", bloque: 5, materia: "Optativa 1: Creación de videojuegos", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Martes", bloque: 6, materia: "Desarrollo móvil integral", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Martes", bloque: 7, materia: "Desarrollo móvil integral", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio 506" },

  // MIÉRCOLES
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 3, materia: "Desarrollo móvil integral", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 4, materia: "Desarrollo móvil integral", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 5, materia: "Aplicaciones Web progresivas", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 6, materia: "Aplicaciones Web progresivas", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Miércoles", bloque: 7, materia: "Aplicaciones Web progresivas", profesor: "Victor Hugo Ramírez Salazar", salon: "Laboratorio 506" },

  // JUEVES
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Jueves", bloque: 2, materia: "Inglés IX", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Jueves", bloque: 3, materia: "Inglés IX", profesor: "Marcia Josefina Barajas Solorzano", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Jueves", bloque: 4, materia: "Negociación Empresarial", profesor: "Lorena del Rocio Santoyo Palafox", salon: "Aula 505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Jueves", bloque: 5, materia: "Gestión del proceso de desarrollo de software", profesor: "Iliana López Guillen", salon: "Aula 505", proyector: "505" },

  // VIERNES
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Viernes", bloque: 2, materia: "Gestión del proceso de desarrollo de software", profesor: "Iliana López Guillen", salon: "Aula 505", proyector: "505" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Viernes", bloque: 3, materia: "Desarrollo móvil integral", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Viernes", bloque: 4, materia: "Desarrollo móvil integral", profesor: "Edgar Miguel Baños Enríquez", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Viernes", bloque: 5, materia: "Integradora", profesor: "Lorena del Rocio Santoyo Palafox", salon: "Laboratorio 506" },
  { carrera: "IDGS", turno: "Vespertino", grupo: "10B", diaVirtual: "Jueves", dia: "Viernes", bloque: 6, materia: "Integradora", profesor: "Lorena del Rocio Santoyo Palafox", salon: "Laboratorio 506" },

  // ═══════════════════════════════════════════════════════════════════════════
  // IEVND - TURNO VESPERTINO
  // ═══════════════════════════════════════════════════════════════════════════

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 7A (IEVND)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  // (Sin clases asignadas el lunes)

  // MARTES
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 2, materia: "Programación de videojuegos I", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 3, materia: "Programación de videojuegos I", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 4, materia: "Animación digital avanzada", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio 503" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 5, materia: "Animación digital avanzada", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio 503" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 6, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Martes", bloque: 7, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula 502" },

  // MIÉRCOLES
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 2, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 3, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 4, materia: "Programación de videojuegos I", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 5, materia: "Programación de videojuegos I", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 6, materia: "Animación digital avanzada", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Miércoles", bloque: 7, materia: "Producción de efectos visuales", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },

  // JUEVES
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 2, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 3, materia: "Matemáticas para Ingeniería I", profesor: "Edgar Ulises Toledo Nares", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 4, materia: "Tutoría", profesor: "Iliana López Guillen", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 5, materia: "Animación digital avanzada", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio 503" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 6, materia: "Animación digital avanzada", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio 503" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Jueves", bloque: 7, materia: "Administración del Tiempo", profesor: "Lorena del Rocio Santoyo Palafox", salon: "Aula 502" },

  // VIERNES
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Viernes", bloque: 2, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Viernes", bloque: 3, materia: "Inglés VI", profesor: "Silvia Ruth Magaña Valdes", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Viernes", bloque: 4, materia: "Programación de videojuegos I", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Viernes", bloque: 5, materia: "Programación de videojuegos I", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Viernes", bloque: 6, materia: "Producción de efectos visuales", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "7A", dia: "Viernes", bloque: 7, materia: "Producción de efectos visuales", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 8A (IEVND)
  // ──────────────────────────────────────────────────────────────────────────

  // LUNES
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Lunes", bloque: 2, materia: "Planeación y organización del trabajo", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Lunes", bloque: 4, materia: "Programación de videojuegos II", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Lunes", bloque: 5, materia: "Programación de videojuegos II", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Lunes", bloque: 6, materia: "Base de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Lunes", bloque: 7, materia: "Base de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio 109" },

  // MARTES
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Martes", bloque: 2, materia: "Programación para entornos virtuales", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio 503" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Martes", bloque: 3, materia: "Programación para entornos virtuales", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio 503" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Martes", bloque: 4, materia: "Inglés VII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Martes", bloque: 5, materia: "Inglés VII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Martes", bloque: 6, materia: "Emprendimiento digital", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Martes", bloque: 7, materia: "Emprendimiento digital", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },

  // MIÉRCOLES
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 2, materia: "Emprendimiento digital", profesor: "Saúl Gutiérrez Garibay", salon: "Aula M07" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 3, materia: "Programación de videojuegos II", profesor: "Ricardo Ortiz Ponce", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 4, materia: "Base de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio M13" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 5, materia: "Base de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio M13" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Miércoles", bloque: 6, materia: "Tutoría", profesor: "Felipe Belmont Polanco", salon: "Aula 110" },

  // JUEVES
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Jueves", bloque: 2, materia: "Programación para entornos virtuales", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio 503" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Jueves", bloque: 3, materia: "Programación para entornos virtuales", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio 503" },

  // VIERNES
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Viernes", bloque: 2, materia: "Programación para entornos virtuales", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio M12" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Viernes", bloque: 3, materia: "Programación para entornos virtuales", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio M12" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Viernes", bloque: 4, materia: "Base de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio M12" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Viernes", bloque: 5, materia: "Base de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio M12" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Viernes", bloque: 6, materia: "Inglés VII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 502" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "8A", diaVirtual: "Jueves", dia: "Viernes", bloque: 7, materia: "Inglés VII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 502" },

  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 9A (IEVND)
  // ──────────────────────────────────────────────────────────────────────────

  // LUNES
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 2, materia: "Dirección de Equipos de Alto Rendimiento", profesor: "Ana Eugenia Romo González", salon: "Aula 110" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 4, materia: "Analítica de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio M11" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 5, materia: "Analítica de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio M11" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 6, materia: "Gestión de proyectos I", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula 110" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Lunes", bloque: 7, materia: "Gestión de proyectos I", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula 110" },

  // MARTES
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Martes", bloque: 2, materia: "Matemáticas para Ingeniería II", profesor: "Candelario Castañeda Castañeda", salon: "Aula 110" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Martes", bloque: 3, materia: "Matemáticas para Ingeniería II", profesor: "Candelario Castañeda Castañeda", salon: "Aula 110" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Martes", bloque: 4, materia: "Matemáticas para Ingeniería II", profesor: "Candelario Castañeda Castañeda", salon: "Aula 110" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Martes", bloque: 6, materia: "Inglés VIII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 505" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Martes", bloque: 7, materia: "Inglés VIII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 505" },

  // MIÉRCOLES
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 2, materia: "Analítica de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 3, materia: "Analítica de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 4, materia: "Gestión de proyectos I", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula 110" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Miércoles", bloque: 5, materia: "Gestión de proyectos I", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula 110" },

  // JUEVES
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 2, materia: "Ciberseguridad aplicada a los negocios", profesor: "Rubén González Ruiz", salon: "Laboratorio M02" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 3, materia: "Ciberseguridad aplicada a los negocios", profesor: "Rubén González Ruiz", salon: "Laboratorio M02" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 4, materia: "Matemáticas para Ingeniería II", profesor: "Candelario Castañeda Castañeda", salon: "Aula 110" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 5, materia: "Matemáticas para Ingeniería II", profesor: "Candelario Castañeda Castañeda", salon: "Aula 110" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 6, materia: "Inglés VIII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 110" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Jueves", bloque: 7, materia: "Inglés VIII", profesor: "José Antonio Ayllón Ríos", salon: "Aula 110" },

  // VIERNES
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 2, materia: "Analítica de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio 503" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 3, materia: "Analítica de datos para negocios digitales", profesor: "Rubén González Ruiz", salon: "Laboratorio 503" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 4, materia: "Tutoría", profesor: "Felipe Belmont Polanco", salon: "Aula M10" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 6, materia: "Ciberseguridad aplicada a los negocios", profesor: "Rubén González Ruiz", salon: "Laboratorio M12" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "9A", diaVirtual: "Miércoles", dia: "Viernes", bloque: 7, materia: "Ciberseguridad aplicada a los negocios", profesor: "Rubén González Ruiz", salon: "Laboratorio M12" },


  // ──────────────────────────────────────────────────────────────────────────
  // Grupo: 10A (IEVND)
  // ──────────────────────────────────────────────────────────────────────────
  // LUNES
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Lunes", bloque: 2, materia: "Inglés IX", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M10" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Lunes", bloque: 3, materia: "Inglés IX", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Aula M10" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Lunes", bloque: 4, materia: "Integradora", profesor: "Iliana López Guillen", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Lunes", bloque: 5, materia: "Integradora", profesor: "Iliana López Guillen", salon: "Laboratorio PB07", proyector: "PB07", abrir: true },

  // MARTES
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Martes", bloque: 2, materia: "Inglés IX", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Laboratorio M13" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Martes", bloque: 3, materia: "Inglés IX", profesor: "Mario Oscar Rodríguez Rodríguez", salon: "Laboratorio M13" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Martes", bloque: 4, materia: "Inteligencia de negocios", profesor: "Pedro González Echeverría", salon: "Laboratorio M05" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Martes", bloque: 5, materia: "Inteligencia de negocios", profesor: "Pedro González Echeverría", salon: "Laboratorio M05" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Martes", bloque: 6, materia: "Programación de aplicaciones web progresivas", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio M05" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Martes", bloque: 7, materia: "Programación de aplicaciones web progresivas", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio M05" },

  // MIÉRCOLES
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 2, materia: "Tutoría", profesor: "Brandon Javier Devora Lucio", salon: "Aula 505" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 3, materia: "Negociación Empresarial", profesor: "Fernando Rafael Villaseñor Ulloa", salon: "Aula 505" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 4, materia: "Programación de aplicaciones web progresivas", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio M05" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 5, materia: "Programación de aplicaciones web progresivas", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio M05" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 6, materia: "Inteligencia de negocios", profesor: "Pedro González Echeverría", salon: "Laboratorio M05" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Miércoles", bloque: 7, materia: "Inteligencia de negocios", profesor: "Pedro González Echeverría", salon: "Laboratorio M05" },

  // JUEVES
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Jueves", bloque: 2, materia: "Inteligencia de negocios", profesor: "Pedro González Echeverría", salon: "Laboratorio M14" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Jueves", bloque: 3, materia: "Inteligencia de negocios", profesor: "Pedro González Echeverría", salon: "Laboratorio M14" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Jueves", bloque: 4, materia: "Programación de aplicaciones web progresivas", profesor: "Brandon Javier Devora Lucio", salon: "Laboratorio M05" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Jueves", bloque: 5, materia: "Gestión de proyectos II", profesor: "Lorena del Rocio Santoyo Palafox", salon: "Laboratorio 109" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Jueves", bloque: 6, materia: "Gestión de proyectos II", profesor: "Lorena del Rocio Santoyo Palafox", salon: "Laboratorio 109" },

  // VIERNES
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Viernes", bloque: 2, materia: "Gestión de proyectos II", profesor: "Lorena del Rocio Santoyo Palafox", salon: "Aula M07" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Viernes", bloque: 3, materia: "Gestión de proyectos II", profesor: "Lorena del Rocio Santoyo Palafox", salon: "Aula M07" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Viernes", bloque: 4, materia: "Programación de aplicaciones web progresivas", profesor: "Brandon Javier Devora Lucio", salon: "Aula M07" },
  { carrera: "IEVND", turno: "Vespertino", grupo: "10A", diaVirtual: "Martes", dia: "Viernes", bloque: 5, materia: "Programación de aplicaciones web progresivas", profesor: "Brandon Javier Devora Lucio", salon: "Aula M07" },
];