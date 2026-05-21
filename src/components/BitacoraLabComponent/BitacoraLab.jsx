import { useState, useEffect } from 'react'
import { db, eliminarRegistroBitacora, LABORATORIOS } from '../../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import BitacoraForm from './BitacoraForm'
import './BitacoraLab.css'

function getRoomIcon(salon) {
  const s = salon?.toUpperCase() || ''
  const LABS_OFICIALES = ['503', '506', 'M14', 'M13', 'M12', 'M11', 'M02', 'M05', '102', '106', '109'];
  
  if (s.includes('LABORATORIO') || s.includes('LAB') || LABS_OFICIALES.some(l => s.includes(l))) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginRight: '6px', verticalAlign: 'middle'}}>
        <path d="M4.5 3h15M6 3v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3M6 14h12M10 3v5M14 3v5" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function BitacoraLab({ usuario, clasePrellenada, onLimpiarPrellenado }) {
  const [registros, setRegistros] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [labFiltro, setLabFiltro] = useState('Todos')
  const [cargando, setCargando] = useState(true)
  const [labImprimir, setLabImprimir] = useState('')
  const [modoImpresion, setModoImpresion] = useState(false)

  const esAdmin = usuario?.rol === 'admin' || usuario?.rol === 'superadmin'

  useEffect(() => {
    if (clasePrellenada) {
      setMostrarForm(true)
    }
  }, [clasePrellenada])

  const handleCloseForm = () => {
    setMostrarForm(false)
    onLimpiarPrellenado?.()
  }

  useEffect(() => {
    try {
      const q = query(collection(db, 'bitacora_lab'), orderBy('fecha', 'desc'))
      const unsub = onSnapshot(q, snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setRegistros(data)
        setCargando(false)
      }, err => {
        console.error('[BitacoraLab] Error en onSnapshot:', err)
        setCargando(false)
      })
      return unsub
    } catch (err) {
      console.error('[BitacoraLab] Error al iniciar suscripción:', err)
      setCargando(false)
    }
  }, [])

  const TOTAL_LINEAS = 15 

  const registrosImpresion = (() => {
    const base = registros.filter(r => r.laboratorio === labImprimir)
      .sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''))
    const vacias = Array(Math.max(0, TOTAL_LINEAS - base.length)).fill(null)
    return [...base, ...vacias].slice(0, TOTAL_LINEAS)
  })()

  if (modoImpresion) {
    return (
      <PrintView 
        laboratorio={labImprimir} 
        registros={registrosImpresion} 
        onVolver={() => setModoImpresion(false)} 
      />
    )
  }

  const filtered = labFiltro === 'Todos' ? registros : registros.filter(r => r.laboratorio === labFiltro)

  return (
    <div className="bl-container">
      <div className="bl-header">
        <div>
          <h2 className="bl-title">Bitácora de Uso de Laboratorios</h2>
          <p className="bl-subtitle">Formato oficial R-ADC-06-01 · Rev. 02</p>
        </div>
        <div className="bl-header__actions">
          <button className="bl-btn-add" onClick={() => setMostrarForm(true)}>
            <span>+</span> Nuevo Registro
          </button>
        </div>
      </div>

      <div className="bl-main-grid">
        <div className="bl-content-left">
          <div className="bl-controls">
            <div className="bl-filter-group">
              <label>Filtrar por Laboratorio:</label>
              <select className="bl-select" value={labFiltro} onChange={e => setLabFiltro(e.target.value)}>
                <option value="Todos">Todos los laboratorios</option>
                {LABORATORIOS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="bl-print-group">
              <label>Acciones de Reporte:</label>
              <div className="bl-print-controls">
                <select className="bl-select" value={labImprimir} onChange={e => setLabImprimir(e.target.value)}>
                  <option value="">-- Selecciona Lab --</option>
                  {LABORATORIOS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button 
                  disabled={!labImprimir} 
                  className="bl-btn-print"
                  onClick={() => setModoImpresion(true)}
                >
                  Imprimir Selección
                </button>
              </div>
            </div>
          </div>

          {cargando ? (
            <div className="bl-loading">Cargando bitácora...</div>
          ) : filtered.length === 0 ? (
            <div className="bl-empty">No hay registros para este laboratorio.</div>
          ) : (
            <div className="bl-tabla-wrapper">
              <table className="bl-tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Lab</th>
                    <th>Grupo</th>
                    <th>Materia</th>
                    <th>Alumnos</th>
                    <th>Horario</th>
                    {esAdmin && <th>Acción</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td>{r.fecha ? r.fecha.split('-').slice(1).reverse().join('/') : 'S/F'}</td>
                      <td>
                        {getRoomIcon(r.laboratorio)}
                        <strong>{r.laboratorio || 'S/L'}</strong>
                      </td>
                      <td>{r.grupo || 'S/G'}</td>
                      <td title={r.materia}>{String(r.materia || '').substring(0, 20)}{String(r.materia || '').length > 20 ? '...' : ''}</td>
                      <td>{r.totalUsuarios || 0}</td>
                      <td>{r.horaEntrada || '??'}-{r.horaSalida || '??'}</td>
                      {esAdmin && (
                        <td>
                          <button className="bl-btn-del" onClick={async () => {
                            if (confirm('¿Eliminar este registro?')) {
                              await eliminarRegistroBitacora(r.id)
                            }
                          }}>🗑</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bl-content-right no-print">
          <div className="bl-preview-card">
            <div className="bl-preview-header">
              <span className="bl-preview-badge">Vista Previa Oficial</span>
              <h3>R-ADC-06-01</h3>
            </div>
            <div className="bl-preview-mini-wrap">
               {labImprimir ? (
                 <div className="bl-mini-doc">
                    <PrintViewContent laboratorio={labImprimir} registros={registrosImpresion} mini />
                 </div>
               ) : (
                 <div className="bl-preview-empty">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                   </svg>
                   <p>Selecciona un laboratorio para previsualizar el documento oficial</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {mostrarForm && (
        <BitacoraForm
          usuario={usuario}
          clasePrellenada={clasePrellenada}
          onClose={handleCloseForm}
          onGuardado={handleCloseForm}
        />
      )}
    </div>
  )
}

function PrintView({ laboratorio, registros, onVolver }) {
  return (
    <div className="bl-print-page-wrapper">
      <div className="bl-print-toolbar no-print">
        <button onClick={onVolver}>← Volver</button>
        <button onClick={() => window.print()} className="bl-print-toolbar-btn">🖨 Imprimir Bitácora</button>
      </div>
      <PrintViewContent laboratorio={laboratorio} registros={registros} />
    </div>
  )
}

function PrintViewContent({ laboratorio, registros, mini = false }) {
  return (
    <div className={`bl-print-page ${mini ? 'bl-printable--mini' : ''}`}>
      <table className="bl-pt-unified">
        <thead>
          <tr className="bl-head-row">
            <td colSpan="4" rowSpan="3" className="bl-head-logo-cell">
              <img src="/utj_logo.png" alt="UTJ Logo" className="bl-head-logo-img" />
            </td>
            <td colSpan="7" className="bl-head-empty-cell"></td>
            <td className="bl-head-code-cell" colSpan="2">R-ADC-06-01</td>
          </tr>
          <tr className="bl-head-row">
            <td colSpan="7" rowSpan="2" className="bl-head-title-cell">
              BITÁCORA DE USO DE TALLERES Y LABORATORIOS
            </td>
            <td className="bl-head-code-cell" colSpan="2">Rev. 02</td>
          </tr>
          <tr className="bl-head-row">
            <td className="bl-head-code-cell" colSpan="2">14-03-2025</td>
          </tr>
          
          <tr className="bl-head-spacer-row"><td colSpan="13"></td></tr>

          <tr className="bl-head-info-row">
            <td colSpan="6" className="bl-head-empty-cell"></td>
            <td colSpan="4" className="bl-head-label-cell">TALLER/LABORATORIO:</td>
            <td colSpan="3" className="bl-head-value-cell">{laboratorio || '__________'}</td>
          </tr>
          <tr className="bl-head-info-row">
            <td colSpan="6" className="bl-head-empty-cell"></td>
            <td colSpan="4" className="bl-head-label-cell">CARRERA:</td>
            <td colSpan="3" className="bl-head-value-cell">UA CCD UTJ</td>
          </tr>

          <tr className="bl-head-spacer-row"><td colSpan="13"></td></tr>

          <tr className="bl-data-header-row">
            <th style={{width: '6%'}}>Fecha</th>
            <th style={{width: '12%'}}>Personal responsable</th>
            <th style={{width: '9%'}}>Carrera / Dependencia</th>
            <th style={{width: '6%'}}>Grupo</th>
            <th style={{width: '5%'}}>Turno</th>
            <th style={{width: '7%'}} className="c-tot">Total de<br/>usuarios/as</th>
            <th style={{width: '18%'}}>Actividad-Materia</th>
            <th style={{width: '8%'}}>Horario</th>
            <th style={{width: '14%'}}>Firma del personal<br/>responsable</th>
            <th style={{width: '15%'}} colSpan="4">Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r, i) => r ? (
            <tr key={r.id} className="bl-data-row">
              <td className="bl-center">{r.fecha ? r.fecha.split('-').reverse().join('/') : ''}</td>
              <td>{r.docenteNombre}</td>
              <td className="bl-center">UA CCD UTJ</td>
              <td className="bl-center">{r.grupo?.split(' ')[1] || r.grupo}</td>
              <td className="c-turno">{r.turno === 'M' ? 'Matutino' : r.turno === 'V' ? 'Vespertino' : r.turno}</td>
              <td className="c-tot">{r.totalUsuarios}</td>
              <td><strong>{r.actividad}</strong> - {r.materia}</td>
              <td className="c-hor">{r.horaEntrada}-{r.horaSalida}</td>
              <td></td>
              <td colSpan="4">{r.observaciones}</td>
            </tr>
          ) : (
            <tr key={`empty-${i}`} className="bl-data-row">
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td colSpan="4"></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bl-print-leyenda">
        <p><strong>Clave para el llenado de actividad:</strong> <strong>CP</strong> (Clase Programada), <strong>CNP</strong> (Clase no programada), <strong>O</strong> (Otros).</p>
      </div>
    </div>
  )
}

export default BitacoraLab