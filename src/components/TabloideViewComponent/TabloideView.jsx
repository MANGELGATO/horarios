import './TabloideView.css'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const BLOQUES_MAT = [
  '7:00-7:50', '7:50-8:40', '9:10-10:00',
  '10:00-10:50', '10:50-11:40', '11:40-12:30',
  '12:30-13:20', '13:20-14:10'
]

const BLOQUES_VES = [
  '15:30-16:20', '16:20-17:10', '17:10-18:00',
  '18:00-18:50', '18:50-19:40', '19:40-20:30',
  '20:30-21:20'
]

function getClase(horarios, salon, dia, horaInicio, horaFin) {
  return horarios.find(h =>
    h.salon === salon &&
    h.dia === dia &&
    h.horaInicio === horaInicio &&
    h.horaFin === horaFin
  )
}

function parseBloque(bloque) {
  const [inicio, fin] = bloque.split('-')
  return { horaInicio: inicio, horaFin: fin }
}

function CeldaClase({ clase }) {
  if (!clase) return <td className="tabloide-td tabloide-td--vacia"></td>
  return (
    <td className="tabloide-td tabloide-td--ocupada">
      <span className="tabloide-materia">{clase.materia}</span>
      <span className="tabloide-grupo">{clase.carrera} {clase.grupo}</span>
      <span className="tabloide-profesor">{clase.profesor}</span>
    </td>
  )
}

function TabloideView({ salon, horarios, ciclo = 'Mayo -Agosto 2026' }) {
  const clasesSalon = horarios.filter(h => h.salon === salon)

  // Separar prefijo (ej. Laboratorio) del nombre (ej. M02) si aplica
  const isLaboratorio = salon.toLowerCase().includes('lab');
  const tipoEspacio = isLaboratorio ? 'Laboratorio' : 'Aula';
  const nombreEspacio = salon.replace(/Laboratorio|Lab/i, '').trim() || salon;

  return (
    <div className="tabloide-page">
      
      {/* Logos superiores */}
      <div className="tabloide-header-logos">
        <div className="tabloide-logo-left">
          {/* Reemplaza con tu etiqueta img real */}
          <div className="logo-placeholder">UTJ Logo</div> 
        </div>
        <div className="tabloide-logo-right">
          {/* Reemplaza con tu etiqueta img real */}
          <div className="logo-placeholder logo-placeholder--round">27 Aniversario</div>
        </div>
      </div>

      {/* Título */}
      <div className="tabloide-title">
        <span className="tabloide-title__tipo">{tipoEspacio} | </span>
        <span className="tabloide-title__nombre">{nombreEspacio}</span>
      </div>

      {/* Tabla Unificada */}
      <table className="tabloide-table">
        <thead>
          <tr>
            <th className="tabloide-th tabloide-th--horario">HORARIO</th>
            {DIAS.map(d => <th key={d} className="tabloide-th">{d.toUpperCase()}</th>)}
          </tr>
        </thead>
        <tbody>
          {/* Turno Matutino */}
          {BLOQUES_MAT.map(bloque => {
            const { horaInicio, horaFin } = parseBloque(bloque)
            return (
              <tr key={bloque}>
                <td className="tabloide-td tabloide-td--horario">{bloque}</td>
                {DIAS.map(dia => (
                  <CeldaClase
                    key={dia}
                    clase={getClase(clasesSalon, salon, dia, horaInicio, horaFin)}
                  />
                ))}
              </tr>
            )
          })}

          {/* Receso central */}
          <tr className="tabloide-receso-row">
            <td colSpan={6}>RECESO</td>
          </tr>

          {/* Turno Vespertino */}
          {BLOQUES_VES.map(bloque => {
            const { horaInicio, horaFin } = parseBloque(bloque)
            return (
              <tr key={bloque}>
                <td className="tabloide-td tabloide-td--horario">{bloque}</td>
                {DIAS.map(dia => (
                  <CeldaClase
                    key={dia}
                    clase={getClase(clasesSalon, salon, dia, horaInicio, horaFin)}
                  />
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Footer / Ciclo */}
      <div className="tabloide-ciclo">
        <strong>Horarios | {ciclo}</strong>
      </div>

      {/* Logos inferiores */}
      <div className="tabloide-footer-logos">
         {/* Reemplaza con tus imágenes reales */}
         <div className="logo-placeholder footer-logo">Educación</div>
         <div className="logo-placeholder footer-logo">UTP</div>
         <div className="logo-placeholder footer-logo">Jalisco</div>
         <div className="logo-placeholder footer-logo">Educert</div>
      </div>
    </div>
  )
}

export default TabloideView