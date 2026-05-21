import { useState, useMemo } from 'react'
import { guardarRegistroBitacora, LABORATORIOS, ACTIVIDADES } from '../../firebase'
import { horarios } from '../../data/horarios'
import './BitacoraForm.css'

const HORAS_ENTRADA = {
  M: ['07:00', '07:50', '09:10', '10:00', '10:50', '11:40', '12:30', '13:20'],
  V: ['15:30', '16:20', '17:10', '18:00', '19:10', '20:00', '20:50', '21:40']
}
const HORAS_SALIDA = {
  M: ['07:50', '08:40', '10:00', '10:50', '11:40', '12:30', '13:20', '14:10'],
  V: ['16:20', '17:10', '18:00', '18:50', '20:00', '20:50', '21:40', '22:30']
}

function BitacoraForm({ usuario, onClose, onGuardado, clasePrellenada }) {
  const hoy = new Date().toISOString().split('T')[0]

  const [laboratorio, setLaboratorio] = useState(() => {
    if (clasePrellenada?.salon) {
      const match = clasePrellenada.salon.match(/(M0\d|M\d+|PB\d+)/i)
      return match ? match[0].toUpperCase() : ''
    }
    return ''
  })
  const [fecha, setFecha] = useState(hoy)
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(() => {
    if (!clasePrellenada) return ''
    const carreras = (clasePrellenada.carrera || '').split(' / ')
    const grupos = (clasePrellenada.grupo || '').split(' / ')
    if (carreras.length > 1 && grupos.length === carreras.length) {
      return carreras.map((c, i) => `${c.trim()} ${grupos[i].trim()}`).join(' / ')
    }
    return `${clasePrellenada.carrera || ''} ${clasePrellenada.grupo || ''}`.trim()
  })
  const [grupoInput, setGrupoInput] = useState('')
  const [turno, setTurno] = useState(clasePrellenada?.turno === 'Vespertino' ? 'V' : 'M')
  const [totalUsuarios, setTotalUsuarios] = useState('')
  const [actividad, setActividad] = useState('CP')
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(clasePrellenada?.materia || '')
  const [materiaInput, setMateriaInput] = useState('')

  const getHoraBloque = (bloqueId, t, tipo) => {
    const mapa = tipo === 'entrada' ? HORAS_ENTRADA : HORAS_SALIDA
    const tKey = t === 'Vespertino' ? 'V' : 'M'
    return mapa[tKey][bloqueId - 1] || ''
  }

  const [entradaSeleccionada, setEntradaSeleccionada] = useState(clasePrellenada ? getHoraBloque(clasePrellenada.bloque, clasePrellenada.turno, 'entrada') : '')
  const [entradaInput, setEntradaInput] = useState('')
  const [salidaSeleccionada, setSalidaSeleccionada] = useState(clasePrellenada ? getHoraBloque(clasePrellenada.bloque, clasePrellenada.turno, 'salida') : '')
  const [salidaInput, setSalidaInput] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleTurnoChange = (newTurno) => {
    setTurno(newTurno)
    setEntradaSeleccionada('')
    setSalidaSeleccionada('')
  }

  // Listas para autocompletado
  const gruposSugeridos = useMemo(() => {
    const set = new Set(horarios.map(h => `${h.carrera} ${h.grupo}`))
    return Array.from(set).sort()
  }, [])

  const materiasSugeridas = useMemo(() => {
    const set = new Set(horarios.map(h => h.materia))
    return Array.from(set).sort()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const finalGrupo = grupoSeleccionado || grupoInput
    const finalMateria = materiaSeleccionada || materiaInput
    const finalEntrada = entradaSeleccionada || entradaInput
    const finalSalida = salidaSeleccionada || salidaInput

    if (!laboratorio || !finalGrupo || !totalUsuarios || !finalMateria || !finalEntrada || !finalSalida) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }

    setGuardando(true)
    try {
      await guardarRegistroBitacora({
        laboratorio,
        fecha,
        grupo: finalGrupo,
        turno,
        totalUsuarios: parseInt(totalUsuarios),
        actividad,
        materia: finalMateria,
        docenteNombre: usuario.nombre,
        profesorId: usuario.preferencias?.profesorId || 'anonimo',
        horaEntrada: finalEntrada,
        horaSalida: finalSalida,
        observaciones,
        creadoPor: usuario.uid
      })
      onGuardado()
    } catch (err) {
      setError('Error al guardar el registro. Reintenta.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="bf-overlay">
      <div className="bf-modal">
        <div className="bf-header">
          <h3>Nuevo Registro de Bitácora</h3>
          <button className="bf-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="bf-form">
          {error && <div className="bf-error">{error}</div>}

          <div className="bf-grid">
            <div className="bf-field">
              <label>Laboratorio *</label>
              <select value={laboratorio} onChange={e => setLaboratorio(e.target.value)}>
                <option value="">-- Selecciona --</option>
                {LABORATORIOS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="bf-field">
              <label>Fecha *</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>

            <div className="bf-field">
              <label>Carrera y Grupo *</label>
              <input 
                list="grupos-list" 
                value={grupoSeleccionado || grupoInput} 
                onChange={e => {
                  setGrupoSeleccionado('')
                  setGrupoInput(e.target.value)
                }}
                placeholder="Ej: IEVND 4-A"
              />
              <datalist id="grupos-list">
                {gruposSugeridos.map(g => <option key={g} value={g} />)}
              </datalist>
            </div>

            <div className="bf-field">
              <label>Turno *</label>
              <div className="bf-radio-group">
                <label className={turno === 'M' ? 'active' : ''}>
                  <input type="radio" name="turno" value="M" checked={turno === 'M'} onChange={() => handleTurnoChange('M')} /> Matutino
                </label>
                <label className={turno === 'V' ? 'active' : ''}>
                  <input type="radio" name="turno" value="V" checked={turno === 'V'} onChange={() => handleTurnoChange('V')} /> Vespertino
                </label>
              </div>
            </div>

            <div className="bf-field">
              <label>Total Usuarios *</label>
              <input type="number" min="1" value={totalUsuarios} onChange={e => setTotalUsuarios(e.target.value)} placeholder="Ej: 25" />
            </div>

            <div className="bf-field">
              <label>Actividad *</label>
              <select value={actividad} onChange={e => setActividad(e.target.value)}>
                {Object.entries(ACTIVIDADES).map(([k, v]) => <option key={k} value={k}>{v} ({k})</option>)}
              </select>
            </div>

            <div className="bf-field bf-field--wide">
              <label>Nombre de la Materia *</label>
              <input 
                list="materias-list"
                value={materiaSeleccionada || materiaInput}
                onChange={e => {
                  setMateriaSeleccionada('')
                  setMateriaInput(e.target.value)
                }}
                placeholder="Escribe el nombre de la materia"
              />
              <datalist id="materias-list">
                {materiasSugeridas.map(m => <option key={m} value={m} />)}
              </datalist>
            </div>

            <div className="bf-field">
              <label>Hora Entrada *</label>
              <select value={entradaSeleccionada} onChange={e => setEntradaSeleccionada(e.target.value)}>
                <option value="">-- Elige bloque --</option>
                {HORAS_ENTRADA[turno].map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <input 
                type="time" 
                value={entradaInput} 
                onChange={e => {
                  setEntradaSeleccionada('')
                  setEntradaInput(e.target.value)
                }} 
                placeholder="U otra hora..."
              />
            </div>

            <div className="bf-field">
              <label>Hora Salida *</label>
              <select value={salidaSeleccionada} onChange={e => setSalidaSeleccionada(e.target.value)}>
                <option value="">-- Elige bloque --</option>
                {HORAS_SALIDA[turno].map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <input 
                type="time" 
                value={salidaInput} 
                onChange={e => {
                  setSalidaSeleccionada('')
                  setSalidaInput(e.target.value)
                }} 
                placeholder="U otra hora..."
              />
            </div>

            <div className="bf-field bf-field--wide">
              <label>Observaciones</label>
              <textarea 
                rows="2" 
                value={observaciones} 
                onChange={e => setObservaciones(e.target.value)}
                placeholder="Incidencias, equipo dañado, etc."
              />
            </div>
          </div>

          <div className="bf-footer">
            <button type="button" className="bf-btn-cancel" onClick={onClose} disabled={guardando}>Cancelar</button>
            <button type="submit" className="bf-btn-submit" disabled={guardando}>
              {guardando ? 'Guardando...' : '✓ Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BitacoraForm
