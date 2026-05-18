import { useState, useEffect, useMemo } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, obtenerCrearPerfilUsuario } from './firebase'
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

  const necesitaSetup = usuario && usuario.rol === 'estudiante' && !usuario.preferencias
  const esAdmin = usuario?.rol === 'admin' || usuario?.rol === 'superadmin'
  const esEstudianteFiltrado = usuario?.preferencias?.tipo === 'estudiante'

  const vistasPermitidas = {
    tabla: true,
    salones: !esEstudianteFiltrado,
    proyectores: esAdmin,
    print: true,
    admin: esAdmin,
  }

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
    if (!usuario?.preferencias) return null
    const p = usuario.preferencias
    if (p.tipo === 'estudiante') {
      return (h) => h.carrera === p.carrera && h.grupo === p.grupo && h.turno === p.turno
    }
    if (p.tipo === 'docente') {
      return (h) => slugify(h.profesor) === p.profesorId
    }
    return null
  }, [usuario?.preferencias])

  const baseHorarios = useMemo(() => {
    if (prefsFilter) return horarios.filter(prefsFilter)
    return horarios
  }, [prefsFilter])

  const filtrarPorPrefs = useMemo(() => {
    if (!prefsFilter) return (c) => c
    return (clases) => clases.filter(prefsFilter)
  }, [prefsFilter])

  useEffect(() => {
    const actualizar = () => {
      setClasesAhora(filtrarPorPrefs(getClasesActuales()))
      setClasesProximas(filtrarPorPrefs(getClasesProximas()))
      setClasesProximas10(filtrarPorPrefs(getClasesProximas(10)))
      setClasesTerminando(filtrarPorPrefs(getClasesTerminando()))
      setTurnoActual(getTurnoActual())
    }
    actualizar()
    const intervalo = setInterval(actualizar, 60000)
    return () => clearInterval(intervalo)
  }, [filtrarPorPrefs])

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
      />

      <main className="app-main">

        <ViewSelector vista={vista} setVista={setVista} usuario={usuario} />

        {vista !== 'print' && vista !== 'admin' && (
          <>
            {clasesAhora.length > 0 && <CurrentClassPanel clases={clasesAhora} />}

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
            horarios={horarios}
            salones={salones}
            onVolver={() => setVista('tabla')}
          />
        )}

        {vista === 'admin' && esAdmin && (
          <AdminPanel usuario={usuario} />
        )}

      </main>

      {mostrarInfo && (
        <InfoPage onClose={() => setMostrarInfo(false)} />
      )}

    </div>
  )
}

export default App
