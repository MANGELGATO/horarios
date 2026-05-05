import './FiltersBar.css'

function FiltersBar({
  carreras, carreraFiltro, setCarreraFiltro,
  turnos, turnoFiltro, setTurnoFiltro,
  grupos, grupoFiltro, setGrupoFiltro,
  dias, diaFiltro, setDiaFiltro,
  salones, salonFiltro, setSalonFiltro,
  profesores, profesorFiltro, setProfesorFiltro,
}) {
  const hayFiltrosActivos =
    carreraFiltro !== 'Todas' ||
    turnoFiltro !== 'Todos' ||
    grupoFiltro !== 'Todos' ||
    diaFiltro !== 'Todos' ||
    salonFiltro !== 'Todos' ||
    profesorFiltro !== 'Todos'

  return (
    <section className="filters-bar">
      <div className="filters-bar__header">
        <h2 className="filters-bar__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filtros
        </h2>
        {hayFiltrosActivos && (
          <span className="filters-bar__activos">
            {[
              carreraFiltro !== 'Todas' && carreraFiltro,
              turnoFiltro !== 'Todos' && turnoFiltro,
              grupoFiltro !== 'Todos' && grupoFiltro.split(' ').pop(),
              diaFiltro !== 'Todos' && diaFiltro,
              salonFiltro !== 'Todos' && salonFiltro,
              profesorFiltro !== 'Todos' && profesorFiltro.split('').pop()
            ].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>

      <div className="filters-bar__grid">

        {/* Carrera */}
        <div className="filter-group">
          <label className="filter-group__label" htmlFor="f-carrera">Carrera</label>
          <select
            id="f-carrera"
            className="filter-group__select"
            value={carreraFiltro}
            onChange={e => {
              setCarreraFiltro(e.target.value)
              setGrupoFiltro('Todos') // reset grupo al cambiar carrera
            }}
          >
            {carreras.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Turno */}
        <div className="filter-group">
          <label className="filter-group__label" htmlFor="f-turno">Turno</label>
          <select
            id="f-turno"
            className="filter-group__select"
            value={turnoFiltro}
            onChange={e => {
              setTurnoFiltro(e.target.value)
              setGrupoFiltro('Todos')
            }}
          >
            {turnos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Grupo */}
        <div className="filter-group">
          <label className="filter-group__label" htmlFor="f-grupo">Grupo</label>
          <select
            id="f-grupo"
            className="filter-group__select"
            value={grupoFiltro}
            onChange={e => setGrupoFiltro(e.target.value)}
          >
            {grupos.map(g => (
              <option key={g} value={g}>
                {g === 'Todos' ? 'Todos' : g.split(' ').pop()}
              </option>
            ))}
          </select>
        </div>

        {/* Día */}
        <div className="filter-group">
          <label className="filter-group__label" htmlFor="f-dia">Día</label>
          <select
            id="f-dia"
            className="filter-group__select"
            value={diaFiltro}
            onChange={e => setDiaFiltro(e.target.value)}
          >
            {dias.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Salón */}
        <div className="filter-group">
          <label className="filter-group__label" htmlFor="f-salon">Salón / Lab</label>
          <select
            id="f-salon"
            className="filter-group__select"
            value={salonFiltro}
            onChange={e => setSalonFiltro(e.target.value)}
          >
            {salones.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Profesor */}
        <div className="filter-group">
          <label className="filter-group__label" htmlFor="f-profesor">Profesor</label>
          <select
            id="f-profesor"
            className="filter-group__select"
            value={profesorFiltro}
            onChange={e => setProfesorFiltro(e.target.value)}
          >
            {profesores.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

      </div>
    </section>
  )
}

export default FiltersBar