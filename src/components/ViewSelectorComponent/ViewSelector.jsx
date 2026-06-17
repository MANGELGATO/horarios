import { useNavigate, useLocation } from 'react-router-dom'
import './ViewSelector.css'

function ViewSelector({ usuario, onPedirEquipo }) {
  const navigate = useNavigate()
  const location = useLocation()
  const vista = location.pathname.replace(/^\//, '') || 'tabla'
  const esAdmin = usuario?.rol === 'admin' || usuario?.rol === 'superadmin'
  const esDocente = usuario?.rol === 'docente' || usuario?.preferencias?.tipo === 'docente'
  const esServicio = usuario?.rol === 'servicio'
  const esEstudiante = usuario?.rol === 'estudiante'

  if (esEstudiante) return null

  return (
    <div className="view-selector">
      <button
        className={`view-selector__btn ${vista === 'tabla' ? 'view-selector__btn--active' : ''}`}
        onClick={() => navigate('/tabla')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18" />
        </svg>
        Por grupo
      </button>

      {esDocente && (
        <button
          className={`view-selector__btn ${vista === 'mis-clases' ? 'view-selector__btn--active' : ''}`}
          onClick={() => navigate('/mis-clases')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          Mis clases
        </button>
      )}

      <button
        className={`view-selector__btn ${vista === 'salones' ? 'view-selector__btn--active' : ''}`}
        onClick={() => navigate('/salones')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Por salón
      </button>

      {(esAdmin || esServicio) && (
        <button
          className={`view-selector__btn ${vista === 'proyectores' ? 'view-selector__btn--active' : ''}`}
          onClick={() => navigate('/proyectores')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
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
          className={`view-selector__btn ${vista === 'admin' ? 'view-selector__btn--active' : ''}`}
          onClick={() => navigate('/admin')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Admin
        </button>
      )}

      {esAdmin && (
        <button
          className={`view-selector__btn ${vista === 'bitacora' ? 'view-selector__btn--active' : ''}`}
          onClick={() => navigate('/bitacora')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Bitácora
        </button>
      )}

      <div className="view-selector__right">
        {(esAdmin || esServicio) && (
          <button
            className={`view-selector__btn view-selector__btn--print ${vista === 'print' ? 'view-selector__btn--active' : ''}`}
            onClick={() => navigate('/print')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Imprimir
          </button>
        )}

        {esDocente && (
          <button
            className="view-selector__btn view-selector__btn--print view-selector__btn--pedir"
            onClick={onPedirEquipo}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Pedir Equipo
          </button>
        )}
      </div>
    </div>
  )
}

export default ViewSelector
