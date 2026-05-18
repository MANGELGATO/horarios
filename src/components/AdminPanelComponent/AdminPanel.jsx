// AdminPanel.jsx
import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../firebase'
import './AdminPanel.css'

const ROLES = ['estudiante', 'docente', 'admin']
const ETIQUETAS_ROL = { estudiante: 'Estudiante', docente: 'Docente', admin: 'Admin', superadmin: 'Super Admin' }
const ETIQUETAS_CORTAS = { estudiante: 'Estu', docente: 'Doc', admin: 'Admin', superadmin: 'S.Admin' }
const COLORES_ROL = { estudiante: '#2e7d32', docente: '#1565c0', admin: '#c62828', superadmin: '#b71c1c' }

function AdminPanel({ usuario }) {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editandoRol, setEditandoRol] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [confirmandoReset, setConfirmandoReset] = useState(false)
  const [vistaTarjetas, setVistaTarjetas] = useState(false)

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

  useEffect(() => {
    const handleResize = () => {
      setVistaTarjetas(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
    if (!confirm('¿Reiniciar preferencias de TODOS los estudiantes?\n\nEsto borrará su carrera, grupo y turno guardados.\nTendrán que configurarlo de nuevo al iniciar sesión.')) return
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

  // Componente de tarjeta para móvil
  const TarjetaUsuario = ({ u }) => {
    const prefs = u.preferencias
    const esEstudiante = u.rol === 'estudiante'

    return (
      <div className={`admin-tarjeta ${!u.activo ? 'admin-tarjeta--inactivo' : ''}`}>
        <div className="admin-tarjeta-header">
          <div className="admin-tarjeta-avatar">
            {u.foto ? (
              <img className="admin-avatar" src={u.foto} alt="" />
            ) : (
              <div className="admin-avatar admin-avatar--placeholder">
                {(u.nombre || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="admin-tarjeta-info">
            <div className="admin-tarjeta-nombre">{u.nombre || 'Sin nombre'}</div>
            <div className="admin-tarjeta-email">{u.email}</div>
          </div>
          <div className="admin-tarjeta-acciones">
            {u.id !== usuario.uid && (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="admin-tarjeta-body">
          <div className="admin-tarjeta-campo">
            <span className="admin-tarjeta-campo-label">Rol:</span>
            {editandoRol === u.id ? (
              <select
                className="admin-select"
                defaultValue={u.rol}
                onChange={(e) => cambiarRol(u.id, e.target.value)}
                onBlur={() => setEditandoRol(null)}
                autoFocus
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{ETIQUETAS_ROL[r]}</option>
                ))}
              </select>
            ) : (
              <span
                className="admin-rol-badge"
                style={{ background: COLORES_ROL[u.rol] + '20', color: COLORES_ROL[u.rol] }}
              >
                {ETIQUETAS_ROL[u.rol] || u.rol}
              </span>
            )}
          </div>

          <div className="admin-tarjeta-campo">
            <span className="admin-tarjeta-campo-label">Estado:</span>
            <span className={`admin-estado ${u.activo ? 'admin-estado--activo' : 'admin-estado--inactivo'}`}>
              {u.activo ? 'Activo' : 'Inactivo'}
            </span>
            {u.id !== usuario.uid && (
              <button
                className={`admin-btn-small ${u.activo ? 'admin-btn-small--desactivar' : 'admin-btn-small--activar'}`}
                onClick={() => toggleActivo(u.id, u.activo)}
              >
                {u.activo ? 'Desactivar' : 'Activar'}
              </button>
            )}
          </div>

          {esEstudiante && (
            <div className="admin-tarjeta-campo">
              <span className="admin-tarjeta-campo-label">Horario:</span>
              {prefs ? (
                <div className="admin-prefs-badges">
                  <span className="admin-prefs-badge admin-prefs-badge--carrera">{prefs.carrera}</span>
                  <span className="admin-prefs-badge admin-prefs-badge--grupo">{prefs.grupo}</span>
                  <span className="admin-prefs-badge admin-prefs-badge--turno">{prefs.turno}</span>
                </div>
              ) : (
                <span className="admin-prefs-empty">Sin configurar</span>
              )}
              {prefs && u.id !== usuario.uid && (
                <button
                  className="admin-btn-small admin-btn-small--reset"
                  onClick={() => reiniciarPreferencias(u.id)}
                >
                  Reiniciar
                </button>
              )}
            </div>
          )}

          {!esEstudiante && prefs && (
            <div className="admin-tarjeta-campo">
              <span className="admin-tarjeta-campo-label">Preferencias:</span>
              <span className="admin-prefs-docente">{prefs.profesorLabel || prefs.profesorId || 'Configurado'}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

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

      {vistaTarjetas ? (
        // Vista de tarjetas para móvil
        <div className="admin-tarjetas">
          {usuarios.map(u => (
            <TarjetaUsuario key={u.id} u={u} />
          ))}
        </div>
      ) : (
        // Vista de tabla para desktop
        <div className="admin-tabla-container">
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
                          <option key={r} value={r}>{ETIQUETAS_CORTAS[r]}</option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="admin-rol-badge"
                        title={ETIQUETAS_ROL[u.rol] || u.rol}
                        style={{ background: COLORES_ROL[u.rol] + '20', color: COLORES_ROL[u.rol], borderColor: COLORES_ROL[u.rol] + '40' }}
                      >
                        {ETIQUETAS_CORTAS[u.rol] || u.rol}
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
        </div>
      )}

      <div className="admin-footer">
        <p>Los cambios de rol se aplican inmediatamente. No puedes modificar tu propio usuario.</p>
      </div>
    </div>
  )
}

export default AdminPanel