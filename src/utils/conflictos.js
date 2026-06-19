export function detectarConflictos(clases) {
  const conflictos = []

  // Conflicto tipo A: mismo salon, mismo dia, mismo bloque, mismo turno
  // Si el profesor y materia son iguales, es grupo combinado (no es conflicto)
  const salonBloque = {}
  clases.forEach((c, i) => {
    if (!c.salon || !c.dia || !c.bloque) return
    const key = `${c.salon}|${c.dia}|${c.bloque}|${c.turno}`
    if (!salonBloque[key]) salonBloque[key] = []
    salonBloque[key].push({ idx: i, ...c })
  })
  Object.values(salonBloque).forEach(grupo => {
    if (grupo.length > 1) {
      const materiasUnicas = [...new Set(grupo.map(c => c.materia))]
      const profesoresUnicos = [...new Set(grupo.map(c => c.profesor))]
      if (!(materiasUnicas.length === 1 && profesoresUnicos.length === 1)) {
        conflictos.push({
          tipo: 'salon_ocupado',
          gravedad: 'alta',
          mensaje: `El salon ${grupo[0].salon} tiene ${grupo.length} clases asignadas el ${grupo[0].dia} en bloque ${grupo[0].bloque} (${grupo[0].turno})`,
          clases: grupo.map(c => ({
            materia: c.materia,
            profesor: c.profesor,
            grupo: c.grupo,
            carrera: c.carrera,
            turno: c.turno,
          })),
        })
      }
    }
  })

  // Conflicto tipo B: mismo grupo-carrera, mismo dia, mismo bloque, distinto salon
  const grupoBloque = {}
  clases.forEach((c, i) => {
    if (!c.grupo || !c.carrera || !c.dia || !c.bloque) return
    const key = `${c.carrera}|${c.grupo}|${c.dia}|${c.bloque}|${c.turno}`
    if (!grupoBloque[key]) grupoBloque[key] = []
    grupoBloque[key].push({ idx: i, salon: c.salon, materia: c.materia, profesor: c.profesor, turno: c.turno })
  })
  Object.values(grupoBloque).forEach(grupo => {
    const salonesUnicos = [...new Set(grupo.map(c => c.salon))]
    if (salonesUnicos.length > 1) {
      conflictos.push({
        tipo: 'grupo_duplicado',
        gravedad: 'alta',
        mensaje: `El grupo ${grupo[0].carrera} ${grupo[0].grupo} tiene ${grupo.length} clases en diferentes salones el mismo dia y bloque`,
        clases: grupo.map(c => ({
          materia: c.materia,
          profesor: c.profesor,
          salon: c.salon,
          turno: c.turno,
        })),
      })
    }
  })

  // Conflicto tipo C: mismo profesor, mismo dia, mismo bloque, distinto salon
  // pero SOLO si son materias diferentes (misma materia = grupo combinado, no es conflicto)
  const profesorBloque = {}
  clases.forEach((c, i) => {
    if (!c.profesor || !c.dia || !c.bloque) return
    const key = `${c.profesor}|${c.dia}|${c.bloque}|${c.turno}`
    if (!profesorBloque[key]) profesorBloque[key] = []
    profesorBloque[key].push({ idx: i, salon: c.salon, materia: c.materia, grupo: c.grupo, carrera: c.carrera, turno: c.turno })
  })
  Object.values(profesorBloque).forEach(grupo => {
    const materiasUnicas = [...new Set(grupo.map(c => c.materia))]
    const salonesUnicos = [...new Set(grupo.map(c => c.salon))]
    if (salonesUnicos.length > 1 && materiasUnicas.length > 1) {
      conflictos.push({
        tipo: 'profesor_duplicado',
        gravedad: 'media',
        mensaje: `El profesor ${grupo[0].profesor} tiene ${grupo.length} clases de distintas materias al mismo tiempo en diferentes salones`,
        clases: grupo.map(c => ({
          materia: c.materia,
          salon: c.salon,
          grupo: c.grupo,
          carrera: c.carrera,
          turno: c.turno,
        })),
      })
    }
  })

  return conflictos
}
