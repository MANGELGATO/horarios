import './RoomCard.css'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

function getColor(carrera) {
  const map = { DSM:'dsm', EVND:'evnd', IDGS:'idgs', IEVND:'ievnd' }
  return map[carrera] || 'default'
}

function RoomCard({ salon, clases }) {
  // Agrupa clases por día
  const porDia = {}
  DIAS.forEach(d => { porDia[d] = clases.filter(c => c.dia === d) })

  const totalClases = clases.length
  const carreras = [...new Set(clases.map(c => c.carrera))]

  return (
    <article className="room-card">
      {/* Header */}
      <div className="room-card__header">
        <div className="room-card__salon-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <h3 className="room-card__name">{salon}</h3>
        </div>
        <span className="room-card__count">{totalClases} clase{totalClases !== 1 ? 's' : ''}</span>
      </div>

      {/* Carreras presentes */}
      <div className="room-card__carreras">
        {carreras.map(c => (
          <span key={c} className={`room-chip room-chip--${getColor(c)}`}>{c}</span>
        ))}
      </div>

      {/* Clases por día */}
      <div className="room-card__dias">
        {DIAS.map(dia => {
          const clasesDelDia = porDia[dia]
          if (clasesDelDia.length === 0) return null
          return (
            <div key={dia} className="room-card__dia-group">
              <p className="room-card__dia-label">{dia}</p>
              <div className="room-card__clases">
                {clasesDelDia
                  .sort((a, b) => a.bloque - b.bloque)
                  .map((c, i) => (
                    <div key={i} className={`room-item room-item--${getColor(c.carrera)}`}>
                      <span className="room-item__hora">B{c.bloque}</span>
                      <div className="room-item__info">
                        <span className="room-item__materia">{c.materia}</span>
                        <span className="room-item__grupo">{c.carrera} {c.grupo} · {c.turno}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

export default RoomCard