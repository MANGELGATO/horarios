import { useState } from 'react'
import { USUARIOS } from '../../data/horarios'
import './LoginModal.css'

function LoginModal({ abierto, onCerrar, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!abierto) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const usuario = USUARIOS.find(u => u.email === email && u.password === password)
    if (usuario) {
      onLogin(usuario)
      setEmail('')
      setPassword('')
    } else {
      setError('Credenciales inválidas')
    }
  }

  return (
    <div className="login-overlay" onClick={onCerrar}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        <button className="login-modal__close" onClick={onCerrar}>&times;</button>
        <h2 className="login-modal__title">Iniciar sesión</h2>
        <form className="login-modal__form" onSubmit={handleSubmit}>
          <label className="login-modal__label">
            Correo
            <input className="login-modal__input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@utj.edu.mx" autoFocus />
          </label>
          <label className="login-modal__label">
            Contraseña
            <input className="login-modal__input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" />
          </label>
          {error && <p className="login-modal__error">{error}</p>}
          <button className="login-modal__submit" type="submit">Entrar</button>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
