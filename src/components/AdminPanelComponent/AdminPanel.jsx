import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../firebase'
import './AdminPanel.css'

const ROLES = ['estudiante', 'docente', 'admin']
const ETIQUETAS_ROL = { estudiante: 'Estudiante', docente: 'Docente', admin: 'Admin' }
const COLORES_ROL = { estudiante: '#2e7d32', docente: '#1565c0', admin: '#c62828' }

function AdminPanel({ usuario }) {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editandoRol, setEditandoRol] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [confirmandoReset, setConfirmandoReset] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setCargando(false)
    }, (err) => {
      console.error('Error al cargar usuarios:', err)
      setCargando(false)
    })
    return unsub
  }, [])

  const mostrarMensaje = (texto) => {
    setMensaje(texto)
    setTimeout(() => setMensaje(''), 3000)
  }

  const cambiarRol = async (userId, nuevoRol) => {
    try {
      await updateDoc(doc(db, 'usuarios', userId), { rol: nuevoRol })
      mostrarMensaje(`Rol actualizado a ${ETIQUETAS_ROL[nuevoRol]}`)
      setEditandoRol(null)
    } catch (err) {
      mostrarMensaje('Error al actualizar rol: ' + err.message)
    }
  }

  const toggleActivo = async (userId, activo) => {
    try {
      await updateDoc(doc(db, 'usuarios', userId), { activo: !activo })
      mostrarMensaje(activo ? 'Usuario desactivado' : 'Usuario activado')
    } catch (err) {
      mostrarMensaje('Error: ' + err.message)
    }
  }

  const eliminarUsuario = async (userId) => {
    if (!confirm('¿Eliminar este usuario permanentemente?')) return
    try {
      await deleteDoc(doc(db, 'usuarios', userId))
      mostrarMensaje('Usuario eliminado')
    } catch (err) {
      mostrarMensaje('Error: ' + err.message)
    }
  }

  const actualizarPreferencia = async (userId, campo, valor) => {
    const clave = `preferencias.${campo}`
    try {
      if (valor === null) {
        const ref = doc(db, 'usuarios', userId)
        const { preferencias, ...resto } = {}
        await updateDoc(ref, { [clave]: null })
      } else {
        await updateDoc(doc(db, 'usuarios', userId), { [clave]: valor })
      }
      mostrarMensaje(`Preferencia "${campo}" actualizada`)
    } catch (err) {
      mostrarMensaje('Error: ' + err.message)
    }
  }

  const reiniciarPreferencias = async (userId) => {
    if (!confirm('¿Reiniciar preferencias de este usuario?')) return
    try {
      await updateDoc(doc(db, 'usuarios', userId), { preferencias: null })
      mostrarMensaje('Preferencias reiniciadas')
    } catch (err) {
      mostrarMensaje('Error: ' + err.message)
    }
  }

  const reiniciarTodosEstudiantes = async () => {
    if (!confirm('¿Reiniciar preferencias de TODOS los estudiantes?\n\nEsto borrará su carrera, grupo y turno guardados.\nTendrám que configurarlo de nuevo al iniciar sesión.')) return
    setConfirmandoReset(true)
    try {
      const estudiantes = usuarios.filter(u => u.rol === 'estudiante' && u.preferencias)
      const batch = writeBatch(db)
      estudiantes.forEach(u => {
        batch.update(doc(db, 'usuarios', u.id), { preferencias: null })
      })
      await batch.commit()
      mostrarMensaje(`${estudiantes.length} estudiantes reiniciados`)
    } catch (err) {
      mostrarMensaje('Error al reiniciar estudiantes: ' + err.message)
    }
    setConfirmandoReset(false)
  }

  if (cargando) {
    return (
      <div className="admin-panel">
        <div className="admin-loading">Cargando usuarios...</div>
      </div>
    )
  }

  const totalEstudiantes = usuarios.filter(u => u.rol === 'estudiante').length
  const estudiantesConPrefs = usuarios.filter(u => u.rol === 'estudiante' && u.preferencias)

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-top">
          <div>
            <h2 className="admin-title">Administración de usuarios</h2>
            <p className="admin-subtitle">{usuarios.length} usuarios · {totalEstudiantes} estudiantes ({estudiantesConPrefs.length} con horario configurado)</p>
          </div>
          {estudiantesConPrefs.length > 0 && (
            <button
              className="admin-btn-reset-global"
              onClick={reiniciarTodosEstudiantes}
              disabled={confirmandoReset}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Reiniciar todos los estudiantes
            </button>
          )}
        </div>
      </div>

      {mensaje && <div className="admin-toast">{mensaje}</div>}

      <div className="admin-tabla">
        <div className="admin-tabla-header">
          <span className="admin-col admin-col--foto"></span>
          <span className="admin-col admin-col--nombre">Nombre</span>
          <span className="admin-col admin-col--email">Email</span>
          <span className="admin-col admin-col--rol">Rol</span>
          <span className="admin-col admin-col--prefs">Horario</span>
          <span className="admin-col admin-col--estado">Estado</span>
          <span className="admin-col admin-col--acciones">Acciones</span>
        </div>

        {usuarios.map(u => {
          const prefs = u.preferencias
          const esEstudiante = u.rol === 'estudiante'

          return (
            <div key={u.id} className={`admin-fila ${!u.activo ? 'admin-fila--inactivo' : ''}`}>
              <div className="admin-col admin-col--foto">
                <div className="admin-avatar-wrapper">
                  {u.foto && (
                    <img
                      className="admin-avatar"
                      src={u.foto}
                      alt=""
                      onError={(e) => {
                        e.target.style.display = 'none'
                        const placeholder = e.target.parentElement.querySelector('.admin-avatar--placeholder')
                        if (placeholder) placeholder.style.display = 'flex'
                      }}
                    />
                  )}
                  <div
                    className="admin-avatar admin-avatar--placeholder"
                    style={{ display: u.foto ? 'none' : 'flex' }}
                  >
                    {(u.nombre || '?')[0].toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="admin-col admin-col--nombre">
                <span className="admin-nombre">{u.nombre || 'Sin nombre'}</span>
              </div>

              <div className="admin-col admin-col--email">
                <span className="admin-email">{u.email}</span>
              </div>

              <div className="admin-col admin-col--rol">
                {editandoRol === u.id ? (
                  <select
                    className="admin-select"
                    defaultValue={u.rol}
                    onChange={(e) => cambiarRol(u.id, e.target.value)}
                    onBlur={() => setEditandoRol(null)}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{ETIQUETAS_ROL[r]}</option>
                    ))}
                  </select>
                ) : (
                  <span
                    className="admin-rol-badge"
                    style={{ background: COLORES_ROL[u.rol] + '20', color: COLORES_ROL[u.rol], borderColor: COLORES_ROL[u.rol] + '40' }}
                  >
                    {ETIQUETAS_ROL[u.rol] || u.rol}
                  </span>
                )}
              </div>

              <div className="admin-col admin-col--prefs">
                {esEstudiante && prefs ? (
                  <div className="admin-prefs-badges">
                    <span className="admin-prefs-badge admin-prefs-badge--carrera" title="Carrera">
                      {prefs.carrera}
                    </span>
                    <span className="admin-prefs-badge admin-prefs-badge--grupo" title="Grupo">
                      {prefs.grupo}
                    </span>
                    <span className="admin-prefs-badge admin-prefs-badge--turno" title="Turno">
                      {prefs.turno}
                    </span>
                  </div>
                ) : esEstudiante ? (
                  <span className="admin-prefs-empty">Sin configurar</span>
                ) : prefs ? (
                  <span className="admin-prefs-docente">
                    {prefs.profesorLabel || prefs.profesorId}
                  </span>
                ) : (
                  <span className="admin-prefs-empty">—</span>
                )}
              </div>

              <div className="admin-col admin-col--estado">
                <span className={`admin-estado ${u.activo ? 'admin-estado--activo' : 'admin-estado--inactivo'}`}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="admin-col admin-col--acciones">
                {u.id !== usuario.uid && (
                  <div className="admin-acciones">
                    <button
                      className="admin-btn admin-btn--editar"
                      onClick={() => setEditandoRol(editandoRol === u.id ? null : u.id)}
                      title="Cambiar rol"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {esEstudiante && prefs && (
                      <button
                        className="admin-btn admin-btn--reset-prefs"
                        onClick={() => reiniciarPreferencias(u.id)}
                        title="Reiniciar horario (carrera, grupo, turno)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="1 4 1 10 7 10" />
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                      </button>
                    )}
                    <button
                      className={`admin-btn ${u.activo ? 'admin-btn--desactivar' : 'admin-btn--activar'}`}
                      onClick={() => toggleActivo(u.id, u.activo)}
                      title={u.activo ? 'Desactivar' : 'Activar'}
                    >
                      {u.activo ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                    <button
                      className="admin-btn admin-btn--eliminar"
                      onClick={() => eliminarUsuario(u.id)}
                      title="Eliminar usuario"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="admin-footer">
        <p>Los cambios de rol se aplican inmediatamente. No puedes modificar tu propio usuario.</p>
      </div>
    </div>
  )
}

export default AdminPanel
