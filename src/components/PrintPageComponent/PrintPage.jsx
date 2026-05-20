import { useState } from 'react'
import TabloideView from '../TabloideViewComponent/TabloideView'
import './PrintPage.css'

function PrintPage({ horarios, salones, onVolver }) {
  const [salonSeleccionado, setSalonSeleccionado] = useState('')

  const salonesDisponibles = salones.filter(s => s !== 'Todos').sort()

  return (
    <div className="print-page">

      {/* Panel de control */}
      <div className="print-page__actions no-print">

        <button className="print-page__volver" onClick={onVolver}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver al dashboard
        </button>

        <div className="print-page__panel">
          <div className="print-page__panel-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            <h2>Imprimir Tabloide</h2>
          </div>

          <p className="print-page__instruccion">
            Selecciona el espacio que deseas imprimir. Se generará un tabloide
            en formato 11×17 pulgadas listo para imprimir.
          </p>

          <label className="print-page__label">Salón o laboratorio</label>
          <select
            className="print-page__select"
            value={salonSeleccionado}
            onChange={e => setSalonSeleccionado(e.target.value)}
          >
            <option value="">-- Elige un espacio --</option>
            {salonesDisponibles.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {salonSeleccionado && (
            <button className="print-page__btn" onClick={() => window.print()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimir {salonSeleccionado}
            </button>
          )}

          <div className="print-page__tip">
            💡 En el diálogo de impresión selecciona:
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              <li><strong>Tamaño: Tabloide (11×17)</strong></li>
              <li><strong>Orientación: Vertical (Retrato)</strong></li>
              <li><strong>Activar "Gráficos de fondo"</strong> (indispensable para ver los colores y marcas de agua).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Vista previa */}
      {salonSeleccionado ? (
        <div className="print-page__preview">
          <div className="print-page__preview-label no-print">
            Vista previa — {salonSeleccionado}
          </div>
          <div className="print-page__tabloide-wrap">
            <TabloideView salon={salonSeleccionado} horarios={horarios} />
          </div>
        </div>
      ) : (
        <div className="print-page__empty no-print">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          <p>Selecciona un salón para ver la vista previa</p>
        </div>
      )}

    </div>
  )
}

export default PrintPage