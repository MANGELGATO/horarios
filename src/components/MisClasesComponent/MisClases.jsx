import './MisClases.css'
import { getBloqueById, consolidarClases } from '../../data/horarios'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const COLORES_MATERIA = [
  '#01696f', '#0891b2', '#7c3aed', '#db2777', '#d97706',
  '#059669', '#dc2626', '#4f46e5', '#0d9488', '#b45309'
]

function getColorMateria(materia) {
  let hash = 0
  for (let i = 0; i < materia.length; i++) hash = materia.charCodeAt(i) + ((hash << 5) - hash)
  return COLORES_MATERIA[Math.abs(hash) % COLORES_MATERIA.length]
}

function MisClases({ horarios, profesorNombre, onClaseClick }) {
  if (horarios.length === 0) {
    return (
      <div className="mc-empty">
        <span className="mc-empty__icon">📚</span>
        <p>No tienes clases asignadas en el sistema.</p>
      </div>
    )
  }

  // Agrupar por día y ordenar por bloque
  const clasesPorDia = {}
  DIAS.forEach(d => clasesPorDia[d] = [])
  horarios.forEach(h => { if (clasesPorDia[h.dia]) clasesPorDia[h.dia].push(h) })
  Object.keys(clasesPorDia).forEach(dia => {
    clasesPorDia[dia] = consolidarClases(clasesPorDia[dia]);
    clasesPorDia[dia].sort((a, b) => a.bloque - b.bloque);
  })

  const diasConClases = DIAS.filter(d => clasesPorDia[d].length > 0)

  return (
    <div className="mc-container">
      <div className="mc-header">
        <div className="mc-header__avatar">{profesorNombre?.charAt(0) || '?'}</div>
        <div>
          <h2 className="mc-header__nombre">{profesorNombre}</h2>
          <p className="mc-header__sub">{horarios.length} clases asignadas · {diasConClases.length} días a la semana</p>
        </div>
      </div>

      <div className="mc-semana">
        {DIAS.map(dia => {
          const clasesDia = clasesPorDia[dia]
          const tieneClases = clasesDia.length > 0

          return (
            <div key={dia} className={`mc-dia ${!tieneClases ? 'mc-dia--vacio' : ''}`}>
              <div className="mc-dia__header">
                <span className="mc-dia__nombre">{dia}</span>
                {tieneClases && <span className="mc-dia__count">{clasesDia.length}</span>}
              </div>

              {!tieneClases ? (
                <div className="mc-dia__libre">Libre</div>
              ) : (
                <div className="mc-dia__clases">
                  {clasesDia.map((c, i) => {
                    const bloque = getBloqueById(c.bloque, c.turno)
                    const color = getColorMateria(c.materia)
                    const esVirtual = c.diaVirtual && c.diaVirtual !== c.dia
                    return (
                      <div 
                        key={i} 
                        className={`mc-clase${esVirtual ? ' mc-clase--virtual' : ''}`} 
                        style={{ '--mc-color': color, cursor: 'pointer' }}
                        onClick={() => onClaseClick?.(c)}
                        title="Click para llenar bitácora de esta clase"
                      >
                        <div className="mc-clase__barra" />
                        <div className="mc-clase__body">
                          <div className="mc-clase__hora">
                            {bloque ? `${bloque.inicio} – ${bloque.fin}` : `Bloque ${c.bloque}`}
                            {esVirtual && <span className="mc-clase__tag">Virtual</span>}
                          </div>
                          <div className="mc-clase__materia">{c.materia}</div>
                          <div className="mc-clase__meta">
                            <span>👥 {c.carrera} {c.grupo}</span>
                            <span>📍 {c.salon}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MisClases
