import { useState } from 'react'
import './Navbar.css'

const ETIQUETAS_ROL = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  admin: 'Admin',
  superadmin: 'Super Admin',
}

function AvatarUser({ foto, nombre }) {
  const [fallback, setFallback] = useState(!foto)
  if (fallback) {
    return (
      <div className="navbar__user-avatar navbar__user-avatar--placeholder">
        {(nombre || '?')[0].toUpperCase()}
      </div>
    )
  }
  return (
    <img
      className="navbar__user-avatar"
      src={foto}
      alt={nombre || ''}
      referrerPolicy="no-referrer"
      onError={() => setFallback(true)}
    />
  )
}

function Navbar({ usuario, onLogout, onInfoClick, turnoActual, tema, onToggleTema }) {
  return (
    <header className="navbar">
      <div className="navbar__inner">

        <div className="navbar__brand">
          <svg className="navbar__logo" viewBox="0 0 40 40" fill="none" aria-label="Logo">
            <rect x="4" y="4" width="14" height="14" rx="3" fill="currentColor" opacity="0.9" />
            <rect x="22" y="4" width="14" height="14" rx="3" fill="currentColor" opacity="0.6" />
            <rect x="4" y="22" width="14" height="14" rx="3" fill="currentColor" opacity="0.6" />
            <rect x="22" y="22" width="14" height="14" rx="3" fill="currentColor" opacity="0.3" />
          </svg>
          <div>
            <p className="navbar__title">Dashboard de Horarios</p>
            <p className="navbar__subtitle">CCD · Ciclo 2026B</p>
          </div>
        </div>

        <div className="navbar__right">
          <div className="navbar__badges">
            {turnoActual === 'Matutino' && (
              <span className="badge badge--matutino">7:00–14:10</span>
            )}
            {turnoActual === 'Vespertino' && (
              <span className="badge badge--vespertino">15:30–21:20</span>
            )}
          </div>

          <div className="navbar__user">
            <AvatarUser foto={usuario.foto} nombre={usuario.nombre} />
            <span className="navbar__user-name">{usuario.nombre}</span>
            <span className={`navbar__user-rol navbar__user-rol--${usuario.rol}`}>
              {ETIQUETAS_ROL[usuario.rol] || usuario.rol}
            </span>
            <button className="navbar__logout-btn" onClick={onLogout} title="Cerrar sesión">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>

          <button
            className="navbar__theme-btn"
            onClick={onToggleTema}
            aria-label="Cambiar tema"
            title={`Cambiar a modo ${tema === 'claro' ? 'oscuro' : 'claro'}`}
          >
            {tema === 'claro' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          <button
            className="navbar__info-btn"
            onClick={onInfoClick}
            aria-label="Información del proyecto"
            title="Acerca de este proyecto"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>

      </div>
    </header>
  )
}

export default Navbar
