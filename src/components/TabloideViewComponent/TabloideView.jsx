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

function getClase(horarios, salon, dia, turno, bloqueId) {
  if (!horarios || !salon) return undefined;
  const normalizedSalon = salon.toLowerCase().trim();
  const normalizedDia = dia.toLowerCase().trim();
  const normalizedTurno = turno.toLowerCase().trim();
  
  return horarios.find(h => {
    if (!h.salon || !h.dia || !h.turno) return false;
    return h.salon.toLowerCase().trim() === normalizedSalon &&
      h.dia.toLowerCase().trim() === normalizedDia &&
      h.turno.toLowerCase().trim() === normalizedTurno &&
      Number(h.bloque) === Number(bloqueId);
  });
}

function CeldaClase({ clase, dia }) {
  if (!clase) {
    return (
      <td className="tabloide-td tabloide-td--vacia">
        <div className="tabloide-cell-wrapper"></div>
      </td>
    )
  }
  const esVirtual = clase.diaVirtual === dia
  return (
    <td className={`tabloide-td tabloide-td--ocupada${esVirtual ? ' tabloide-td--virtual' : ''}`}>
      <div className="tabloide-cell-wrapper">
        <span className="tabloide-materia">{clase.materia}</span>
        <span className="tabloide-profesor">{clase.profesor}</span>
        <span className="tabloide-grupo">{clase.grupo}</span>
      </div>
    </td>
  )
}

function TabloideView({ salon, horarios, ciclo = 'Mayo - Agosto 2026' }) {
  const clasesSalon = horarios.filter(h => 
    h.salon && h.salon.toLowerCase().trim() === salon.toLowerCase().trim()
  )

  // Separar prefijo (ej. Laboratorio, Taller, Aula) del nombre (ej. M02) si aplica
  let tipoEspacio = 'Aula';
  let nombreEspacio = salon;
  if (salon.toLowerCase().includes('lab') || salon.toLowerCase().includes('laboratorio')) {
    tipoEspacio = 'Laboratorio';
    nombreEspacio = salon.replace(/Laboratorio|Lab/i, '').trim();
  } else if (salon.toLowerCase().includes('taller')) {
    tipoEspacio = 'Taller';
    nombreEspacio = salon.replace(/Taller/i, '').trim();
  } else if (salon.toLowerCase().includes('aula')) {
    tipoEspacio = 'Aula';
    nombreEspacio = salon.replace(/Aula/i, '').trim();
  }

  return (
    <div className="tabloide-page">
      {/* Watermark de fondo oficial de la UTJ */}
      <div className="tabloide-watermark">
        <img src="/tabloide_watermark.png" alt="UTJ Watermark" />
      </div>

      {/* Logos superiores oficiales de la UTJ */}
      <div className="tabloide-header-logos">
        <img src="/tabloide_header_logos.png?v=2" alt="UTJ Header Logos" className="tabloide-header-logos-img" />
      </div>

      {/* Título Dinámico */}
      <div className="tabloide-title">
        <span className="tabloide-title__tipo">{tipoEspacio.toUpperCase()}</span>
        <span className="tabloide-title__separator"> | </span>
        <span className="tabloide-title__nombre">{nombreEspacio}</span>
      </div>

      {/* Tabla Unificada */}
      <table className="tabloide-table">
        <colgroup>
          <col style={{ width: '2.27cm' }} />
          <col style={{ width: '4.51cm' }} />
          <col style={{ width: '4.51cm' }} />
          <col style={{ width: '4.51cm' }} />
          <col style={{ width: '4.51cm' }} />
          <col style={{ width: '4.51cm' }} />
        </colgroup>
        <thead>
          <tr>
            <th className="tabloide-th tabloide-th--horario">
              <div className="tabloide-th-wrapper">HORARIO</div>
            </th>
            {DIAS.map(d => (
              <th key={d} className="tabloide-th">
                <div className="tabloide-th-wrapper">{d.toUpperCase()}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Turno Matutino */}
          {BLOQUES_MAT.map((bloque, index) => {
            return (
              <tr key={bloque}>
                <td className="tabloide-td tabloide-td--horario">
                  <div className="tabloide-cell-wrapper tabloide-cell-wrapper--horario">
                    {bloque}
                  </div>
                </td>
                {DIAS.map(dia => (
                  <CeldaClase
                    key={dia}
                    dia={dia}
                    clase={getClase(clasesSalon, salon, dia, 'Matutino', index + 1)}
                  />
                ))}
              </tr>
            )
          })}

          {/* Receso central */}
          <tr className="tabloide-receso-row">
            <td colSpan={6}>
              <div className="tabloide-cell-wrapper tabloide-cell-wrapper--receso">
                RECESO
              </div>
            </td>
          </tr>

          {/* Turno Vespertino */}
          {BLOQUES_VES.map((bloque, index) => {
            return (
              <tr key={bloque}>
                <td className="tabloide-td tabloide-td--horario">
                  <div className="tabloide-cell-wrapper tabloide-cell-wrapper--horario">
                    {bloque}
                  </div>
                </td>
                {DIAS.map(dia => (
                  <CeldaClase
                    key={dia}
                    dia={dia}
                    clase={getClase(clasesSalon, salon, dia, 'Vespertino', index + 1)}
                  />
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Fila de Texto del Ciclo (mismo ancho exacto que la tabla) */}
      <div className="tabloide-footer-text-area">
        <div className="tabloide-footer-ciclo-text">
          Horarios | {ciclo}
        </div>
      </div>

      {/* Footer y Logos de Gobierno Oficiales */}
      <div className="tabloide-footer-container">
        <div className="tabloide-footer-relative-wrap">
          <img src="/tabloide_footer_logos.png?v=2" alt="UTJ Footer Logos" className="tabloide-footer-logos-img" />
        </div>
      </div>
    </div>
  )
}

export default TabloideView