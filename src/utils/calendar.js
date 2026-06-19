// ─────────────────────────────────────────────
// Utilidad de exportación a calendario (.ics)
// ─────────────────────────────────────────────

// Festivos nacionales y periodos vacacionales (actualizar cada año)
const FESTIVOS = {
  2026: [
    // Semana Santa 2026: 30 mar - 3 abr
    new Date(2026, 2, 30), new Date(2026, 2, 31),
    new Date(2026, 3, 1), new Date(2026, 3, 2), new Date(2026, 3, 3),
    // Pascua 2026: 6 - 10 abr
    new Date(2026, 3, 6), new Date(2026, 3, 7), new Date(2026, 3, 8),
    new Date(2026, 3, 9), new Date(2026, 3, 10),
    // 1 de mayo (Día del Trabajo)
    new Date(2026, 4, 1),
    // 5 de mayo
    new Date(2026, 4, 5),
    // Vacaciones diciembre 2026 - enero 2027
    new Date(2026, 11, 21), new Date(2026, 11, 22), new Date(2026, 11, 23),
    new Date(2026, 11, 24), new Date(2026, 11, 25), new Date(2026, 11, 28),
    new Date(2026, 11, 29), new Date(2026, 11, 30), new Date(2026, 11, 31),
    new Date(2027, 0, 1),
  ],
  2027: []
}

function esFestivo(fecha) {
  const y = fecha.getFullYear()
  const festivos = FESTIVOS[y] || []
  const m = fecha.getMonth()
  const d = fecha.getDate()
  return festivos.some(f => f.getMonth() === m && f.getDate() === d)
}

function primerLunesDelMes(year, month) {
  const d = new Date(year, month, 1)
  const diff = d.getDay() === 0 ? 1 : (8 - d.getDay()) % 7
  d.setDate(d.getDate() + diff + (diff === 0 ? 0 : 0))
  return d
}

function sumarDias(fecha, dias) {
  const r = new Date(fecha)
  r.setDate(r.getDate() + dias)
  return r
}

function ultimoViernesDelMes(year, month) {
  const d = new Date(year, month + 1, 0)
  while (d.getDay() !== 5) d.setDate(d.getDate() - 1)
  return d
}

export function detectarCuatrimestre() {
  const hoy = new Date()
  const m = hoy.getMonth()

  if (m >= 0 && m <= 3) {
    const inicio = sumarDias(primerLunesDelMes(hoy.getFullYear(), 0), 7)
    const fin = ultimoViernesDelMes(hoy.getFullYear(), 3)
    return { nombre: 'A', inicio, fin, label: 'Enero - Abril ' + hoy.getFullYear() }
  } else if (m >= 4 && m <= 7) {
    const inicio = primerLunesDelMes(hoy.getFullYear(), 4)
    const fin = new Date(hoy.getFullYear(), 7, 28)
    return { nombre: 'B', inicio, fin, label: 'Mayo - Agosto ' + hoy.getFullYear() }
  } else {
    const inicio = primerLunesDelMes(hoy.getFullYear(), 8)
    const fin = ultimoViernesDelMes(hoy.getFullYear(), 11)
    fin.setDate(fin.getDate() - 7)
    return { nombre: 'C', inicio, fin, label: 'Septiembre - Diciembre ' + hoy.getFullYear() }
  }
}

const DIAS_MAP = { Lunes: 'MO', Martes: 'TU', Miércoles: 'WE', Miercoles: 'WE', Jueves: 'TH', Viernes: 'FR' }
const DIAS_INDICE = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const BLOQUES_HORARIOS = {
  Matutino: {
    1: { inicio: '07:00', fin: '07:50' }, 2: { inicio: '07:50', fin: '08:40' },
    3: { inicio: '09:10', fin: '10:00' }, 4: { inicio: '10:00', fin: '10:50' },
    5: { inicio: '10:50', fin: '11:40' }, 6: { inicio: '11:40', fin: '12:30' },
    7: { inicio: '12:30', fin: '13:20' }, 8: { inicio: '13:20', fin: '14:10' },
  },
  Vespertino: {
    1: { inicio: '15:30', fin: '16:20' }, 2: { inicio: '16:20', fin: '17:10' },
    3: { inicio: '17:10', fin: '18:00' }, 4: { inicio: '18:00', fin: '18:50' },
    5: { inicio: '18:50', fin: '19:40' }, 6: { inicio: '19:40', fin: '20:30' },
    7: { inicio: '20:30', fin: '21:20' },
  },
}

