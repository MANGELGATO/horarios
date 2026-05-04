import './CurrentClassPanel.css'

function CurrentClassPanel({ clases }) {
  const ahora = new Date()
  const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const diaActual  = dias[ahora.getDay()]
  const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const esFindeSemana = ahora.getDay() === 0 || ahora.getDay() === 6

  return (
    <section className="current-panel">
      {/* ── Encabezado del panel ── */}
      <div className="current-panel__header">
        <div className="current-panel__title-group">
          <span className="current-panel__dot" aria-hidden="true" />
          <h2 className="current-panel__title">Clases en curso</h2>
        </div>
        <div className="current-panel__tiempo">
          <span className="current-panel__dia">{diaActual}</span>
          <span className="current-panel__hora">{horaActual}</span>
        </div>
      </div>

      {/* ── Contenido ── */}
      {esFindeSemana ? (
        <div className="current-panel__empty">
          <span className="current-panel__empty-icon">📅</span>
          <p>Es fin de semana — no hay clases programadas</p>
        </div>
      ) : clases.length === 0 ? (
        <div className="current-panel__empty">
          <span className="current-panel__empty-icon">🕐</span>
          <p>No hay clases activas en este momento</p>
        </div>
      ) : (
        <div className="current-panel__grid">
          {clases.map((clase, i) => (
            <div key={i} className={`current-card current-card--${clase.turno === 'Matutino' ? 'mat' : 'ves'}`}>
              <div className="current-card__top">
                <span className={`current-card__badge ${clase.turno === 'Matutino' ? 'badge--matutino' : 'badge--vespertino'}`}>
                  {clase.carrera} · {clase.grupo}
                </span>
                <span className="current-card__salon">{clase.salon}</span>
              </div>
              <p className="current-card__materia">{clase.materia}</p>
              <p className="current-card__profesor">{clase.profesor}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default CurrentClassPanel