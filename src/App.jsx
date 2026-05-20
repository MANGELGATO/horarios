import { useState, useEffect, useMemo } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { auth, obtenerCrearPerfilUsuario, db } from './firebase'
import { horarios, getClasesActuales, getClasesProximas, getClasesTerminando, getPiso, getTurnoActual, slugify } from './data/horarios'
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
import './App.css'

function App() {
  const [vista, setVista] = useState('tabla')
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
  const [solicitudesEquipo, setSolicitudesEquipo] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'solicitudes_equipo'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setSolicitudesEquipo(data)
    })
    return unsubscribe
  }, [])

  const horariosDinamicos = useMemo(() => {
    const arr = horarios.map(h => ({ ...h }))
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
  }, [solicitudesEquipo])

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', tema === 'oscuro')
    localStorage.setItem('tema-horarios', tema)
  }, [tema])

  const necesitaSetup = usuario && !usuario.preferencias && (usuario.rol === 'estudiante' || usuario.rol === 'docente')
  const esAdmin = usuario?.rol === 'admin' || usuario?.rol === 'superadmin'
  const esEstudianteFiltrado = usuario?.preferencias?.tipo === 'estudiante' && !esAdmin

  const vistasPermitidas = {
    tabla: true,
    salones: !esEstudianteFiltrado,
    proyectores: esAdmin,
    print: true,
    admin: esAdmin,
    'mis-clases': usuario?.rol === 'docente'
  }

  useEffect(() => {
    // Si es docente y está en la tabla general, enviarlo a su vista por defecto
    if (usuario?.rol === 'docente' && vista === 'tabla') {
      setVista('mis-clases')
    }
  }, [usuario, vista])

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

  // Sincronización en tiempo real desactivada temporalmente a petición del usuario.
  // Se utilizan los horarios locales estáticos precargados de manera 100% estable.

  const prefsFilter = useMemo(() => {
    if (esAdmin) return null
    if (!usuario?.preferencias) return null
    const p = usuario.preferencias
    if (p.tipo === 'estudiante') {
      return (h) => h.carrera === p.carrera && h.grupo === p.grupo && h.turno === p.turno
    }
    if (p.tipo === 'docente') {
      return (h) => slugify(h.profesor) === p.profesorId
    }
    return null
  }, [usuario?.preferencias, esAdmin])

  const baseHorarios = useMemo(() => {
    if (prefsFilter) return horariosDinamicos.filter(prefsFilter)
    return horariosDinamicos
  }, [prefsFilter, horariosDinamicos])

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

        <ViewSelector vista={vista} setVista={setVista} usuario={usuario} />

        {vista !== 'print' && vista !== 'admin' && (
          <>
            {(clasesAhora.length > 0 || esAdmin) && (
              <CurrentClassPanel
                clases={clasesAhora}
                esAdmin={esAdmin}
                simulacion={simulacion}
                setSimulacion={setSimulacion}
              />
            )}

            {esAdmin && (
              <ProjectorPanel
                clases={clasesAhora}
                proximas={clasesProximas}
                proximas10={clasesProximas10}
                terminando={clasesTerminando}
              />
            )}

            {!esEstudianteFiltrado && (
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
                  {hayFiltros && (
                    <button className="btn-limpiar" onClick={limpiarFiltros}>
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {vista === 'tabla' && (
          <WeeklyTable horarios={horariosFiltrados} />
        )}

        {vista === 'mis-clases' && usuario?.rol === 'docente' && (
          <MisClases 
            horarios={horariosFiltrados} 
            profesorNombre={usuario?.preferencias?.profesorLabel}
          />
        )}

        {vista === 'salones' && (
          horariosFiltrados.length === 0 ? (
            <div className="weekly-empty">
              <span>🔍</span>
              <p>Sin resultados — intenta cambiar los filtros</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {Object.entries(salonesAgrupados)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([salon, clases]) => (
                  <RoomCard key={salon} salon={salon} clases={clases} />
                ))}
            </div>
          )
        )}

        {vista === 'proyectores' && esAdmin && (
          Object.keys(proyectoresAgrupados).length === 0 ? (
            <div className="weekly-empty">
              <span>🔍</span>
              <p>Sin resultados — no hay clases con proyector</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {Object.entries(proyectoresAgrupados)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([proyector, clases]) => (
                  <ProjectorCard key={proyector} proyector={proyector} clases={clases} />
                ))}
            </div>
          )
        )}

        {vista === 'print' && (
          <PrintPage
            horarios={horariosDinamicos}
            salones={opcionesFiltros.salones}
            onVolver={() => setVista('tabla')}
          />
        )}

        {vista === 'admin' && esAdmin && (
          <AdminPanel usuario={usuario} horariosDinamicos={horariosDinamicos} />
        )}

      </main>

      {usuario?.rol === 'docente' && vista !== 'print' && vista !== 'admin' && (
        <button 
          className="fab-solicitar-equipo" 
          onClick={() => setMostrarSolicitud(true)}
          title="Solicitar Equipo"
        >
          <span className="fab-icon">🖥️</span>
          <span className="fab-text">Pedir Equipo</span>
        </button>
      )}

      {mostrarSolicitud && (
        <SolicitudEquipoModal
          usuario={usuario}
          horariosProfesor={horarios.filter(h => slugify(h.profesor) === usuario?.preferencias?.profesorId)}
          onClose={() => setMostrarSolicitud(false)}
        />
      )}

      {mostrarInfo && (
        <InfoPage onClose={() => setMostrarInfo(false)} />
      )}

    </div>
  )
}

export default App
