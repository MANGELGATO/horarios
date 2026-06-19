import { memo } from 'react'
import './RoomCard.css'
import { consolidarClases } from '../../data/horarios'

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
  if (!carrera) return 'default'
  const firstCarrera = carrera.split(' / ')[0].trim()
  const map = { DSM: 'dsm', EVND: 'evnd', IDGS: 'idgs', IEVND: 'ievnd' }
  return map[firstCarrera] || 'default'
}

function getRoomIcon(salon) {
  const s = salon.toUpperCase()
  const LABS_OFICIALES = ['503', '506', 'M14', 'M13', 'M12', 'M11', 'M02', 'M05', '102', '106', '109'];
  
  // Si el nombre contiene la palabra laboratorio/lab o está en la lista oficial
  if (s.includes('LABORATORIO') || s.includes('LAB') || LABS_OFICIALES.some(l => s.includes(l))) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4.5 3h15M6 3v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3M6 14h12M10 3v5M14 3v5" />
      </svg>
    )
  }
  if (s.includes('taller')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.7a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.7z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function RoomCard({ salon, clases }) {
  const porDia = {}
  DIAS.forEach(d => { porDia[d] = clases.filter(c => c.dia === d) })

  const totalClases = clases.length
  const careers = [...new Set(clases.map(c => c.carrera))]

  return (
    <article className="room-card">
      <div className="room-card__header">
        <div className="room-card__salon-info">
          {getRoomIcon(salon)}
          <h3 className="room-card__name">{salon}</h3>
        </div>
        <span className="room-card__count">{totalClases} clase{totalClases !== 1 ? 's' : ''}</span>
      </div>
      <div className="room-card__carreras">
        {careers.map(c => (
          <span key={c} className={`room-chip room-chip--${getColor(c)}`}>{c}</span>
        ))}
      </div>

      <div className="room-card__dias">
        {DIAS.map(dia => {
          const clasesDelDia = consolidarClases(porDia[dia])
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

export default memo(RoomCard)