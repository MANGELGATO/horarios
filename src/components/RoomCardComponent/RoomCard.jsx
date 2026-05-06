import './RoomCard.css'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

// ── Mapas de bloque → hora ──
const HORAS_MAT = {
  1: '7:00–7:50',
  2: '7:50–8:40',
  3: '9:10–10:00',
  4: '10:00–10:50',
  5: '10:50–11:40',
  6: '11:40–12:30',
  7: '12:30–13:20',
  8: '13:20–14:10',
}

const HORAS_VES = {
  1: '15:30–16:20',
  2: '16:20–17:10',
  3: '17:10–18:00',
  4: '18:00–18:50',
  5: '18:50–19:40',
  6: '19:40–20:30',
  7: '20:30–21:20',
}

function getHora(bloque, turno) {
  const mapa = turno === 'Vespertino' ? HORAS_VES : HORAS_MAT
  return mapa[bloque] || `B${bloque}`
}

function getColor(carrera) {
  const map = { DSM: 'dsm', EVND: 'evnd', IDGS: 'idgs', IEVND: 'ievnd' }
  return map[carrera] || 'default'
}

function RoomCard({ salon, clases }) {
  const porDia = {}
  DIAS.forEach(d => { porDia[d] = clases.filter(c => c.dia === d) })

  const totalClases = clases.length
  const carreras = [...new Set(clases.map(c => c.carrera))]

  return (
    <article className="room-card">
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
      <div className="room-card__carreras">
        {carreras.map(c => (
          <span key={c} className={`room-chip room-chip--${getColor(c)}`}>{c}</span>
        ))}
      </div>

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
                      <span className="room-item__hora">
                        {getHora(c.bloque, c.turno)}
                      </span>
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