import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../../firebase'
import './LoginPage.css'

function LoginPage() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setCargando(true)
    setError('')

    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      if (err.code === 'auth/popup-blocked') {
        setError('El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio e intenta de nuevo.')
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Error al iniciar sesión.')
      }
      setCargando(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="14" height="14" rx="3" fill="currentColor" opacity="0.9" />
            <rect x="22" y="4" width="14" height="14" rx="3" fill="currentColor" opacity="0.6" />
            <rect x="4" y="22" width="14" height="14" rx="3" fill="currentColor" opacity="0.6" />
            <rect x="22" y="22" width="14" height="14" rx="3" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
        <h1 className="login-card__title">Dashboard de Horarios</h1>
        <p className="login-card__subtitle">CCD · Ciclo 2026B</p>
        <div className="login-card__divider" />
        <p className="login-card__instruccion">Inicia sesión con tu cuenta institucional</p>
        <button className="login-card__btn-google" onClick={handleGoogle} disabled={cargando}>
          {cargando ? (
            <span className="login-card__spinner" aria-hidden="true" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
          )}
          {cargando ? 'Conectando...' : 'Continuar con Google'}
        </button>
        {error && (
          <div className="login-card__error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
        <p className="login-card__footer">UTJCCD · Equipo de Soporte · 2026</p>
      </div>
    </div>
  )
}

export default LoginPage
