import { useState, useEffect, useRef } from 'react'
import './ProjectorPanel.css'

const playAlarma = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const tono = (freq, start, dur) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.4, start)
      gain.gain.exponentialRampToValueAtTime(0.01, start + dur)
      osc.start(start)
      osc.stop(start + dur)
    }
    tono(880, ctx.currentTime, 0.15)
    tono(660, ctx.currentTime + 0.2, 0.15)
    tono(880, ctx.currentTime + 0.4, 0.3)
  } catch {}
}

function ProjectorPanel({ clases, proximas, proximas10 }) {
  const [expandido, setExpandido] = useState(false)
  const alertadas = useRef(new Set())
  const alertadas10 = useRef(new Set())
  const ahora = new Date()
  const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const diaActual  = dias[ahora.getDay()]
  const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const esFindeSemana = ahora.getDay() === 0 || ahora.getDay() === 6

  const clasesConProyector = clases.filter(c => c.proyector)

  useEffect(() => {
    proximas.forEach(c => {
      const key = `${c.carrera}-${c.grupo}-${c.bloque}-${c.turno}`
      if (!alertadas.current.has(key) && c._firstBlock !== false) {
        alertadas.current.add(key)
        playAlarma()
      }
    })
  }, [proximas])

  useEffect(() => {
    (proximas10 || []).forEach(c => {
      const key = `10-${c.carrera}-${c.grupo}-${c.bloque}-${c.turno}`
      if (!alertadas10.current.has(key) && c._firstBlock !== false) {
        alertadas10.current.add(key)
        playAlarma()
      }
    })
  }, [proximas10])

  return (
    <section className={`proyector-panel${expandido ? ' proyector-panel--open' : ''}`}>
      <button className="proyector-panel__header" onClick={() => setExpandido(e => !e)}>
        <div className="proyector-panel__title-group">
          <span className="proyector-panel__dot" aria-hidden="true" />
          <h2 className="proyector-panel__title">Proyectores / pantallas</h2>
          {!expandido && (
            <>
              {proximas10 && proximas10.length > 0 && (
                <span className="proyector-panel__hint proyector-panel__hint--alerta">
                  {proximas10.length} por comenzar
                </span>
              )}
              {clasesConProyector.length > 0 && (
                <span className="proyector-panel__hint">{clasesConProyector.length} activo{clasesConProyector.length !== 1 ? 's' : ''}</span>
              )}
            </>
          )}
        </div>
        <div className="proyector-panel__tiempo">
          <span className="proyector-panel__dia">{diaActual}</span>
          <span className="proyector-panel__hora">{horaActual}</span>
          <span className={`proyector-panel__chevron-wrapper${expandido ? ' proyector-panel__chevron-wrapper--open' : ''}`}>
            <svg className="proyector-panel__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </button>

      {expandido && (
        <div className="proyector-panel__body">
          {esFindeSemana ? (
            <div className="proyector-panel__empty">
              <span className="proyector-panel__empty-icon">📅</span>
              <p>Es fin de semana — no hay proyecciones programadas</p>
            </div>
          ) : clasesConProyector.length === 0 && (!proximas10 || proximas10.length === 0) ? (
            <div className="proyector-panel__empty">
              <span className="proyector-panel__empty-icon">🖥️</span>
              <p>No hay proyecciones activas ni próximas</p>
            </div>
          ) : (
            <>
              {proximas10 && proximas10.length > 0 && (
                <div className="proyector-panel__seccion">
                  <h3 className="proyector-panel__seccion-titulo proyector-panel__seccion-titulo--alerta">
                    ⏰ Por comenzar
                  </h3>
                  <div className="proyector-panel__grid">
                    {proximas10.map((clase, i) => (
                      <div key={i} className="proyector-card proyector-card--upcoming">
                        <div className="proyector-card__top">
                          <span className="proyector-card__proyector">{clase.proyector}</span>
                          <span className="proyector-card__salon">{clase.salon}</span>
                        </div>
                        <div className="proyector-card__countdown">
                          Inicia a las {clase._inicio}
                        </div>
                        <div className="proyector-card__info">
                          <span className={`proyector-card__badge ${clase.turno === 'Matutino' ? 'badge--matutino' : 'badge--vespertino'}`}>
                            {clase.carrera} · {clase.grupo}
                          </span>
                          <p className="proyector-card__materia">{clase.materia}</p>
                          <p className="proyector-card__profesor">{clase.profesor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {clasesConProyector.length > 0 && (
                <div className="proyector-panel__seccion">
                  <h3 className="proyector-panel__seccion-titulo">En vivo</h3>
                  <div className="proyector-panel__grid">
                    {clasesConProyector.map((clase, i) => (
                      <div key={i} className="proyector-card">
                        <div className="proyector-card__top">
                          <span className="proyector-card__proyector">{clase.proyector}</span>
                          <span className="proyector-card__salon">{clase.salon}</span>
                        </div>
                        <div className="proyector-card__info">
                          <span className={`proyector-card__badge ${clase.turno === 'Matutino' ? 'badge--matutino' : 'badge--vespertino'}`}>
                            {clase.carrera} · {clase.grupo}
                          </span>
                          <p className="proyector-card__materia">{clase.materia}</p>
                          <p className="proyector-card__profesor">{clase.profesor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default ProjectorPanel
