import { useState, useEffect } from 'react'
import { horarios, getClasesActuales } from './data/horarios'
import Navbar from './components/NavbarComponent/Navbar'
import CurrentClassPanel from './components/CurrentClassPanelComponent/CurrentClassPanel'
import FiltersBar from './components/FilterBarComponent/FiltersBar'
import WeeklyTable from './components/WeeklyTableComponent/WeeklyTable'
import RoomCard from './components/RoomCardComponent/RoomCard'
import './App.css'

function App() {
  const [vista, setVista]               = useState('tabla')
  const [carreraFiltro, setCarreraFiltro] = useState('Todas')
  const [turnoFiltro, setTurnoFiltro]     = useState('Todos')
  const [grupoFiltro, setGrupoFiltro]     = useState('Todos')
  const [diaFiltro, setDiaFiltro]         = useState('Todos')
  const [salonFiltro, setSalonFiltro]     = useState('Todos')
  const [clasesAhora, setClasesAhora]     = useState([])

  useEffect(() => {
    const actualizar = () => setClasesAhora(getClasesActuales())
    actualizar()
    const intervalo = setInterval(actualizar, 60000)
    return () => clearInterval(intervalo)
  }, [])

  const carreras = ['Todas', ...new Set(horarios.map(h => h.carrera))]
  const turnos   = ['Todos', ...new Set(horarios.map(h => h.turno))]
  const salones  = ['Todos', ...new Set(horarios.map(h => h.salon))].sort()
  const dias     = ['Todos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

  const grupos = ['Todos', ...new Set(
    horarios
      .filter(h => carreraFiltro === 'Todas' || h.carrera === carreraFiltro)
      .filter(h => turnoFiltro   === 'Todos'  || h.turno   === turnoFiltro)
      .map(h => `${h.carrera} ${h.turno} ${h.grupo}`)
  )]

  const horariosFiltrados = horarios.filter(h => {
    if (carreraFiltro !== 'Todas' && h.carrera !== carreraFiltro) return false
    if (turnoFiltro   !== 'Todos' && h.turno   !== turnoFiltro)   return false
    if (grupoFiltro   !== 'Todos' && `${h.carrera} ${h.turno} ${h.grupo}` !== grupoFiltro) return false
    if (diaFiltro     !== 'Todos' && h.dia     !== diaFiltro)     return false
    if (salonFiltro   !== 'Todos' && h.salon   !== salonFiltro)   return false
    return true
  })

  // Para vista por salón: agrupa los filtrados por salón
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
  }

  const hayFiltros = carreraFiltro !== 'Todas' || turnoFiltro !== 'Todos' ||
                     grupoFiltro !== 'Todos' || diaFiltro !== 'Todos' || salonFiltro !== 'Todos'

  return (
    <div className="app">
      <Navbar vistaActual={vista} setVista={setVista} />

      <main className="app-main">
        <CurrentClassPanel clases={clasesAhora} />

        <FiltersBar
          carreras={carreras}   carreraFiltro={carreraFiltro}   setCarreraFiltro={setCarreraFiltro}
          turnos={turnos}       turnoFiltro={turnoFiltro}       setTurnoFiltro={setTurnoFiltro}
          grupos={grupos}       grupoFiltro={grupoFiltro}       setGrupoFiltro={setGrupoFiltro}
          dias={dias}           diaFiltro={diaFiltro}           setDiaFiltro={setDiaFiltro}
          salones={salones}     salonFiltro={salonFiltro}       setSalonFiltro={setSalonFiltro}
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

        {/* ── Vista por grupo (tabla semanal) ── */}
        {vista === 'tabla' && (
          <WeeklyTable horarios={horariosFiltrados} />
        )}

        {/* ── Vista por salón (room cards) ── */}
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
                ))
              }
            </div>
          )
        )}
      </main>
    </div>
  )
}

export default App