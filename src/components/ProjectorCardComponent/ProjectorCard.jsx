import './ProjectorCard.css'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

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

function ProjectorCard({ proyector, clases }) {
  const porDia = {}
  DIAS.forEach(d => { porDia[d] = clases.filter(c => c.dia === d) })

  const totalClases = clases.length
  const carreras = [...new Set(clases.map(c => c.carrera))]
  const salones = [...new Set(clases.map(c => c.salon))]
  const esWebcam = clases.some(c => c.webcam)
  const esAbrir = clases.some(c => c.abrir)

  return (
    <article className={`proyector-card${esWebcam ? ' proyector-card--webcam' : esAbrir ? ' proyector-card--abrir' : ''}`}>
      <div className="proyector-card__header">
        <div className="proyector-card__proyector-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <h3 className="proyector-card__name">{esWebcam ? 'Webcam' : esAbrir ? 'Abrir taller' : `Proyector ${proyector}`}</h3>
        </div>
        <span className="proyector-card__count">{totalClases} clase{totalClases !== 1 ? 's' : ''}</span>
      </div>

      <div className="proyector-card__meta">
        <div className="proyector-card__carreras">
          {carreras.map(c => (
            <span key={c} className={`proyector-chip proyector-chip--${getColor(c)}`}>{c}</span>
          ))}
        </div>
        <div className="proyector-card__salones">
          {salones.map(s => (
            <span key={s} className="proyector-card__salon-tag">{s}</span>
          ))}
        </div>
      </div>

      <div className="proyector-card__dias">
        {DIAS.map(dia => {
          const clasesDelDia = porDia[dia]
          if (clasesDelDia.length === 0) return null
          return (
            <div key={dia} className="proyector-card__dia-group">
              <p className="proyector-card__dia-label">{dia}</p>
              <div className="proyector-card__clases">
                {clasesDelDia
                  .sort((a, b) => a.bloque - b.bloque)
                  .map((c, i) => (
                    <div key={i} className={`proyector-item proyector-item--${getColor(c.carrera)}`}>
                      <span className="proyector-item__hora">
                        {getHora(c.bloque, c.turno)}
                      </span>
                      <div className="proyector-item__info">
                        <span className="proyector-item__materia">{c.materia}</span>
                        <span className="proyector-item__profesor">{c.profesor}</span>
                        <span className="proyector-item__grupo">{c.carrera} {c.grupo} · {c.turno}</span>
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

export default ProjectorCard
