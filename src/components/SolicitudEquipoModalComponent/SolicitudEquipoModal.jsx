import { useState } from 'react'
import { guardarSolicitudEquipo } from '../../firebase'
import './SolicitudEquipoModal.css'

const EQUIPO_OPCIONES = ['Proyector', 'Pantalla', 'Cable HDMI', 'Bocinas', 'Adaptador Tipo-C']

function SolicitudEquipoModal({ usuario, horariosProfesor, onClose }) {
  const [claseIndex, setClaseIndex] = useState('')
  const [equipos, setEquipos] = useState([])
  const [tipo, setTipo] = useState('unica')
  const [fechaFocal, setFechaFocal] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const handleToggleEquipo = (eq) => {
    setEquipos(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (claseIndex === '' || equipos.length === 0) {
      setMensaje('Por favor, selecciona una clase y al menos un equipo.')
      return
    }
    if (tipo === 'unica' && !fechaFocal) {
      setMensaje('Por favor, selecciona una fecha.')
      return
    }

    const claseSeleccionada = horariosProfesor[parseInt(claseIndex)]

    setGuardando(true)
    setMensaje('')

    try {
      await guardarSolicitudEquipo({
        profesorId: usuario.uid,
        profesorNombre: usuario.nombre,
        claseInfo: {
          materia: claseSeleccionada.materia,
          grupo: claseSeleccionada.grupo,
          dia: claseSeleccionada.dia,
          turno: claseSeleccionada.turno,
          salon: claseSeleccionada.salon,
          bloque: claseSeleccionada.bloque,
        },
        equipo: equipos,
        tipo,
        fechaFocal: tipo === 'unica' ? fechaFocal : null,
      })
      onClose()
    } catch (err) {
      setMensaje('Error al guardar la solicitud.')
      setGuardando(false)
    }
  }

  return (
    <div className="solicitud-modal-overlay">
      <div className="solicitud-modal">
        <div className="solicitud-modal__header">
          <h2>Solicitar Equipo</h2>
          <button className="solicitud-modal__close" onClick={onClose} disabled={guardando}>✕</button>
        </div>

        <form className="solicitud-modal__form" onSubmit={handleSubmit}>
          
          <div className="solicitud-field">
            <label>1. Selecciona la clase</label>
            <select value={claseIndex} onChange={e => setClaseIndex(e.target.value)} disabled={guardando}>
              <option value="">-- Elige una clase --</option>
              {horariosProfesor.map((c, i) => (
                <option key={i} value={i}>
                  {c.dia} · {c.materia} · {c.grupo} ({c.salon})
                </option>
              ))}
            </select>
          </div>

          <div className="solicitud-field">
            <label>2. Frecuencia de uso</label>
            <div className="solicitud-radio-group">
              <label className="solicitud-radio">
                <input type="radio" name="tipo" value="unica" checked={tipo === 'unica'} onChange={() => setTipo('unica')} disabled={guardando} />
                Solo una fecha
              </label>
              <label className="solicitud-radio">
                <input type="radio" name="tipo" value="recurrente" checked={tipo === 'recurrente'} onChange={() => setTipo('recurrente')} disabled={guardando} />
                Todas las semanas
              </label>
            </div>
          </div>

          {tipo === 'unica' && (
            <div className="solicitud-field">
              <label>Fecha del préstamo</label>
              <input type="date" value={fechaFocal} onChange={e => setFechaFocal(e.target.value)} disabled={guardando} />
            </div>
          )}

          <div className="solicitud-field">
            <label>3. ¿Qué necesitas?</label>
            <div className="solicitud-checkbox-group">
              {EQUIPO_OPCIONES.map(eq => (
                <label key={eq} className="solicitud-checkbox">
                  <input 
                    type="checkbox" 
                    checked={equipos.includes(eq)} 
                    onChange={() => handleToggleEquipo(eq)} 
                    disabled={guardando}
                  />
                  {eq}
                </label>
              ))}
            </div>
          </div>

          {mensaje && <p className="solicitud-mensaje">{mensaje}</p>}

          <div className="solicitud-modal__footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={guardando}>Cancelar</button>
            <button type="submit" className="btn-submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Confirmar Solicitud'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default SolicitudEquipoModal
