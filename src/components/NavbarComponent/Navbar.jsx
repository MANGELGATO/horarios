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
      onError={() => {
        console.warn('[AvatarUser] Error al cargar foto:', foto)
        setFallback(true)
      }}
    />
  )
}

function Navbar({ vistaActual, setVista, usuario, onLogout, onInfoClick, turnoActual }) {
  const esAdmin = usuario.rol === 'admin' || usuario.rol === 'superadmin'


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

        <nav className="navbar__nav" aria-label="Vistas">
          <button
            className={`navbar__btn ${vistaActual === 'tabla' ? 'navbar__btn--active' : ''}`}
            onClick={() => setVista('tabla')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M3 15h18M9 3v18" />
            </svg>
            Por grupo
          </button>
          <button
            className={`navbar__btn ${vistaActual === 'salones' ? 'navbar__btn--active' : ''}`}
            onClick={() => setVista('salones')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Por salón
          </button>
          {esAdmin && (
            <button
              className={`navbar__btn ${vistaActual === 'proyectores' ? 'navbar__btn--active' : ''}`}
              onClick={() => setVista('proyectores')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Proyectores
            </button>
          )}
          {esAdmin && (
            <button
              className={`navbar__btn ${vistaActual === 'admin' ? 'navbar__btn--active' : ''}`}
              onClick={() => setVista('admin')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Admin
            </button>
          )}
        </nav>

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
            className={`navbar__print-btn ${vistaActual === 'print' ? 'navbar__print-btn--active' : ''}`}
            onClick={() => setVista('print')}
            title="Imprimir tabloide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
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
