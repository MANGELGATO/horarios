import { useState, useMemo } from 'react'
import { horarios } from '../../data/horarios'
import { guardarPreferencias, slugify } from '../../firebase'
import './SetupProfile.css'

function SetupProfile({ usuario, onCompletado }) {
  const [turno, setTurno] = useState('')
  const [carrera, setCarrera] = useState('')
  const [grupo, setGrupo] = useState('')
  const [profesorId, setProfesorId] = useState('')
  const [guardando, setGuardando] = useState(false)

  const profesoresDisponibles = useMemo(() => {
    return [...new Set(horarios.map(h => h.profesor))].sort()
  }, [])

  const turnosDisponibles = [...new Set(horarios.map(h => h.turno))].sort()

  const carrerasDisponibles = useMemo(() => {
    if (!turno) return []
    return [...new Set(
      horarios.filter(h => h.turno === turno).map(h => h.carrera)
    )].sort()
  }, [turno])

  const gruposDisponibles = useMemo(() => {
    if (!carrera || !turno) return []
    return [...new Set(
      horarios
        .filter(h => h.carrera === carrera && h.turno === turno)
        .map(h => h.grupo)
    )].sort()
  }, [carrera, turno])

  const gruposAgrupados = {}
  gruposDisponibles.forEach(g => {
    const letra = g.replace(/\d/g, '')
    if (!gruposAgrupados[letra]) gruposAgrupados[letra] = []
    gruposAgrupados[letra].push(g)
  })

  const handleGuardar = async () => {
    if (usuario.rol === 'docente') {
      if (!profesorId) return
      setGuardando(true)
      const prefs = { tipo: 'docente', profesorId: slugify(profesorId), profesorLabel: profesorId }
      await guardarPreferencias(usuario.uid, prefs)
      onCompletado({ ...usuario, preferencias: prefs })
    } else {
      if (!turno || !carrera || !grupo) return
      setGuardando(true)
      const prefs = { tipo: 'estudiante', carrera, turno, grupo }
      await guardarPreferencias(usuario.uid, prefs)
      onCompletado({ ...usuario, preferencias: prefs })
    }
  }

  return (
    <div className="setup-overlay">
      <div className="setup-card">
        <div className="setup-header">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="14" height="14" rx="3" fill="currentColor" opacity="0.9" />
            <rect x="22" y="4" width="14" height="14" rx="3" fill="currentColor" opacity="0.6" />
            <rect x="4" y="22" width="14" height="14" rx="3" fill="currentColor" opacity="0.6" />
            <rect x="22" y="22" width="14" height="14" rx="3" fill="currentColor" opacity="0.3" />
          </svg>
          <h2>Bienvenido, {usuario.nombre?.split(' ')[0] || 'alumno'}</h2>
          <p>Selecciona tu horario</p>
        </div>

        <div className="setup-form">
          {usuario.rol === 'docente' ? (
            <div className="setup-field">
              <label>Tu Nombre / Profesor</label>
              <select value={profesorId} onChange={e => setProfesorId(e.target.value)}>
                <option value="">Selecciona tu nombre</option>
                {profesoresDisponibles.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="setup-field">
                <label>Turno</label>
                <select value={turno} onChange={e => { setTurno(e.target.value); setCarrera(''); setGrupo('') }}>
                  <option value="">Selecciona tu turno</option>
                  {turnosDisponibles.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="setup-field">
                <label>Carrera</label>
                <select value={carrera} onChange={e => { setCarrera(e.target.value); setGrupo('') }} disabled={!turno}>
                  <option value="">Selecciona tu carrera</option>
                  {carrerasDisponibles.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="setup-field">
                <label>Grupo</label>
                <select value={grupo} onChange={e => setGrupo(e.target.value)} disabled={!carrera}>
                  <option value="">Selecciona tu grupo</option>
                  {Object.entries(gruposAgrupados).map(([letra, grps]) => (
                    <optgroup key={letra} label={`Cuatrimestre ${letra}`}>
                      {grps.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            className="setup-btn"
            onClick={handleGuardar}
            disabled={(usuario.rol === 'docente' ? !profesorId : (!turno || !carrera || !grupo)) || guardando}
          >
            {guardando ? 'Guardando...' : 'Ver mi horario'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SetupProfile
