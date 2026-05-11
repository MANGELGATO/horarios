import './Navbar.css'

function Navbar({ vistaActual, setVista, usuario, onLogout, onInfoClick }) {
  return (
    <header className="navbar">
      <div className="navbar__inner">

        {/* Brand */}
        <div className="navbar__brand">
          <svg className="navbar__logo" viewBox="0 0 40 40" fill="none" aria-label="Logo">
            <rect x="4"  y="4"  width="14" height="14" rx="3" fill="currentColor" opacity="0.9"/>
            <rect x="22" y="4"  width="14" height="14" rx="3" fill="currentColor" opacity="0.6"/>
            <rect x="4"  y="22" width="14" height="14" rx="3" fill="currentColor" opacity="0.6"/>
            <rect x="22" y="22" width="14" height="14" rx="3" fill="currentColor" opacity="0.3"/>
          </svg>
          <div>
            <p className="navbar__title">Dashboard de Horarios</p>
            <p className="navbar__subtitle">Bienvenido, CCD · Ciclo 2026B</p>
          </div>
        </div>

        {/* Navegación de vistas */}
        <nav className="navbar__nav" aria-label="Vistas">
          <button
            className={`navbar__btn ${vistaActual === 'tabla' ? 'navbar__btn--active' : ''}`}
            onClick={() => setVista('tabla')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M3 15h18M9 3v18"/>
            </svg>
            Por grupo
          </button>
          <button
            className={`navbar__btn ${vistaActual === 'salones' ? 'navbar__btn--active' : ''}`}
            onClick={() => setVista('salones')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Por salón
          </button>
        </nav>

        {/* Derecha: badges + botón info */}
        <div className="navbar__right">
          <div className="navbar__badges">
            <span className="badge badge--matutino">☀️ 7:00–14:10</span>
            <span className="badge badge--vespertino">🌙 15:30–21:20</span>
          </div>

          <div className="navbar__user">
            {usuario.foto && (
              <img className="navbar__user-avatar" src={usuario.foto} alt="" />
            )}
            <span className="navbar__user-name">{usuario.nombre}</span>
            <span className="navbar__user-rol">{usuario.rol === 'admin' ? 'Admin' : 'Estudiante'}</span>
            <button className="navbar__logout-btn" onClick={onLogout} title="Cerrar sesión">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>

            {/* Botón Imprimir — Ahora con clase consistente */}
<button
  className={`navbar__print-btn ${vistaActual === 'print' ? 'navbar__print-btn--active' : ''}`}
  onClick={() => setVista('print')}
  title="Imprimir tabloide"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
</button>

          {/* ── Botón Info ── */}
          <button
            className="navbar__info-btn"
            onClick={onInfoClick}
            aria-label="Información del proyecto"
            title="Acerca de este proyecto"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </button>
        </div>

      </div>
    </header>
  )
}

export default Navbar