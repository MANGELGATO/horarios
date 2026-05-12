import { useState, useEffect } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { horarios, getClasesActuales, getClasesProximas, getClasesTerminando, getPiso, getTurnoActual } from './data/horarios'
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
import './App.css'

function App() {
  const [vista, setVista]                   = useState('tabla')
  const [carreraFiltro, setCarreraFiltro]   = useState('Todas')
  const [turnoFiltro, setTurnoFiltro]       = useState('Todos')
  const [grupoFiltro, setGrupoFiltro]       = useState('Todos')
  const [diaFiltro, setDiaFiltro]           = useState('Todos')
  const [salonFiltro, setSalonFiltro]       = useState('Todos')
  const [profesorFiltro, setProfesorFiltro] = useState('Todos')
  const [pisoFiltro, setPisoFiltro]         = useState('Todos')
  const [clasesAhora, setClasesAhora]       = useState([])
  const [clasesProximas, setClasesProximas] = useState([])
  const [clasesProximas10, setClasesProximas10] = useState([])
  const [clasesTerminando, setClasesTerminando] = useState([])
  const [turnoActual, setTurnoActual]       = useState(getTurnoActual())
  const [usuario, setUsuario]               = useState(null)
  const [authCargando, setAuthCargando]     = useState(true)
  const [mostrarInfo, setMostrarInfo]       = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email
        const dominio = email.split('@')[1]
        if (dominio === 'utj.edu.mx' || dominio === 'soy.utj.edu.mx') {
          setUsuario({
            nombre: firebaseUser.displayName,
            email: firebaseUser.email,
            foto: firebaseUser.photoURL,
            uid: firebaseUser.uid,
            rol: dominio === 'utj.edu.mx' ? 'admin' : 'estudiante',
          })
        }
      }
      setAuthCargando(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const actualizar = () => {
      setClasesAhora(getClasesActuales())
      setClasesProximas(getClasesProximas())
      setClasesProximas10(getClasesProximas(10))
      setClasesTerminando(getClasesTerminando())
      setTurnoActual(getTurnoActual())
    }
    actualizar()
    const intervalo = setInterval(actualizar, 60000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    if (carreraFiltro === 'Todas') return
    const validos = ['Todas', ...new Set(
      horarios.filter(h => turnoFiltro === 'Todos' || h.turno === turnoFiltro).map(h => h.carrera)
    )]
    if (!validos.includes(carreraFiltro)) setCarreraFiltro('Todas')
  }, [turnoFiltro])

  useEffect(() => {
    if (turnoFiltro === 'Todos') return
    const validos = ['Todos', ...new Set(
      horarios.filter(h => carreraFiltro === 'Todas' || h.carrera === carreraFiltro).map(h => h.turno)
    )]
    if (!validos.includes(turnoFiltro)) setTurnoFiltro('Todos')
  }, [carreraFiltro])

  useEffect(() => {
    if (grupoFiltro === 'Todos') return
    const validos = ['Todos', ...new Set(
      horarios
        .filter(h => carreraFiltro === 'Todas' || h.carrera === carreraFiltro)
        .filter(h => turnoFiltro   === 'Todos'  || h.turno   === turnoFiltro)
        .map(h => h.grupo)
    )]
    if (!validos.includes(grupoFiltro)) setGrupoFiltro('Todos')
  }, [carreraFiltro, turnoFiltro])

  const handleLogout = async () => {
    await signOut(auth)
    setUsuario(null)
  }

  function filtrar(omitir) {
    return horarios.filter(h => {
      if (omitir !== 'carrera'  && carreraFiltro  !== 'Todas' && h.carrera  !== carreraFiltro)  return false
      if (omitir !== 'turno'    && turnoFiltro    !== 'Todos' && h.turno    !== turnoFiltro)    return false
      if (omitir !== 'grupo'    && grupoFiltro    !== 'Todos' && h.grupo    !== grupoFiltro)    return false
      if (omitir !== 'dia'      && diaFiltro      !== 'Todos' && h.dia      !== diaFiltro)      return false
      if (omitir !== 'salon'    && salonFiltro    !== 'Todos' && h.salon    !== salonFiltro)    return false
      if (omitir !== 'profesor' && profesorFiltro !== 'Todos' && h.profesor !== profesorFiltro) return false
      if (omitir !== 'piso'     && pisoFiltro     !== 'Todos' && getPiso(h.salon) !== pisoFiltro) return false
      return true
    })
  }

  const carreras   = ['Todas', ...new Set(filtrar('carrera').map(h => h.carrera))]
  const turnos     = ['Todos', ...new Set(filtrar('turno').map(h => h.turno))]
  const grupos     = ['Todos', ...new Set(filtrar('grupo').map(h => h.grupo))]
  const salones    = ['Todos', ...new Set(filtrar('salon').map(h => h.salon))].sort()
  const profesores = ['Todos', ...new Set(filtrar('profesor').map(h => h.profesor))].sort()
  const pisos      = ['Todos', 'Planta Baja', 'Piso 1', 'Piso 5', 'Mezzanine']
  const dias       = ['Todos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

  const horariosFiltrados = horarios.filter(h => {
    if (carreraFiltro  !== 'Todas' && h.carrera  !== carreraFiltro)  return false
    if (turnoFiltro    !== 'Todos' && h.turno    !== turnoFiltro)    return false
    if (grupoFiltro    !== 'Todos' && h.grupo !== grupoFiltro) return false
    if (diaFiltro      !== 'Todos' && h.dia      !== diaFiltro)      return false
    if (salonFiltro    !== 'Todos' && h.salon    !== salonFiltro)    return false
    if (profesorFiltro !== 'Todos' && h.profesor !== profesorFiltro) return false
    if (pisoFiltro     !== 'Todos' && getPiso(h.salon) !== pisoFiltro) return false
    return true
  })

  const salonesAgrupados = horariosFiltrados.reduce((acc, h) => {
    if (!acc[h.salon]) acc[h.salon] = []
    acc[h.salon].push(h)
    return acc
  }, {})

  const proyectoresAgrupados = horariosFiltrados
    .filter(h => h.proyector)
    .reduce((acc, h) => {
      if (!acc[h.proyector]) acc[h.proyector] = []
      acc[h.proyector].push(h)
      return acc
    }, {})

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
                     grupoFiltro   !== 'Todos' || diaFiltro   !== 'Todos' ||
                     salonFiltro   !== 'Todos' || profesorFiltro !== 'Todos' ||
                     pisoFiltro    !== 'Todos'

  if (authCargando) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
        <p>Cargando...</p>
      </div>
    )
  }

  if (!usuario) {
    return <LoginPage onLogin={(u) => setUsuario(u)} />
  }

  return (
    <div className="app">

      <Navbar
        vistaActual={vista}
        setVista={setVista}
        usuario={usuario}
        onLogout={handleLogout}
        onInfoClick={() => setMostrarInfo(true)}
      />

      <main className="app-main">

        <CurrentClassPanel clases={clasesAhora} />

        {usuario.rol === 'admin' && <ProjectorPanel clases={clasesAhora} proximas={clasesProximas} proximas10={clasesProximas10} terminando={clasesTerminando} />}

        <FiltersBar
          carreras={carreras}     carreraFiltro={carreraFiltro}     setCarreraFiltro={setCarreraFiltro}
          turnos={turnos}         turnoFiltro={turnoFiltro}         setTurnoFiltro={setTurnoFiltro}
          grupos={grupos}         grupoFiltro={grupoFiltro}         setGrupoFiltro={setGrupoFiltro}
          dias={dias}             diaFiltro={diaFiltro}             setDiaFiltro={setDiaFiltro}
          salones={salones}       salonFiltro={salonFiltro}         setSalonFiltro={setSalonFiltro}
          profesores={profesores} profesorFiltro={profesorFiltro}   setProfesorFiltro={setProfesorFiltro}
          pisos={pisos}           pisoFiltro={pisoFiltro}           setPisoFiltro={setPisoFiltro}
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

        {vista === 'proyectores' && (
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

      </main>

      {mostrarInfo && (
        <InfoPage onClose={() => setMostrarInfo(false)} />
      )}

      

    </div>
  )
}

export default App