function formatearFechaICS(fecha) {
  return fecha.getFullYear() +
    String(fecha.getMonth() + 1).padStart(2, '0') +
    String(fecha.getDate()).padStart(2, '0') + 'T' +
    String(fecha.getHours()).padStart(2, '0') +
    String(fecha.getMinutes()).padStart(2, '0') + '00'
}

function quitarAcentos(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function escaparICS(texto) {
  return quitarAcentos(texto || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export function generarICS(clases, titulo, cuatri) {
  const c = cuatri || detectarCuatrimestre()
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Horarios CCD//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:' + escaparICS(titulo || 'Horarios CCD - Cuatrimestre ' + c.nombre),
    'X-WR-TIMEZONE:America/Mexico_City',
  ]

  let uidCount = 0

  clases.forEach(clase => {
    if (!clase.dia || !clase.bloque) return
    const diaIdx = DIAS_INDICE.indexOf(clase.dia)
    if (diaIdx === -1) return

    const bloques = BLOQUES_HORARIOS[clase.turno] || BLOQUES_HORARIOS.Matutino
    const bloque = bloques[clase.bloque]
    if (!bloque) return

    const [hInicio, mInicio] = bloque.inicio.split(':').map(Number)
    const [hFin, mFin] = bloque.fin.split(':').map(Number)

    const materia = clase.materia || 'Sin materia'
    const profesor = clase.profesor ? 'Prof. ' + clase.profesor : ''
    const salon = clase.salon || ''
    const grupo = [clase.carrera, clase.grupo].filter(Boolean).join(' ')
    const descripcion = [materia, profesor, grupo].filter(Boolean).join('\\n')
    uidCount++

    // Generar un evento por cada semana del cuatrimestre, saltando festivos
    const inicioCuatri = new Date(c.inicio)
    const finCuatri = new Date(c.fin)

    // Encontrar la primera ocurrencia de este día después del inicio del cuatri
    let primeraSemana = new Date(inicioCuatri)
    while (primeraSemana.getDay() !== diaIdx + 1) {
      primeraSemana.setDate(primeraSemana.getDate() + 1)
    }

    // Iterar por semanas
    let fechaClase = new Date(primeraSemana)
    while (fechaClase <= finCuatri) {
      if (!esFestivo(fechaClase)) {
        const inicio = new Date(fechaClase)
        inicio.setHours(hInicio, mInicio, 0, 0)
        const fin = new Date(fechaClase)
        fin.setHours(hFin, mFin, 0, 0)

        lineas.push(
          'BEGIN:VEVENT',
          'UID:' + uidCount + '-' + formatearFechaICS(fechaClase) + '@horarios-ccd',
          'DTSTAMP:' + formatearFechaICS(new Date()),
          'DTSTART:' + formatearFechaICS(inicio),
          'DTEND:' + formatearFechaICS(fin),
          'SUMMARY:' + escaparICS(materia),
          'DESCRIPTION:' + escaparICS(descripcion),
          'LOCATION:' + escaparICS(salon),
          'END:VEVENT',
        )
      }
      fechaClase.setDate(fechaClase.getDate() + 7)
    }
  })

  lineas.push('END:VCALENDAR')
  return lineas.join('\r\n')
}

export function descargarICS(contenido, nombre = 'horarios-ccd.ics') {
  const blob = new Blob([contenido], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
