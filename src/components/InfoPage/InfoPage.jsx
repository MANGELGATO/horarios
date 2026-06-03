import './InfoPage.css'

import migFoto from '../../assets/img/mig.png'
import josFoto from '../../assets/img/jos.png'
import maxFoto from '../../assets/img/max.png'

const EQUIPO = [
  {
    nombre: 'García del Toro Miguel Ángel',
    carrera: 'TSU · Desarrollo de Software Multiplataforma',
    puesto: 'Jefe de Oficina',
    piso: 'Piso 5',
    foto: migFoto,
    iniciales: 'GM',
    color: 'dsm',
  },
  {
    nombre: 'Rodríguez Escobedo José Luis',
    carrera: 'ING · Desarrollo y Gestión de Software',
    puesto: 'Jefe de Oficina',
    piso: 'Piso M',
    foto: josFoto,
    iniciales: 'RJ',
    color: 'idgs',
  },
  {
    nombre: 'Murillo León Máximo Leonardo',
    carrera: 'TSU · Pendiente',
    puesto: 'Jefe de Oficina',
    piso: 'Piso 5',
    foto: maxFoto,
    iniciales: 'ML',
    color: 'evnd',
  },
]

function InfoPage({ onClose }) {
  // Cierra con Escape
  const handleKey = (e) => { if (e.key === 'Escape') onClose() }

  return (
    <div
      className="info-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Acerca del proyecto"
      onKeyDown={handleKey}
    >
      {/* Fondo oscuro */}
      <div className="info-overlay__bg" onClick={onClose} />

      <div className="info-modal">

        {/* Botón cerrar */}
        <button className="info-modal__close" onClick={onClose} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Hero */}
        <div className="info-modal__hero">
          <svg className="info-modal__logo" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect x="4"  y="4"  width="14" height="14" rx="3" fill="currentColor" opacity="0.9"/>
            <rect x="22" y="4"  width="14" height="14" rx="3" fill="currentColor" opacity="0.6"/>
            <rect x="4"  y="22" width="14" height="14" rx="3" fill="currentColor" opacity="0.6"/>
            <rect x="22" y="22" width="14" height="14" rx="3" fill="currentColor" opacity="0.3"/>
          </svg>
          <h2 className="info-modal__title">Dashboard de Horarios CCD</h2>
          <span className="info-modal__version">Ciclo 2026B</span>
        </div>

        {/* Leyenda */}
        <div className="info-modal__leyenda">
          <p>
            Esta plataforma es un proyecto desarrollado por el{' '}
            <strong>Equipo de Soporte UTJCCD</strong> con el objetivo de gestionar
            y visualizar de manera más clara y accesible los horarios del cuatrimestre
            actual. Permite consultar clases por grupo, salón, carrera y turno, además
            de mostrar en tiempo real qué clases están activas en este momento.
          </p>
        </div>

        <div className="info-modal__divider" />

        {/* Equipo */}
        <h3 className="info-modal__seccion-titulo">Equipo de Soporte</h3>

        <div className="info-modal__equipo">
          {EQUIPO.map((m, i) => (
            <div key={i} className="info-card">

              {/* Foto — si no carga muestra iniciales */}
              <div className={`info-card__avatar-wrap info-card__avatar-wrap--${m.color}`}>
                <img
                  src={m.foto}
                  alt={`Foto de ${m.nombre}`}
                  className="info-card__foto"
                  onError={(e) => {
                    // Si la imagen falla, oculta el img y muestra iniciales
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                {/* Fallback iniciales (oculto por defecto) */}
                <span className="info-card__iniciales" style={{ display: 'none' }}>
                  {m.iniciales}
                </span>
              </div>

              <div className="info-card__info">
                <p className="info-card__nombre">{m.nombre}</p>
                <p className="info-card__carrera">{m.carrera}</p>
                <div className="info-card__badges">
                  <span className="info-badge info-badge--puesto">{m.puesto}</span>
                  <span className="info-badge info-badge--piso">{m.piso}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="info-modal__footer">
          <p>UTJCCD · Universidad Tecnológica de Jalisco · 2026</p>
        </div>

      </div>
    </div>
  )
}

export default InfoPage