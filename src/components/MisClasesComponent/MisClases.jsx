import './MisClases.css'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

function MisClases({ horarios, profesorNombre }) {
  if (horarios.length === 0) {
    return (
      <div className="mis-clases-empty">
        <span className="mis-clases-empty__icon">📚</span>
        <p>No tienes clases asignadas en el sistema.</p>
      </div>
    )
  }

  // Agrupar clases por día
  const clasesPorDia = {}
  DIAS.forEach(d => clasesPorDia[d] = [])
  
  horarios.forEach(h => {
    if (clasesPorDia[h.dia]) {
      clasesPorDia[h.dia].push(h)
    }
  })

  // Ordenar clases dentro de cada día por bloque/hora (asumiendo que el bloque 1 es más temprano)
  Object.keys(clasesPorDia).forEach(dia => {
    clasesPorDia[dia].sort((a, b) => a.bloque - b.bloque)
  })

  return (
    <div className="mis-clases-container">
      <div className="mis-clases-header">
        <h2>Horario de: {profesorNombre}</h2>
        <p>Tus clases asignadas agrupadas por día de la semana.</p>
      </div>

      <div className="mis-clases-grid">
        {DIAS.map(dia => {
          const clasesDia = clasesPorDia[dia]
          if (clasesDia.length === 0) return null

          return (
            <div key={dia} className="mis-clases-dia">
              <h3 className="mis-clases-dia-title">{dia}</h3>
              <div className="mis-clases-lista">
                {clasesDia.map((c, i) => (
                  <div key={i} className="mis-clase-card">
                    <div className="mis-clase-card__hora">
                      Bloque {c.bloque} • {c.turno}
                    </div>
                    <div className="mis-clase-card__info">
                      <div className="mis-clase-card__materia">{c.materia}</div>
                      <div className="mis-clase-card__meta">
                        <span>👥 {c.carrera} {c.grupo}</span>
                        <span>📍 {c.salon}</span>
                      </div>
                    </div>
                    {c.diaVirtual === dia && (
                      <span className="mis-clase-badge virtual">Virtual</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MisClases
