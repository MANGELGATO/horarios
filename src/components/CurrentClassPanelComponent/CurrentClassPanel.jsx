import { useState } from 'react'
import './CurrentClassPanel.css'

function CurrentClassPanel({ clases }) {
  const [expandido, setExpandido] = useState(false)
  const ahora = new Date()
  const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const diaActual  = dias[ahora.getDay()]
  const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const esFindeSemana = ahora.getDay() === 0 || ahora.getDay() === 6

  return (
    <section className={`current-panel${expandido ? ' current-panel--open' : ''}`}>
      {/* ── Encabezado del panel (clickeable) ── */}
      <button className="current-panel__header" onClick={() => setExpandido(e => !e)}>
        <div className="current-panel__title-group">
          <span className="current-panel__dot" aria-hidden="true" />
          <h2 className="current-panel__title">Clases en curso</h2>
          {!expandido && <span className="current-panel__hint">Despliega para ver clases en curso</span>}
        </div>
        <div className="current-panel__tiempo">
          <span className="current-panel__dia">{diaActual}</span>
          <span className="current-panel__hora">{horaActual}</span>
          <span className={`current-panel__chevron-wrapper${expandido ? ' current-panel__chevron-wrapper--open' : ''}`}>
            <svg className="current-panel__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </button>

      {/* ── Contenido ── */}
      {expandido && (
        <div className="current-panel__body">
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
        </div>
      )}
    </section>
  )
}

export default CurrentClassPanel