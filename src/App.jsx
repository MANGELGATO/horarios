import { useState, useEffect, useMemo, useCallback } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom'
import { auth, obtenerCrearPerfilUsuario, db } from './firebase'
import { horarios as horariosEstaticos, getClasesActuales, getClasesProximas, getClasesTerminando, getPiso, getTurnoActual, slugify } from './data/horarios'
import { generarICS, descargarICS } from './utils/calendar'
import Navbar from './components/NavbarComponent/Navbar'
import CurrentClassPanel from './components/CurrentClassPanelComponent/CurrentClassPanel'
import ProjectorPanel from './components/ProjectorPanelComponent/ProjectorPanel'
import ProjectorCard from './components/ProjectorCardComponent/ProjectorCard'
import FiltersBar from './components/FiltersBarComponent/FiltersBar'
import WeeklyTable from './components/WeeklyTableComponent/WeeklyTable'
import RoomCard from './components/RoomCardComponent/RoomCard'
import LoginPage from './components/LoginPage/LoginPage'
import InfoPage from './components/InfoPage/InfoPage'
import PrintPage from './components/PrintPageComponent/PrintPage'
import AdminPanel from './components/AdminPanelComponent/AdminPanel'
import SetupProfile from './components/SetupProfileComponent/SetupProfile'
import ViewSelector from './components/ViewSelectorComponent/ViewSelector'
import SolicitudEquipoModal from './components/SolicitudEquipoModalComponent/SolicitudEquipoModal'
import MisClases from './components/MisClasesComponent/MisClases'
import BitacoraLab from './components/BitacoraLabComponent/BitacoraLab'
import './App.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const vista = location.pathname.replace(/^\//, '') || 'tabla'

  const setVista = useCallback((key) => {
    navigate('/' + key)
  }, [navigate])

  useEffect(() => {
    const handleCambiarVista = (e) => {
      if (e.detail) navigate('/' + e.detail)
    }
    window.addEventListener('cambiar-vista', handleCambiarVista)
    return () => window.removeEventListener('cambiar-vista', handleCambiarVista)
  }, [navigate])
  const [carreraFiltro, setCarreraFiltro] = useState('Todas')
  const [turnoFiltro, setTurnoFiltro] = useState('Todos')
  const [grupoFiltro, setGrupoFiltro] = useState('Todos')
  const [diaFiltro, setDiaFiltro] = useState('Todos')
  const [salonFiltro, setSalonFiltro] = useState('Todos')
  const [profesorFiltro, setProfesorFiltro] = useState('Todos')
  const [pisoFiltro, setPisoFiltro] = useState('Todos')
  const [clasesAhora, setClasesAhora] = useState([])
  const [clasesProximas, setClasesProximas] = useState([])
  const [clasesProximas10, setClasesProximas10] = useState([])
  const [clasesTerminando, setClasesTerminando] = useState([])
  const [turnoActual, setTurnoActual] = useState(getTurnoActual())
  const [usuario, setUsuario] = useState(null)
  const [authCargando, setAuthCargando] = useState(true)
  const [mostrarInfo, setMostrarInfo] = useState(false)
  const [tema, setTema] = useState(() => {
    return localStorage.getItem('tema-horarios') || 'claro'
  })
  const [simulacion, setSimulacion] = useState({
    activo: false,
    dia: 'Lunes',
    hora: '07:00'
  })
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false)
  const [mostrarAyudaICS, setMostrarAyudaICS] = useState(false)
  const [solicitudesEquipo, setSolicitudesEquipo] = useState([])
  const [horariosFirestore, setHorariosFirestore] = useState(null)
  const [claseParaBitacora, setClaseParaBitacora] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'solicitudes_equipo'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setSolicitudesEquipo(data)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'horarios'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setHorariosFirestore(null)
        return
      }
      const data = snapshot.docs.map(doc => {
        const d = doc.data()
        return {
          carrera: d.carrera || d.carreraLabel || '',
          turno: d.turno || d.turnoLabel || '',
          grupo: d.grupo || d.grupoLabel || '',
          dia: d.dia || '',
          diaVirtual: d.diaVirtual || '',
          bloque: Number(d.bloque ?? d.bloqueNumero ?? 1),
          materia: d.materia || d.materiaLabel || '',
          profesor: d.profesor || d.profesorLabel || '',
          salon: d.salon || d.salonLabel || '',
          proyector: d.proyector || d.proyectorAsignado || '',
        }
      })
      setHorariosFirestore(data)
    }, (error) => {
      console.warn('[Firestore] Error al cargar horarios, usando datos estáticos:', error)
      setHorariosFirestore(null)
    })
    return unsubscribe
  }, [])

  const fuenteHorarios = horariosFirestore || horariosEstaticos

  const horariosDinamicos = useMemo(() => {
    const arr = fuenteHorarios.map(h => ({ ...h }))
    const hoyDate = new Date()
    const hoyStr = hoyDate.getFullYear() + '-' + String(hoyDate.getMonth()+1).padStart(2, '0') + '-' + String(hoyDate.getDate()).padStart(2, '0')

    solicitudesEquipo.forEach(req => {
      const isMatch = (h) => 
        h.materia === req.claseInfo.materia &&
        h.grupo === req.claseInfo.grupo &&
        h.dia === req.claseInfo.dia &&
        h.turno === req.claseInfo.turno &&
        h.salon === req.claseInfo.salon &&
        h.bloque === req.claseInfo.bloque;

      const applies = req.tipo === 'recurrente' || req.fechaFocal === hoyStr;

      if (applies) {
        arr.forEach(h => {
          if (isMatch(h)) {
            const eqStr = req.equipo.join(' + ')
            h.proyector = h.proyector ? `${h.proyector} | Req: ${eqStr}` : `Req: ${eqStr}`
          }
        })
      }
    })
    return arr
  }, [solicitudesEquipo, fuenteHorarios])

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', tema === 'oscuro')
    localStorage.setItem('tema-horarios', tema)
  }, [tema])

  const esServicio = usuario?.rol === 'servicio'
  const necesitaSetup = usuario && !usuario.preferencias && (usuario.rol === 'estudiante' || usuario.rol === 'docente')
  const esAdmin = usuario?.rol === 'admin' || usuario?.rol === 'superadmin'
  const esDocente = usuario?.rol === 'docente' || usuario?.preferencias?.tipo === 'docente'
  const esEstudianteFiltrado = usuario?.preferencias?.tipo === 'estudiante' && !esAdmin && !esServicio

  const vistasPermitidas = {
    tabla: true,
    salones: !esEstudianteFiltrado,
    proyectores: esAdmin || esServicio,
    print: esAdmin || esServicio,
    admin: esAdmin,
    'mis-clases': esDocente,
    'bitacora': esAdmin
  }

  useEffect(() => {
    if (usuario && vista !== 'tabla' && !vistasPermitidas[vista]) {
      navigate('/tabla')
    }
  }, [usuario, vista, navigate])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const perfil = await obtenerCrearPerfilUsuario(firebaseUser)
          setUsuario({
            nombre: perfil.nombre,
            email: perfil.email,
            foto: perfil.foto,
            uid: perfil.uid,
            rol: perfil.rol,
            activo: perfil.activo,
            preferencias: perfil.preferencias || null,
          })
        } catch (err) {
          console.error('Error al cargar perfil:', err)
          setUsuario(null)
        }
      } else {
        setUsuario(null)
      }
      setAuthCargando(false)
    })
    return unsubscribe
  }, [])

  const prefsFilter = useMemo(() => {
    if (esAdmin || esServicio) return null
    if (!usuario?.preferencias) return null
    const p = usuario.preferencias
    if (p.tipo === 'estudiante') {
      return (h) => h.carrera === p.carrera && h.grupo === p.grupo && h.turno === p.turno
    }
    if (p.tipo === 'docente') {
      return (h) => slugify(h.profesor) === p.profesorId
    }
    return null
  }, [usuario?.preferencias, esAdmin, esServicio])

  const baseHorarios = useMemo(() => {
    if (esAdmin || esDocente || esServicio) return horariosDinamicos
    if (prefsFilter) return horariosDinamicos.filter(prefsFilter)
    return horariosDinamicos
  }, [prefsFilter, horariosDinamicos, esAdmin, esDocente])

  const filtrarPorPrefs = useMemo(() => {
    if (!prefsFilter) return (c) => c
    return (clases) => clases.filter(prefsFilter)
  }, [prefsFilter])

  useEffect(() => {
    const actualizar = () => {
      setClasesAhora(filtrarPorPrefs(getClasesActuales(simulacion, horariosDinamicos)))
      setClasesProximas(filtrarPorPrefs(getClasesProximas(5, simulacion, horariosDinamicos)))
      setClasesProximas10(filtrarPorPrefs(getClasesProximas(10, simulacion, horariosDinamicos)))
      setClasesTerminando(filtrarPorPrefs(getClasesTerminando(5, simulacion, horariosDinamicos)))
      setTurnoActual(getTurnoActual(simulacion))
    }
    actualizar()
    const intervalo = setInterval(actualizar, 60000)
    return () => clearInterval(intervalo)
  }, [filtrarPorPrefs, simulacion, horariosDinamicos])

  useEffect(() => {
    if (!vistasPermitidas[vista]) setVista('tabla')
  }, [usuario, vista])

  useEffect(() => {
    if (carreraFiltro === 'Todas') return
    const validos = ['Todas', ...new Set(
      baseHorarios.filter(h => turnoFiltro === 'Todos' || h.turno === turnoFiltro).map(h => h.carrera)
    )]
    if (!validos.includes(carreraFiltro)) setCarreraFiltro('Todas')
  }, [turnoFiltro, baseHorarios])

  useEffect(() => {
    if (turnoFiltro === 'Todos') return
    const validos = ['Todos', ...new Set(
      baseHorarios.filter(h => carreraFiltro === 'Todas' || h.carrera === carreraFiltro).map(h => h.turno)
    )]
    if (!validos.includes(turnoFiltro)) setTurnoFiltro('Todos')
  }, [carreraFiltro, baseHorarios])

  useEffect(() => {
    if (grupoFiltro === 'Todos') return
    const validos = ['Todos', ...new Set(
      baseHorarios
        .filter(h => carreraFiltro === 'Todas' || h.carrera === carreraFiltro)
        .filter(h => turnoFiltro === 'Todos' || h.turno === turnoFiltro)
        .map(h => h.grupo)
    )]
    if (!validos.includes(grupoFiltro)) setGrupoFiltro('Todos')
  }, [carreraFiltro, turnoFiltro, baseHorarios])

  const handleLogout = async () => {
    await signOut(auth)
    setUsuario(null)
  }

  function filtrar(omitir) {
    return baseHorarios.filter(h => {
      if (omitir !== 'carrera' && carreraFiltro !== 'Todas' && h.carrera !== carreraFiltro) return false
      if (omitir !== 'turno' && turnoFiltro !== 'Todos' && h.turno !== turnoFiltro) return false
      if (omitir !== 'grupo' && grupoFiltro !== 'Todos' && h.grupo !== grupoFiltro) return false
      if (omitir !== 'dia' && diaFiltro !== 'Todos' && h.dia !== diaFiltro) return false
      if (omitir !== 'salon' && salonFiltro !== 'Todos' && h.salon !== salonFiltro) return false
      if (omitir !== 'profesor' && profesorFiltro !== 'Todos' && h.profesor !== profesorFiltro) return false
      if (omitir !== 'piso' && pisoFiltro !== 'Todos' && getPiso(h.salon) !== pisoFiltro) return false
      return true
    })
  }

  const opcionesFiltros = useMemo(() => ({
    carreras: ['Todas', ...new Set(baseHorarios.map(h => h.carrera))],
    turnos: ['Todos', ...new Set(baseHorarios.map(h => h.turno))],
    grupos: ['Todos', ...new Set(baseHorarios.map(h => h.grupo))],
    salones: ['Todos', ...new Set(baseHorarios.map(h => h.salon))].sort(),
    profesores: ['Todos', ...new Set(baseHorarios.map(h => h.profesor))].sort(),
    pisos: ['Todos', 'Planta Baja', 'Piso 1', 'Piso 5', 'Mezzanine'],
    dias: ['Todos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  }), [baseHorarios])

  const horariosFiltrados = useMemo(() => {
    const f = { carrera: carreraFiltro, turno: turnoFiltro, grupo: grupoFiltro, dia: diaFiltro, salon: salonFiltro, profesor: profesorFiltro, piso: pisoFiltro }
    if (Object.values(f).every(v => v === 'Todas' || v === 'Todos')) return baseHorarios
    return baseHorarios.filter(h => {
      if (f.carrera !== 'Todas' && h.carrera !== f.carrera) return false
      if (f.turno !== 'Todos' && h.turno !== f.turno) return false
      if (f.grupo !== 'Todos' && h.grupo !== f.grupo) return false
      if (f.dia !== 'Todos' && h.dia !== f.dia) return false
      if (f.salon !== 'Todos' && h.salon !== f.salon) return false
      if (f.profesor !== 'Todos' && h.profesor !== f.profesor) return false
      if (f.piso !== 'Todos' && getPiso(h.salon) !== f.piso) return false
      return true
    })
  }, [baseHorarios, carreraFiltro, turnoFiltro, grupoFiltro, diaFiltro, salonFiltro, profesorFiltro, pisoFiltro])

  const salonesAgrupados = useMemo(() =>
    horariosFiltrados.reduce((acc, h) => {
      if (!acc[h.salon]) acc[h.salon] = []
      acc[h.salon].push(h)
      return acc
    }, {}),
  [horariosFiltrados])

  const proyectoresAgrupados = useMemo(() =>
    horariosFiltrados
      .filter(h => h.proyector)
      .reduce((acc, h) => {
        if (!acc[h.proyector]) acc[h.proyector] = []
        acc[h.proyector].push(h)
        return acc
      }, {}),
  [horariosFiltrados])

  const limpiarFiltros = () => {
    setCarreraFiltro('Todas')
    setTurnoFiltro('Todos')
    setGrupoFiltro('Todos')
    setDiaFiltro('Todos')
    setSalonFiltro('Todos')
    setProfesorFiltro('Todos')
    setPisoFiltro('Todos')
  }

  const hayFiltros = carreraFiltro !== 'Todas' || turnoFiltro !== 'Todos' ||
    grupoFiltro !== 'Todos' || diaFiltro !== 'Todos' ||
    salonFiltro !== 'Todos' || profesorFiltro !== 'Todos' ||
    pisoFiltro !== 'Todos'

  if (authCargando) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
        <p>Cargando...</p>
      </div>
    )
  }

  if (!usuario) {
    return <LoginPage />
  }

  if (necesitaSetup) {
    return (
      <div className="app">
        <SetupProfile usuario={usuario} onCompletado={(u) => setUsuario(u)} />
      </div>
    )
  }

  return (
    <div className="app">

      {necesitaSetup && (
        <SetupProfile usuario={usuario} onCompletado={(u) => setUsuario(u)} />
      )}

      <Navbar
        usuario={usuario}
        onLogout={handleLogout}
        onInfoClick={() => setMostrarInfo(true)}
        turnoActual={turnoActual}
        tema={tema}
        onToggleTema={() => setTema(t => t === 'claro' ? 'oscuro' : 'claro')}
      />

      <main className="app-main">

        <ViewSelector
          usuario={usuario}
          onPedirEquipo={() => setMostrarSolicitud(true)}
          onMiHorario={() => {
            const p = usuario?.preferencias
            if (p?.carrera) setCarreraFiltro(p.carrera)
            if (p?.turno) setTurnoFiltro(p.turno)
            if (p?.grupo) setGrupoFiltro(p.grupo)
          }}
          onVerTodos={() => { setCarreraFiltro('Todas'); setTurnoFiltro('Todos'); setGrupoFiltro('Todos'); setDiaFiltro('Todos'); setSalonFiltro('Todos'); setProfesorFiltro('Todos'); setPisoFiltro('Todos') }}
          filtroActivo={
            esServicio && usuario?.preferencias?.tipo === 'estudiante' &&
            carreraFiltro === usuario?.preferencias?.carrera &&
            turnoFiltro === usuario?.preferencias?.turno &&
            grupoFiltro === usuario?.preferencias?.grupo
          }
        />

        {vista !== 'print' && vista !== 'admin' && (
          <>
            {(clasesAhora.length > 0 || esAdmin || esServicio) && (
              <CurrentClassPanel
                clases={clasesAhora}
                esAdmin={esAdmin}
                simulacion={simulacion}
                setSimulacion={setSimulacion}
              />
            )}

            {(esAdmin || esServicio) && (
              <ProjectorPanel
                clases={clasesAhora}
                proximas={clasesProximas}
                proximas10={clasesProximas10}
                terminando={clasesTerminando}
              />
            )}

            {!esEstudianteFiltrado && vista === 'tabla' && (
              <>
                <FiltersBar
                  carreras={opcionesFiltros.carreras} carreraFiltro={carreraFiltro} setCarreraFiltro={setCarreraFiltro}
                  turnos={opcionesFiltros.turnos} turnoFiltro={turnoFiltro} setTurnoFiltro={setTurnoFiltro}
                  grupos={opcionesFiltros.grupos} grupoFiltro={grupoFiltro} setGrupoFiltro={setGrupoFiltro}
                  dias={opcionesFiltros.dias} diaFiltro={diaFiltro} setDiaFiltro={setDiaFiltro}
                  salones={opcionesFiltros.salones} salonFiltro={salonFiltro} setSalonFiltro={setSalonFiltro}
                  profesores={opcionesFiltros.profesores} profesorFiltro={profesorFiltro} setProfesorFiltro={setProfesorFiltro}
                  pisos={opcionesFiltros.pisos} pisoFiltro={pisoFiltro} setPisoFiltro={setPisoFiltro}
                />

                <div className="resultados-meta">
                  <span>
                    {horariosFiltrados.length === 0
                      ? 'Sin resultados'
                      : `${horariosFiltrados.length} clase${horariosFiltrados.length !== 1 ? 's' : ''}`}
                  </span>
                  <div className="resultados-acciones">
                    {hayFiltros && (
                      <button className="btn-limpiar" onClick={limpiarFiltros}>
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <Routes>
          <Route path="/" element={
            <div style={{ position: 'relative' }}>
              {horariosFiltrados.length > 0 && (
                <div style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', zIndex: 10, display: 'flex', gap: 'var(--space-1)' }}>
                  <button className="btn-exportar btn-exportar--floating" onClick={() => descargarICS(generarICS(horariosFiltrados))}
                    title="Exportar horario a calendario (.ics)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Exportar .ics
                  </button>
                  <button className="btn-exportar btn-exportar--floating" onClick={() => setMostrarAyudaICS(true)}
                    title="Cómo importar el archivo .ics en tu calendario"
                    style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </button>
                </div>
              )}
              <WeeklyTable horarios={horariosFiltrados} />
            </div>
          } />
          <Route path="/tabla" element={
            <div style={{ position: 'relative' }}>
              {horariosFiltrados.length > 0 && (
                <div style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', zIndex: 10, display: 'flex', gap: 'var(--space-1)' }}>
                  <button className="btn-exportar btn-exportar--floating" onClick={() => descargarICS(generarICS(horariosFiltrados))}
                    title="Exportar horario a calendario (.ics)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Exportar .ics
                  </button>
                  <button className="btn-exportar btn-exportar--floating" onClick={() => setMostrarAyudaICS(true)}
                    title="Como importar el archivo .ics en tu calendario"
                    style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </button>
                </div>
              )}
              <WeeklyTable horarios={horariosFiltrados} />
            </div>
          } />
          <Route path="/mis-clases" element={
            esDocente
              ? <MisClases
                  horarios={horariosDinamicos.filter(h => slugify(h.profesor) === usuario?.preferencias?.profesorId)}
                  profesorNombre={usuario?.preferencias?.profesorLabel}
                  onClaseClick={(clase) => {
                    setClaseParaBitacora(clase)
                    navigate('/bitacora')
                  }}
                />
              : <Navigate to="/tabla" replace />
          } />
          <Route path="/bitacora" element={<BitacoraLab usuario={usuario} clasePrellenada={claseParaBitacora} onLimpiarPrellenado={() => setClaseParaBitacora(null)} />} />
          <Route path="/salones" element={
            horariosFiltrados.length === 0
              ? <div className="weekly-empty"><span>🔍</span><p>Sin resultados — intenta cambiar los filtros</p></div>
              : <div className="rooms-grid">
                  {Object.entries(salonesAgrupados).sort(([a], [b]) => a.localeCompare(b)).map(([salon, clases]) => (
                    <RoomCard key={salon} salon={salon} clases={clases} />
                  ))}
                </div>
          } />
          <Route path="/proyectores" element={
            (esAdmin || esServicio)
              ? (Object.keys(proyectoresAgrupados).length === 0
                  ? <div className="weekly-empty"><span>🔍</span><p>Sin resultados — no hay clases con proyector</p></div>
                  : <div className="rooms-grid">
                      {Object.entries(proyectoresAgrupados).sort(([a], [b]) => a.localeCompare(b)).map(([proyector, clases]) => (
                        <ProjectorCard key={proyector} proyector={proyector} clases={clases} />
                      ))}
                    </div>)
              : <Navigate to="/tabla" replace />
          } />
          <Route path="/print" element={
            (esAdmin || esServicio)
              ? <PrintPage horarios={horariosDinamicos} salones={opcionesFiltros.salones} onVolver={() => navigate('/tabla')} />
              : <Navigate to="/tabla" replace />
          } />
          <Route path="/admin" element={
            esAdmin
              ? <AdminPanel usuario={usuario} horariosDinamicos={horariosDinamicos} setVista={setVista} />
              : <Navigate to="/tabla" replace />
          } />
          <Route path="*" element={<Navigate to="/tabla" replace />} />
        </Routes>

      </main>



      {mostrarSolicitud && (
        <SolicitudEquipoModal
          usuario={usuario}
          horariosProfesor={fuenteHorarios.filter(h => slugify(h.profesor) === usuario?.preferencias?.profesorId)}
          onClose={() => setMostrarSolicitud(false)}
        />
      )}

      {mostrarInfo && (
        <InfoPage onClose={() => setMostrarInfo(false)} />
      )}

      {mostrarAyudaICS && (
        <div className="crud-modal-backdrop" onClick={() => setMostrarAyudaICS(false)}>
          <div className="crud-modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h3>Como importar tu horario</h3>
              <button className="crud-modal-close" onClick={() => setMostrarAyudaICS(false)}>x</button>
            </div>
            <div className="crud-modal-body">
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h4 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>Google Calendar (Web)</h4>
                <ol style={{ margin: 0, paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', lineHeight: '1.8' }}>
                  <li>Abre <a href="https://calendar.google.com" target="_blank" rel="noopener">calendar.google.com</a></li>
                  <li>Haz clic en el engranaje (arriba a la derecha) y selecciona <strong>Configuracion</strong></li>
                  <li>Ve a <strong>Importar y exportar</strong></li>
                  <li>En "Importar", selecciona el archivo <code>.ics</code> descargado</li>
                  <li>Elige el calendario destino y haz clic en <strong>Importar</strong></li>
                </ol>
                <p style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Tambien puedes arrastrar el archivo .ics directamente a la ventana de Google Calendar.</p>
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h4 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>Google Calendar (Android)</h4>
                <ol style={{ margin: 0, paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', lineHeight: '1.8' }}>
                  <li>Abre la app <strong>Google Calendar</strong></li>
                  <li>Toca las 3 lineas (menu) y luego <strong>Configuracion</strong></li>
                  <li>Toca <strong>Importar</strong> y selecciona el archivo <code>.ics</code></li>
                </ol>
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h4 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>Apple Calendar (iPhone / Mac)</h4>
                <ol style={{ margin: 0, paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', lineHeight: '1.8' }}>
                  <li>Descarga el archivo <code>.ics</code> en tu dispositivo</li>
                  <li>Abrelo desde la app <strong>Archivos</strong> o desde <strong>Descargas</strong></li>
                  <li>Selecciona <strong>Calendario</strong> para importarlo</li>
                  <li>Elige el calendario donde agregarlo</li>
                </ol>
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h4 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>Outlook (Web / Escritorio)</h4>
                <ol style={{ margin: 0, paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', lineHeight: '1.8' }}>
                  <li>Abre <a href="https://outlook.live.com/calendar" target="_blank" rel="noopener">Outlook Calendar</a></li>
                  <li>Haz clic en <strong>Agregar calendario</strong> y luego <strong>Cargar desde archivo</strong></li>
                  <li>Selecciona el archivo <code>.ics</code> descargado</li>
                </ol>
              </div>
            </div>
            <div className="crud-modal-footer" style={{ justifyContent: 'space-between', gap: 'var(--space-4)' }}>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Los eventos se generan respetando los dias festivos del calendario academico. Las clases apareceran como eventos semanales hasta el fin del cuatrimestre.</p>
              <button className="crud-btn-guardar" onClick={() => setMostrarAyudaICS(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
