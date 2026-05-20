import { useState } from 'react'
import './CurrentClassPanel.css'

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

function CurrentClassPanel({ clases, esAdmin, simulacion, setSimulacion }) {
  const [expandido, setExpandido] = useState(false)
  const ahora = new Date()
  const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const diaActual  = dias[ahora.getDay()]
  const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  
  // Si estamos simulando, no bloqueamos por fin de semana real
  const esFindeSemana = !simulacion?.activo && (ahora.getDay() === 0 || ahora.getDay() === 6)

  return (
    <section className={`current-panel${expandido ? ' current-panel--open' : ''} ${simulacion?.activo ? 'current-panel--simulando' : ''}`}>
      {/* ── Encabezado del panel (clickeable) ── */}
      <button className="current-panel__header" onClick={() => setExpandido(e => !e)}>
        <div className="current-panel__title-group">
          <span className={`current-panel__dot ${simulacion?.activo ? 'current-panel__dot--simulando' : ''}`} aria-hidden="true" />
          <h2 className="current-panel__title">Clases en curso</h2>
          {!expandido && <span className="current-panel__hint">Despliega para ver clases en curso</span>}
          {simulacion?.activo && <span className="current-badge-simulando">Simulando</span>}
        </div>
        <div className="current-panel__tiempo">
          <span className="current-panel__dia">{simulacion?.activo ? simulacion.dia : diaActual}</span>
          <span className={`current-panel__hora ${simulacion?.activo ? 'current-panel__hora--simulando' : ''}`}>
            {simulacion?.activo ? simulacion.hora : horaActual}
          </span>
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
          {/* Controles de Simulación (Time Travel) - Solo para Admin */}
          {esAdmin && simulacion && (
            <div className={`simulation-control ${simulacion.activo ? 'simulation-control--active' : ''}`}>
              <div className="simulation-control__header">
                <div className="simulation-control__title-group">
                  <span className="simulation-control__icon">⏳</span>
                  <div>
                    <h3 className="simulation-control__title">Modo Simulación (Time Travel)</h3>
                    <p className="simulation-control__subtitle">Explora los horarios en cualquier día y hora virtual</p>
                  </div>
                </div>
                <label className="simulation-control__switch" title="Activar simulación">
                  <input
                    type="checkbox"
                    checked={simulacion.activo}
                    onChange={e => setSimulacion(prev => ({ ...prev, activo: e.target.checked }))}
                  />
                  <span className="simulation-control__slider" />
                </label>
              </div>

              {simulacion.activo && (
                <div className="simulation-control__body">
                  <div className="simulation-control__inputs">
                    <div className="simulation-control__field">
                      <label className="simulation-control__label">Día de la semana</label>
                      <select
                        className="simulation-control__select"
                        value={simulacion.dia}
                        onChange={e => setSimulacion(prev => ({ ...prev, dia: e.target.value }))}
                      >
                        <option value="Lunes">Lunes</option>
                        <option value="Martes">Martes</option>
                        <option value="Miércoles">Miércoles</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Viernes">Viernes</option>
                      </select>
                    </div>

                    <div className="simulation-control__field">
                      <label className="simulation-control__label">Hora virtual</label>
                      <input
                        className="simulation-control__time-input"
                        type="time"
                        value={simulacion.hora}
                        onChange={e => setSimulacion(prev => ({ ...prev, hora: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="simulation-control__quick-blocks">
                    <span className="simulation-control__quick-label">Atajos de Turnos y Bloques:</span>
                    <div className="simulation-control__quick-buttons">
                      <button className="simulation-btn-quick" onClick={() => setSimulacion(prev => ({ ...prev, hora: '07:00' }))}>07:00 (B1 Matutino)</button>
                      <button className="simulation-btn-quick" onClick={() => setSimulacion(prev => ({ ...prev, hora: '09:10' }))}>09:10 (B3 Matutino)</button>
                      <button className="simulation-btn-quick" onClick={() => setSimulacion(prev => ({ ...prev, hora: '10:50' }))}>10:50 (B5 Matutino)</button>
                      <button className="simulation-btn-quick" onClick={() => setSimulacion(prev => ({ ...prev, hora: '12:30' }))}>12:30 (B7 Matutino)</button>
                      <button className="simulation-btn-quick" onClick={() => setSimulacion(prev => ({ ...prev, hora: '15:30' }))}>15:30 (B1 Vespertino)</button>
                      <button className="simulation-btn-quick" onClick={() => setSimulacion(prev => ({ ...prev, hora: '18:00' }))}>18:00 (B4 Vespertino)</button>
                      <button className="simulation-btn-quick" onClick={() => setSimulacion(prev => ({ ...prev, hora: '20:30' }))}>20:30 (B7 Vespertino)</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                  <div className="current-card__footer">
                    <span className="current-card__profesor">{clase.profesor}</span>
                    <span className="current-card__hora-tag">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4.5px', display: 'inline-block', verticalAlign: 'middle' }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {getHora(clase.bloque, clase.turno)}
                    </span>
                  </div>
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