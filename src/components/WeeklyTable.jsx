import './WeeklyTable.css'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const BLOQUES_MAT = [
  { id: 1, label: '7:00–7:50' },
  { id: 2, label: '7:50–8:40' },
  { id: 3, label: '9:10–10:00' },
  { id: 4, label: '10:00–10:50' },
  { id: 5, label: '10:50–11:40' },
  { id: 6, label: '11:40–12:30' },
  { id: 7, label: '12:30–13:20' },
  { id: 8, label: '13:20–14:10' },
]

const BLOQUES_VES = [
  { id: 1, label: '15:30–16:20' },
  { id: 2, label: '16:20–17:10' },
  { id: 3, label: '17:10–18:00' },
  { id: 4, label: '18:00–18:50' },
  { id: 5, label: '18:50–19:40' },
  { id: 6, label: '19:40–20:30' },
  { id: 7, label: '20:30–21:20' },
]

function getColor(carrera) {
  const map = {
    DSM:   'color-dsm',
    EVND:  'color-evnd',
    IDGS:  'color-idgs',
    IEVND: 'color-ievnd',
  }
  return map[carrera] || 'color-default'
}

function WeeklyTable({ horarios, getBloqueById }) {
  if (horarios.length === 0) {
    return (
      <div className="weekly-empty">
        <span className="weekly-empty__icon">🔍</span>
        <p>Sin resultados — intenta cambiar los filtros</p>
      </div>
    )
  }

  // Detecta si hay matutino y/o vespertino en los resultados filtrados
  const tieneMat = horarios.some(h => h.turno === 'Matutino')
  const tieneVes = horarios.some(h => h.turno === 'Vespertino')

  // Función que construye el mapa dia→bloque→[clases] para un turno dado
  const buildMap = (turno) => {
    const bloques = turno === 'Matutino' ? BLOQUES_MAT : BLOQUES_VES
    const map = {}
    DIAS.forEach(dia => {
      map[dia] = {}
      bloques.forEach(b => { map[dia][b.id] = [] })
    })
    horarios
      .filter(h => h.turno === turno)
      .forEach(h => {
        if (map[h.dia] && map[h.dia][h.bloque] !== undefined) {
          map[h.dia][h.bloque].push(h)
        }
      })
    return map
  }

  return (
    <div className="weekly-wrapper">
      {tieneMat && (
        <TurnoTable
          turno="Matutino"
          bloques={BLOQUES_MAT}
          mapa={buildMap('Matutino')}
        />
      )}
      {tieneVes && (
        <TurnoTable
          turno="Vespertino"
          bloques={BLOQUES_VES}
          mapa={buildMap('Vespertino')}
        />
      )}
    </div>
  )
}

function TurnoTable({ turno, bloques, mapa }) {
  return (
    <div className="turno-block">
      {/* Etiqueta de turno */}
      <div className={`turno-block__label turno-block__label--${turno === 'Matutino' ? 'mat' : 'ves'}`}>
        <span>{turno === 'Matutino' ? '☀️' : '🌙'}</span>
        <span>Turno {turno}</span>
      </div>

      {/* Tabla con scroll horizontal en móvil */}
      <div className="table-scroll">
        <table className="weekly-table">
          <thead>
            <tr>
              <th className="th-hora">Horario</th>
              {DIAS.map(d => (
                <th key={d} className="th-dia">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloques.map((bloque, bi) => (
              <tr key={bloque.id} className={bi % 2 === 0 ? 'tr-even' : 'tr-odd'}>
                <td className="td-hora">{bloque.label}</td>
                {DIAS.map(dia => {
                  const clases = mapa[dia][bloque.id]
                  return (
                    <td key={dia} className="td-clase">
                      {clases.length === 0 ? (
                        <span className="td-vacio">—</span>
                      ) : (
                        clases.map((c, i) => (
                          <div key={i} className={`clase-chip ${getColor(c.carrera)}`}>
                            <span className="clase-chip__materia">{c.materia}</span>
                            <span className="clase-chip__meta">
                              {c.carrera} {c.grupo} · {c.salon}
                            </span>
                            <span className="clase-chip__prof">{c.profesor}</span>
                          </div>
                        ))
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WeeklyTable