import { useState, useEffect } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { horarios, getClasesActuales, getClasesProximas, getPiso, getTurnoActual } from './data/horarios'
import Navbar from './components/NavbarComponent/Navbar'
import CurrentClassPanel from './components/CurrentClassPanelComponent/CurrentClassPanel'
import ProjectorPanel from './components/ProjectorPanelComponent/ProjectorPanel'
import FiltersBar from './components/FiltersBarComponent/FiltersBar'
import WeeklyTable from './components/WeeklyTableComponent/WeeklyTable'
import RoomCard from './components/RoomCardComponent/RoomCard'
import LoginPage from './components/LoginPage/LoginPage'
import InfoPage from './components/InfoPage/InfoPage'
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
      setTurnoActual(getTurnoActual())
    }
    actualizar()
    const intervalo = setInterval(actualizar, 60000)
    return () => clearInterval(intervalo)
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    setUsuario(null)
  }

  const carreras   = ['Todas', ...new Set(horarios.map(h => h.carrera))]
  const turnos     = ['Todos', ...new Set(horarios.map(h => h.turno))]
  const salones    = ['Todos', ...new Set(horarios.map(h => h.salon))].sort()
  const horariosTurno = turnoActual ? horarios.filter(h => h.turno === turnoActual) : horarios
  const profesores = ['Todos', ...new Set(horariosTurno.map(h => h.profesor))].sort()
  const pisos      = ['Todos', 'Planta Baja', 'Piso 1', 'Piso 5', 'Mezzanine']
  const dias       = ['Todos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

  const grupos = ['Todos', ...new Set(
    horarios
      .filter(h => carreraFiltro === 'Todas' || h.carrera === carreraFiltro)
      .filter(h => turnoFiltro   === 'Todos'  || h.turno   === turnoFiltro)
      .map(h => `${h.carrera} ${h.turno} ${h.grupo}`)
  )]

  const horariosFiltrados = horarios.filter(h => {
    if (carreraFiltro  !== 'Todas' && h.carrera  !== carreraFiltro)  return false
    if (turnoFiltro    !== 'Todos' && h.turno    !== turnoFiltro)    return false
    if (grupoFiltro    !== 'Todos' && `${h.carrera} ${h.turno} ${h.grupo}` !== grupoFiltro) return false
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

        {usuario.rol === 'admin' && <ProjectorPanel clases={clasesAhora} proximas={clasesProximas} />}

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

      </main>

      {mostrarInfo && (
        <InfoPage onClose={() => setMostrarInfo(false)} />
      )}

    </div>
  )
}

export default App
