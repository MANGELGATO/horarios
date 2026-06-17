// AdminPanel.jsx
import { useState, useEffect, useMemo } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch, addDoc } from 'firebase/firestore'
import { db, eliminarSolicitudEquipo, autorizarCorreo, eliminarCorreoAutorizado } from '../../firebase'
import './AdminPanel.css'

const ROLES = ['estudiante', 'docente', 'servicio', 'administrativo', 'admin']
const ETIQUETAS_ROL = { estudiante: 'Estudiante', docente: 'Docente', servicio: 'Servicio', administrativo: 'Administrativo', admin: 'Admin', superadmin: 'Super Admin' }
const ETIQUETAS_CORTAS = { estudiante: 'Estu', docente: 'Doc', servicio: 'Serv', administrativo: 'Admini', admin: 'Admin', superadmin: 'S.Admin' }
const COLORES_ROL = { estudiante: '#2e7d32', docente: '#1565c0', servicio: '#6d28d9', administrativo: '#e65100', admin: '#c62828', superadmin: '#b71c1c' }

// ── Helpers e Inteligencia de Parseo para PDF y Texto ──

const esSalon = (str) => {
  const s = str.trim().toLowerCase();
  if (s.includes('definir') || s.includes('por definir') || s.includes('aula por')) return false;
  return (
    s.includes('aula') ||
    s.includes('laboratorio') ||
    s.includes('lab') ||
    s.includes('taller') ||
    s.includes('salon') ||
    s.includes('salón') ||
    /^(pb\d+|m\d+|\d{3})$/i.test(s)
  );
};

function agruparYFusionarItemsPDF(rawItems) {
  const items = rawItems.filter(it => it.str && it.str.trim() !== '');
  if (items.length === 0) return [];

  const rows = [];
  items.forEach(item => {
    const x = item.transform[4];
    const y = item.transform[5];
    const width = item.width || 0;
    const height = item.height || 0;

    let placed = false;
    for (const row of rows) {
      if (Math.abs(row.y - y) < 6) {
        row.items.push({ text: item.str, x, y, width, height });
        placed = true;
        break;
      }
    }
    if (!placed) {
      rows.push({ y, items: [{ text: item.str, x, y, width, height }] });
    }
  });

  rows.sort((a, b) => b.y - a.y);

  const mergedItems = [];
  rows.forEach(row => {
    row.items.sort((a, b) => a.x - b.x);

    const rowMerged = [];
    let current = row.items[0];

    for (let i = 1; i < row.items.length; i++) {
      const next = row.items[i];
      const distance = next.x - (current.x + current.width);
      
      if (distance < 4) {
        const needsSpace = !current.text.endsWith(' ') && !next.text.startsWith(' ');
        current.text += (needsSpace ? ' ' : '') + next.text;
        current.width = (next.x + next.width) - current.x;
      } else {
        rowMerged.push(current);
        current = next;
      }
    }
    rowMerged.push(current);
    mergedItems.push(...rowMerged);
  });

  return mergedItems;
}

export function parsearUTJPdfConCoordenadas(rawItems, defaultCarrera = 'DSM', defaultTurno = 'Matutino', defaultGrupo = '1A') {
  const items = rawItems.length > 0 && 'text' in rawItems[0]
    ? rawItems
    : agruparYFusionarItemsPDF(rawItems);
  if (items.length === 0) return [];

  const diasBuscados = ['LUNES', 'MARTES', 'MIERCOLES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
  const diasSemanaMap = {
    'LUNES': 'Lunes',
    'MARTES': 'Martes',
    'MIERCOLES': 'Miércoles',
    'MIÉRCOLES': 'Miércoles',
    'JUEVES': 'Jueves',
    'VIERNES': 'Viernes'
  };

  const dayHeaders = items.filter(it => {
    const txt = it.text.trim().toUpperCase();
    return diasBuscados.includes(txt);
  });

  const dayAnchors = [];
  dayHeaders.forEach(h => {
    const txt = h.text.trim().toUpperCase();
    const name = diasSemanaMap[txt];
    if (name) {
      if (!dayAnchors.some(a => a.name === name)) {
        dayAnchors.push({ name, x: h.x });
      }
    }
  });

  dayAnchors.sort((a, b) => a.x - b.x);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  if (dayAnchors.length === 0) {
    dayAnchors.push({ name: 'Lunes', x: 120 });
    dayAnchors.push({ name: 'Martes', x: 220 });
    dayAnchors.push({ name: 'Miércoles', x: 320 });
    dayAnchors.push({ name: 'Jueves', x: 420 });
    dayAnchors.push({ name: 'Viernes', x: 520 });
  } else if (dayAnchors.length < 5) {
    let startX = 120;
    let dxCol = 100;
    
    if (dayAnchors.length > 1) {
      const diffs = [];
      for (let i = 0; i < dayAnchors.length - 1; i++) {
        diffs.push(dayAnchors[i+1].x - dayAnchors[i].x);
      }
      dxCol = diffs.reduce((sum, v) => sum + v, 0) / diffs.length;
    }
    
    const ref = dayAnchors[0];
    const refIdx = diasSemana.indexOf(ref.name);
    startX = ref.x - refIdx * dxCol;
    
    const completeDayAnchors = [];
    diasSemana.forEach((d, idx) => {
      const existing = dayAnchors.find(a => a.name === d);
      if (existing) {
        completeDayAnchors.push(existing);
      } else {
        completeDayAnchors.push({ name: d, x: startX + idx * dxCol });
      }
    });
    
    dayAnchors.length = 0;
    dayAnchors.push(...completeDayAnchors);
    dayAnchors.sort((a, b) => a.x - b.x);
  }

  const firstDayX = dayAnchors[0].x;
  const lastDayX = dayAnchors[dayAnchors.length - 1].x;
  const headerY = dayHeaders.length > 0 ? dayHeaders[0].y : 9999;

  // 1. Detectamos block items de la columna izquierda (números 1 a 8)
  const blockItems = items.filter(it => {
    const txt = it.text.trim();
    return /^[1-8](?:\s|$)/.test(txt) && it.x < firstDayX;
  });

  let blockAnchors = [];
  blockItems.forEach(b => {
    const match = b.text.trim().match(/^[1-8]/);
    if (match) blockAnchors.push({ num: Number(match[0]), y: b.y });
  });
  
  blockAnchors.sort((a, b) => b.y - a.y);

  // 2. Calcular la distancia vertical promedio (dy)
  let dy = 50; 
  if (blockAnchors.length > 1) {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < blockAnchors.length - 1; i++) {
      const diff = Math.abs(blockAnchors[i].y - blockAnchors[i + 1].y);
      if (diff > 20 && diff < 100) {
        sum += diff;
        count++;
      }
    }
    if (count > 0) dy = sum / count;
  } else {
    const gridYs = items
      .filter(it => it.x >= firstDayX - 25 && it.x <= lastDayX + 65 && it.y < headerY - 10)
      .map(it => it.y)
      .sort((a, b) => b - a);
    
    const diffs = [];
    for (let i = 0; i < gridYs.length - 1; i++) {
      const diff = Math.abs(gridYs[i] - gridYs[i + 1]);
      if (diff > 25 && diff < 80) {
        diffs.push(diff);
      }
    }
    if (diffs.length > 0) {
      dy = diffs.reduce((sum, val) => sum + val, 0) / diffs.length;
    }
  }

  if (dy < 30 || dy > 90) {
    dy = 50;
  }

  // 3. Proyectar/Reconstruir un listado COMPLETO de 8 bloques para garantizar que no se pierda nada
  if (blockAnchors.length > 0) {
    const refBlock = blockAnchors[0]; 
    const completeAnchors = [];
    for (let b = 1; b <= 8; b++) {
      const steps = b - refBlock.num;
      const projectedY = refBlock.y - steps * dy;
      completeAnchors.push({ num: b, y: projectedY });
    }
    blockAnchors = completeAnchors;
  } else {
    const completeAnchors = [];
    const startY = headerY - 45; 
    for (let b = 1; b <= 8; b++) {
      completeAnchors.push({ num: b, y: startY - (b - 1) * dy });
    }
    blockAnchors = completeAnchors;
  }

  blockAnchors.sort((a, b) => b.y - a.y);

  // Límites verticales basados en la proyección completa de los 8 bloques
  const upperLimit = blockAnchors[0].y + dy * 0.6;
  const lowerLimit = blockAnchors[blockAnchors.length - 1].y - dy * 0.6;

  // Parsear leyenda a la derecha del viernes (usando la Friday X de anclaje)
  const legendItems = items.filter(it => it.x > lastDayX + 60);
  const legendRows = [];
  legendItems.forEach(item => {
    let placed = false;
    for (const row of legendRows) {
      if (Math.abs(row.y - item.y) < 6) {
        row.items.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) {
      legendRows.push({ y: item.y, items: [item] });
    }
  });

  const subjectTeacherMap = {};
  legendRows.forEach(row => {
    row.items.sort((a, b) => a.x - b.x);
    const LEGEND_SKIP = ['materia', 'profesor', 'materia', 'hrs', 'dif', 'n°', 'no.'];
    const texts = row.items
      .map(it => it.text.trim())
      .filter(t => t.length > 3 && !LEGEND_SKIP.some(s => t.toLowerCase().includes(s)));
    if (texts.length >= 2) {
      const materiaName = texts[0];
      const teacherName = texts[texts.length - 1];
      const cleanTeacher = teacherName.replace(/^(ing\.|lic\.|mtro\.|mtra\.|dr\.|dra\.)\s+/i, '');
      subjectTeacherMap[materiaName.toLowerCase()] = cleanTeacher;
    }
  });

  // Agrupar celdas del horario
  const cellGroups = {};
  const gridItems = items.filter(it => {
    // 1. Debe estar en el rango horizontal de los días de la semana
    const inXRange = it.x >= firstDayX - 25 && it.x <= lastDayX + 65;
    if (!inXRange) return false;

    // 2. Debe estar dentro del rango vertical completo proyectado de las clases
    if (it.y > upperLimit || it.y < lowerLimit) return false;

    // 3. Ignorar encabezados de días explicitamente
    const txt = it.text.trim().toUpperCase();
    if (diasBuscados.includes(txt)) return false;

    // 4. Ignorar textos comunes que son metadatos y no materias
    const txtLower = txt.toLowerCase();
    const blacklist = [
      'sede:', 'alumnos:', 'no. alumnos', 'grupo:', 'carrera:', 'periodo:', 'cuatrimestre:', 'turno:', 'edificio:',
      'universidad tecnológica', 'utj', 'plan de', 'generado', 'página', 'pagina', 'fecha', 'horario', 'bloque',
      'lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo',
      'receso', 'matutino', 'vespertino', 'ccd', 'asignatura', 'asíncrona', 'asincrona',
      'virtual', 'integrada', 'horarios', 'distribución', 'distribucion', 'materia', 'profesor', 'hrs', 'dif'
    ];
    if (blacklist.some(term => txtLower.includes(term))) return false;

    // 5. Ignorar números de bloques aislados
    if (/^[1-8]$/.test(it.text.trim())) return false;

    return true;
  });
  
  // Extraer horarios de cada bloque (ej: "16:20 – 17:10")
  const timeMap = {};
  items.forEach(it => {
    const match = it.text.trim().match(/^(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})$/);
    if (match && it.x < firstDayX - 10) {
      let nearestBlock = blockAnchors[0]?.num || 1;
      let nearestDist = Math.abs(it.y - (blockAnchors[0]?.y || 0));
      for (let i = 1; i < blockAnchors.length; i++) {
        const dist = Math.abs(it.y - blockAnchors[i].y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestBlock = blockAnchors[i].num;
        }
      }
      if (nearestDist < dy * 1.5) {
        timeMap[nearestBlock] = it.text;
      }
    }
  });
  
  // Asignar items a celdas por día y bloque
  // Primero agrupar por día
  const dayItemGroups = {};
  gridItems.forEach(it => {
    let closestDay = dayAnchors[0].name;
    let minDayDist = Math.abs(it.x - dayAnchors[0].x);
    for (let i = 1; i < dayAnchors.length; i++) {
      const dist = Math.abs(it.x - dayAnchors[i].x);
      if (dist < minDayDist) {
        minDayDist = dist;
        closestDay = dayAnchors[i].name;
      }
    }
    if (!dayItemGroups[closestDay]) dayItemGroups[closestDay] = [];
    dayItemGroups[closestDay].push(it);
  });
  
  // Dentro de cada día, ordenar por Y y asignar a bloques consecutivamente
  Object.entries(dayItemGroups).forEach(([day, items]) => {
    items.sort((a, b) => b.y - a.y);
    let blockIdx = 0;
    items.forEach(it => {
      if (blockIdx < blockAnchors.length - 1) {
        const curDist = Math.abs(it.y - blockAnchors[blockIdx].y);
        const nextDist = Math.abs(it.y - blockAnchors[blockIdx + 1].y);
        if (nextDist < curDist) {
          blockIdx++;
        }
      }
      const key = `${day}-${blockAnchors[blockIdx].num}`;
      if (!cellGroups[key]) cellGroups[key] = [];
      cellGroups[key].push(it);
    });
  });
  
  // Post-process: mover salones huérfanos al bloque anterior
  const diasList = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  diasList.forEach(dia => {
    for (let b = 2; b <= 8; b++) {
      const key = `${dia}-${b}`;
      const prevKey = `${dia}-${b - 1}`;
      if (!cellGroups[key] || !cellGroups[prevKey]) continue;
      const tieneMateria = cellGroups[key].some(it => !esSalon(it.text));
      if (!tieneMateria) {
        cellGroups[key].forEach(it => cellGroups[prevKey].push(it));
        delete cellGroups[key];
      }
    }
  });

  const clases = [];
  Object.entries(cellGroups).forEach(([key, cellItems]) => {
    const [dia, bloqueStr] = key.split('-');
    const bloque = Number(bloqueStr);
    
    if (cellItems.length === 0) return;
    
    // Unir items por X y extraer salón y materia
    cellItems.sort((a, b) => a.x - b.x);
    const tokens = cellItems
      .map(it => it.text.trim())
      .filter(Boolean)
      .join(' ')
      .split(/\s+/);
    
    let salon = '';
    const materiaTokens = [];
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (esSalon(token)) {
        const roomParts = [token];
        let j = i + 1;
        while (j < tokens.length && (/^(?:pb)?\d+$/i.test(tokens[j]) || /^m\d+$/i.test(tokens[j]))) {
          roomParts.push(tokens[j]);
          j++;
        }
        salon = roomParts.join(' ');
        i = j - 1;
      } else if (!/^[1-9]$/.test(token)) {
        materiaTokens.push(token);
      }
    }
    
    // Fallback: si algo parece salón al final del texto combinado
    if (!salon) {
      const combined = tokens.join(' ');
      const salonMatch = combined.match(/(Aula|Laboratorio|Lab|Taller|Salón|Salon|PB\d+|M\d+)\s*:?\s*[\w\d]+/i);
      if (salonMatch) salon = salonMatch[0];
    }
    
    let materia = materiaTokens.join(' ').trim();
    if (!materia) return;
    
    // Filtro secundario de materia para evitar basuras
    const matLower = materia.toLowerCase();
    const blacklistMateria = [
      'sede:', 'alumnos:', 'no. alumnos', 'grupo:', 'carrera:', 'periodo:', 'cuatrimestre:', 'turno:', 'aula:', 'edificio:',
      'universidad', 'tecnológica', 'utj', 'generado', 'página', 'pagina', 'fecha', 'horario', 'bloque',
      'lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo', 'receso',
      'materia', 'profesor', 'hrs', 'dif'
    ];
    if (blacklistMateria.some(term => matLower.includes(term))) return;
    if (materia.length < 3) return; // Filtramos materias extremadamente cortas
    
    if (!salon) salon = 'Aula por definir';
    
    let profesor = 'Por Asignar';
    const materiaLower = materia.toLowerCase();
    if (subjectTeacherMap[materiaLower]) {
      profesor = subjectTeacherMap[materiaLower];
    } else {
      const matchKey = Object.keys(subjectTeacherMap).find(k => 
        materiaLower.includes(k) || k.includes(materiaLower)
      );
      if (matchKey) {
        profesor = subjectTeacherMap[matchKey];
      }
    }
    
    clases.push({
      id: Math.random().toString(36).substr(2, 9),
      carrera: defaultCarrera,
      turno: defaultTurno,
      grupo: defaultGrupo,
      dia,
      diaVirtual: '',
      bloque,
      horario: timeMap[bloque] || '',
      materia,
      profesor,
      salon,
      proyector: ''
    });
  });
  
  return clases;
}

export function parsearHorariosDeTexto(texto, defaultCarrera = 'DSM', defaultTurno = 'Matutino') {
  const lineas = texto.split('\n');
  const clases = [];
  let diaActual = 'Lunes';

  const buscarDia = (str) => {
    const s = str.toLowerCase();
    if (s.includes('lunes')) return 'Lunes';
    if (s.includes('martes')) return 'Martes';
    if (s.includes('miercoles') || s.includes('miércoles')) return 'Miércoles';
    if (s.includes('jueves')) return 'Jueves';
    if (s.includes('viernes')) return 'Viernes';
    return null;
  };

  for (let linea of lineas) {
    linea = linea.trim();
    if (!linea) continue;

    const diaEncontrado = buscarDia(linea);
    if (diaEncontrado && linea.length < 20) {
      diaActual = diaEncontrado;
      continue;
    }

    let partes = linea.split(/\t|\||\s{2,}/).map(p => p.trim()).filter(Boolean);
    if (partes.length < 2) {
      partes = linea.split(' ').map(p => p.trim()).filter(Boolean);
    }

    if (partes.length < 2) continue;

    let salon = '';
    let bloque = 1;
    let diaEnLinea = diaActual;
    let materia = '';
    let profesor = '';

    partes.forEach(part => {
      const d = buscarDia(part);
      if (d) diaEnLinea = d;
    });

    const bloquePartIndex = partes.findIndex(p => /^(b|bloque)?\s*[1-8]$/i.test(p));
    if (bloquePartIndex !== -1) {
      const match = partes[bloquePartIndex].match(/[1-8]/);
      if (match) bloque = Number(match[0]);
      partes.splice(bloquePartIndex, 1);
    }

    const salonPartIndex = partes.findIndex(p => esSalon(p));
    if (salonPartIndex !== -1) {
      salon = partes[salonPartIndex];
      partes.splice(salonPartIndex, 1);
    } else {
      salon = 'Aula 501';
    }

    if (partes.length === 1) {
      materia = partes[0];
      profesor = 'Por Asignar';
    } else if (partes.length >= 2) {
      materia = partes[0];
      profesor = partes.slice(1).join(' ');
    } else {
      continue;
    }

    clases.push({
      id: Math.random().toString(36).substr(2, 9),
      carrera: defaultCarrera,
      turno: defaultTurno,
      grupo: '1A',
      dia: diaEnLinea,
      diaVirtual: '',
      bloque,
      materia,
      profesor,
      salon,
      proyector: ''
    });
  }

  return clases;
}

function AdminPanel({ usuario, horariosDinamicos = [], setVista }) {
  const [tabActiva, setTabActiva] = useState('usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [correosAutorizados, setCorreosAutorizados] = useState([])
  const [nuevoCorreoAuth, setNuevoCorreoAuth] = useState('')
  const [nuevoRolAuth, setNuevoRolAuth] = useState('docente')
  const [cargando, setCargando] = useState(true)
  const [editandoRol, setEditandoRol] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [confirmandoReset, setConfirmandoReset] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [vistaTarjetas, setVistaTarjetas] = useState(false)
  const [paginaUsuarios, setPaginaUsuarios] = useState(1)
  const [paginaHorarios, setPaginaHorarios] = useState(1)
  const ITEMS_POR_PAGINA = 50

  // Estados del CRUD de Horarios
  const [filtroCarrera, setFiltroCarrera] = useState('Todas')
  const [filtroTurno, setFiltroTurno] = useState('Todos')
  const [filtroSalon, setFiltroSalon] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => { setPaginaHorarios(1) }, [filtroCarrera, filtroTurno, filtroSalon, busqueda])

  // ── Estados para el Importador Inteligente (PDF & Texto) ──
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false)
  const [tabImportar, setTabImportar] = useState('pdf') // 'pdf' o 'texto'
  const [textoImportar, setTextoImportar] = useState('')
  const [cargandoImportar, setCargandoImportar] = useState(false)
  const [clasesImportadas, setClasesImportadas] = useState([]) // Clases parsed
  
  // Controles de lote para la importación
  const [carreraImportar, setCarreraImportar] = useState('DSM')
  const [grupoImportar, setGrupoImportar] = useState('1A')
  const [turnoImportar, setTurnoImportar] = useState('Matutino')
  const [diaVirtualImportar, setDiaVirtualImportar] = useState('')
  const [guardandoImportacion, setGuardandoImportacion] = useState(false)

  // Carga dinámica de Mozilla PDF.js
  const cargarPdfJs = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = (err) => {
        reject(new Error('No se pudo cargar la librería PDF.js. Verifica tu conexión.'));
      };
      document.body.appendChild(script);
    });
  };

  const MAP_GRADO = {
    'primero': '1', 'segundo': '2', 'tercero': '3', 'cuarto': '4',
    'quinto': '5', 'sexto': '6', 'septimo': '7', 'octavo': '8',
    'noveno': '9', 'decimo': '10'
  };

  const extraerCarreraTurno = (items) => {
    const titleIdx = items.findIndex(it =>
      it.text.toUpperCase().includes('HORARIOS')
    );
    if (titleIdx === -1) return { carrera: 'DSM', turno: 'Matutino' };
    let titleText = items[titleIdx].text;
    const titleItem = items[titleIdx];
    if (titleItem.y !== undefined) {
      const sameLine = items
        .slice(titleIdx + 1)
        .filter(it => it.y !== undefined && Math.abs(it.y - titleItem.y) < 6)
        .sort((a, b) => a.x - b.x);
      if (sameLine.length > 0) {
        titleText += ' ' + sameLine.map(it => it.text).join(' ');
      }
    }
    const match = titleText.match(/HORARIOS\s+(.+?)\s+TURNO\s+(.+)/i);
    if (!match) return { carrera: 'DSM', turno: 'Matutino' };
    const rawCarrera = match[1].trim().toUpperCase();
    const rawTurno = match[2].trim();
    const turno = rawTurno.charAt(0).toUpperCase() + rawTurno.slice(1).toLowerCase();
    let carrera = 'DSM';
    if (rawCarrera.includes('DGS')) carrera = 'IDGS';
    else if (rawCarrera.includes('EVND')) carrera = 'EVND';
    else if (rawCarrera.includes('TIDSM') || rawCarrera.includes('DSM')) carrera = 'DSM';
    else if (rawCarrera.includes('ITI')) carrera = 'ITI';
    else carrera = rawCarrera;
    return { carrera, turno };
  };

  const extraerGrupo = (items, desdeIdx = 0) => {
    const grupoIdx = items.findIndex((it, i) => i >= desdeIdx && /^Grupo/i.test(it.text.trim()));
    if (grupoIdx === -1) return '';
    const grupoItem = items[grupoIdx];
    let text = grupoItem.text.replace(/^Grupo:\s*/i, '').trim();
    if (!text && grupoItem.y !== undefined) {
      const grupoY = grupoItem.y;
      const rightItems = items
        .slice(grupoIdx + 1)
        .filter(it => it.y !== undefined && Math.abs(it.y - grupoY) < 6)
        .sort((a, b) => a.x - b.x);
      text = rightItems.map(it => it.text).join(' ').trim();
    }
    if (!text) return '';
    const match = text.match(/(\S+)\s+(\S+)/);
    if (match) {
      const grado = MAP_GRADO[match[1].toLowerCase()] || match[1];
      return grado + match[2];
    }
    return text;
  };

  const procesarArchivoPDF = async (file) => {
    if (!file) return;
    setCargandoImportar(true);
    try {
      const pdfjs = await cargarPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const typedarray = new Uint8Array(arrayBuffer);
      const pdfDoc = await pdfjs.getDocument({ data: typedarray }).promise;

      let todasLasClases = [];
      let metadataGlobal = { carrera: 'DSM', turno: 'Matutino' };

      for (let p = 1; p <= pdfDoc.numPages; p++) {
        const page = await pdfDoc.getPage(p);
        const textContent = await page.getTextContent();
        const items = agruparYFusionarItemsPDF(textContent.items);
        if (items.length === 0) continue;

        if (p === 1) metadataGlobal = extraerCarreraTurno(items);

        const grupoIndices = [];
        items.forEach((item, idx) => {
          if (/^Grupo:\s/i.test(item.text.trim())) grupoIndices.push(idx);
        });

        if (grupoIndices.length === 0) {
          const clases = parsearUTJPdfConCoordenadas(
            items, metadataGlobal.carrera, metadataGlobal.turno, ''
          );
          todasLasClases = [...todasLasClases, ...clases];
        } else {
          for (let g = 0; g < grupoIndices.length; g++) {
            const startIdx = grupoIndices[g];
            const endIdx = g < grupoIndices.length - 1 ? grupoIndices[g + 1] : items.length;
            const groupItems = items.slice(startIdx, endIdx);
            const grupo = extraerGrupo(items, startIdx);
            const clases = parsearUTJPdfConCoordenadas(
              groupItems, metadataGlobal.carrera, metadataGlobal.turno, grupo
            );
            todasLasClases = [...todasLasClases, ...clases];
          }
        }
      }

      if (todasLasClases.length === 0) {
        alert('No se detectaron clases en la cuadrícula. Intenta con la pestaña de pegado manual.');
      } else {
        setClasesImportadas(todasLasClases.map(c => ({ ...c, seleccionado: true })));
        const primera = todasLasClases[0];
        if (primera) {
          if (primera.carrera) setCarreraImportar(primera.carrera);
          if (primera.grupo) setGrupoImportar(primera.grupo);
          if (primera.turno) setTurnoImportar(primera.turno);
        }
        mostrarMensaje(`¡PDF procesado! Se detectaron ${todasLasClases.length} clases.`);
      }
    } catch (err) {
      console.error(err);
      alert('Error al leer el PDF: ' + err.message);
    } finally {
      setCargandoImportar(false);
    }
  };

  const procesarTextoImportar = () => {
    if (!textoImportar.trim()) {
      alert('Por favor, pega el texto del horario primero.');
      return;
    }
    setCargandoImportar(true);
    try {
      const clases = parsearHorariosDeTexto(textoImportar, carreraImportar, turnoImportar);
      if (clases.length === 0) {
        alert('No se detectaron clases en el texto. Verifica el formato.');
      } else {
        setClasesImportadas(clases.map(c => ({ 
          ...c, 
          seleccionado: true, 
          carrera: carreraImportar, 
          turno: turnoImportar,
          grupo: grupoImportar
        })));
        mostrarMensaje(`Se reconocieron ${clases.length} clases del texto.`);
      }
    } catch (err) {
      alert('Error al parsear texto: ' + err.message);
    } finally {
      setCargandoImportar(false);
    }
  };

  const BATCH_LIMIT = 500;

  const confirmarImportacion = async () => {
    const clasesAImportar = clasesImportadas.filter(c => c.seleccionado);
    if (clasesAImportar.length === 0) {
      alert('No has seleccionado ninguna clase para importar.');
      return;
    }
    
    if (!confirm(`¿Seguro que deseas importar ${clasesAImportar.length} clases al horario dinámico de Firestore?`)) {
      return;
    }
    
    setGuardandoImportacion(true);
    try {
      for (let i = 0; i < clasesAImportar.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        const chunk = clasesAImportar.slice(i, i + BATCH_LIMIT);
        
        chunk.forEach(clase => {
          const docRef = doc(collection(db, 'horarios'));
          batch.set(docRef, {
            carrera: clase.carrera,
            carreraLabel: clase.carrera,
            turno: clase.turno,
            turnoLabel: clase.turno,
            grupo: clase.grupo,
            grupoLabel: clase.grupo,
            dia: clase.dia,
            diaVirtual: clase.diaVirtual || '',
            bloque: Number(clase.bloque),
            bloqueNumero: Number(clase.bloque),
            materia: clase.materia.trim(),
            materiaLabel: clase.materia.trim(),
            profesor: clase.profesor.trim(),
            profesorLabel: clase.profesor.trim(),
            salon: clase.salon.trim(),
            salonLabel: clase.salon.trim(),
            proyector: clase.proyector || '',
            proyectorAsignado: clase.proyector || '',
            requiereProyector: !!clase.proyector
          });
        });
        
        await batch.commit();
      }
      mostrarMensaje(`¡Éxito! Se importaron ${clasesAImportar.length} clases correctamente.`);
      setModalImportarAbierto(false);
      setClasesImportadas([]);
      setTextoImportar('');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la importación: ' + err.message);
    } finally {
      setGuardandoImportacion(false);
    }
  };

  const [modalAbierto, setModalAbierto] = useState(false)
  const [claseEdicion, setClaseEdicion] = useState(null)
  const [guardandoClase, setGuardandoClase] = useState(false)

  const [formClase, setFormClase] = useState({
    carrera: 'DSM',
    turno: 'Matutino',
    grupo: '1A',
    dia: 'Lunes',
    diaVirtual: '',
    bloque: 1,
    materia: '',
    profesor: '',
    salon: 'Aula 501',
    proyector: ''
  })

  const opcionesCRUD = useMemo(() => {
    const carreras = [...new Set(horariosDinamicos.map(h => h.carrera))].filter(Boolean).sort()
    const grupos = [...new Set(horariosDinamicos.map(h => h.grupo))].filter(Boolean).sort()
    const salones = [...new Set(horariosDinamicos.map(h => h.salon))].filter(Boolean).sort()
    const turnos = [...new Set(horariosDinamicos.map(h => h.turno))].filter(Boolean).sort()
    return {
      carreras: carreras.length > 0 ? carreras : ['DSM', 'ITI'],
      grupos: grupos.length > 0 ? grupos : ['1A', '1B', '2A', '2B', '3A', '3B'],
      salones: salones.length > 0 ? salones : ['Aula 501', 'Aula 502', 'Laboratorio M02', 'Laboratorio M05'],
      turnos: turnos.length > 0 ? turnos : ['Matutino', 'Vespertino']
    }
  }, [horariosDinamicos])

  const abrirModalCrear = () => {
    setClaseEdicion(null)
    setFormClase({
      carrera: opcionesCRUD.carreras[0] || 'DSM',
      turno: 'Matutino',
      grupo: opcionesCRUD.grupos[0] || '1A',
      dia: 'Lunes',
      diaVirtual: '',
      bloque: 1,
      materia: '',
      profesor: '',
      salon: opcionesCRUD.salones[0] || 'Aula 501',
      proyector: ''
    })
    setModalAbierto(true)
  }

  const abrirModalEditar = (clase) => {
    setClaseEdicion(clase)
    setFormClase({
      carrera: clase.carrera || '',
      turno: clase.turno || 'Matutino',
      grupo: clase.grupo || '',
      dia: clase.dia || 'Lunes',
      diaVirtual: clase.diaVirtual || '',
      bloque: Number(clase.bloque) || 1,
      materia: clase.materia || '',
      profesor: clase.profesor || '',
      salon: clase.salon || '',
      proyector: clase.proyector || ''
    })
    setModalAbierto(true)
  }

  const guardarClaseDB = async (e) => {
    e.preventDefault()
    if (!formClase.carrera || !formClase.grupo || !formClase.materia || !formClase.profesor || !formClase.salon) {
      alert('Por favor, llena todos los campos obligatorios.')
      return
    }
    setGuardandoClase(true)
    try {
      const docData = {
        carrera: formClase.carrera,
        carreraLabel: formClase.carrera,
        turno: formClase.turno,
        turnoLabel: formClase.turno,
        grupo: formClase.grupo,
        grupoLabel: formClase.grupo,
        dia: formClase.dia,
        diaVirtual: formClase.diaVirtual || '',
        bloque: Number(formClase.bloque),
        bloqueNumero: Number(formClase.bloque),
        materia: formClase.materia.trim(),
        materiaLabel: formClase.materia.trim(),
        profesor: formClase.profesor.trim(),
        profesorLabel: formClase.profesor.trim(),
        salon: formClase.salon,
        salonLabel: formClase.salon,
        proyector: formClase.proyector || '',
        proyectorAsignado: formClase.proyector || '',
        requiereProyector: !!formClase.proyector
      }

      if (claseEdicion) {
        await updateDoc(doc(db, 'horarios', claseEdicion.id), docData)
        mostrarMensaje('Clase actualizada con éxito')
      } else {
        await addDoc(collection(db, 'horarios'), docData)
        mostrarMensaje('Clase creada con éxito')
      }
      setModalAbierto(false)
    } catch (err) {
      console.error('Error al guardar clase:', err)
      mostrarMensaje('Error al guardar: ' + err.message)
    }
    setGuardandoClase(false)
  }

  const eliminarClaseDB = async (claseId) => {
    if (!confirm('¿Eliminar esta clase permanentemente del horario?')) return
    try {
      await deleteDoc(doc(db, 'horarios', claseId))
      mostrarMensaje('Clase eliminada')
    } catch (err) {
      console.error('Error al eliminar clase:', err)
      mostrarMensaje('Error: ' + err.message)
    }
  }

  const inicializarSemilla = async () => {
    if (!confirm('¿Seguro que deseas inicializar Firestore con los horarios estáticos de semilla?\n\nEsto creará todas las clases en la base de datos y facilitará las pruebas.')) return
    setSeeding(true)
    mostrarMensaje('Iniciando carga de semilla de horarios...')
    try {
      const { horarios: staticHorarios } = await import('../../data/horarios')
      const batchLimit = 500
      let batch = writeBatch(db)
      let count = 0
      let totalCount = 0

      for (const h of staticHorarios) {
        const docRef = doc(collection(db, 'horarios'))
        batch.set(docRef, {
          carrera: h.carrera,
          carreraLabel: h.carrera,
          turno: h.turno,
          turnoLabel: h.turno,
          grupo: h.grupo,
          grupoLabel: h.grupo,
          dia: h.dia,
          diaVirtual: h.diaVirtual || '',
          bloque: Number(h.bloque),
          bloqueNumero: Number(h.bloque),
          materia: h.materia,
          materiaLabel: h.materia,
          profesor: h.profesor,
          profesorLabel: h.profesor,
          salon: h.salon,
          salonLabel: h.salon,
          proyector: h.proyector || '',
          proyectorAsignado: h.proyector || '',
          requiereProyector: !!h.proyector
        })
        count++
        totalCount++

        if (count === batchLimit) {
          await batch.commit()
          batch = writeBatch(db)
          count = 0
          mostrarMensaje(`Cargados ${totalCount} de ${staticHorarios.length}...`)
        }
      }

      if (count > 0) {
        await batch.commit()
      }

      mostrarMensaje(`¡Semilla inicializada con éxito! ${totalCount} clases cargadas.`)
    } catch (err) {
      console.error('Error al sembrar horarios:', err)
      mostrarMensaje('Error al sembrar: ' + err.message)
    }
    setSeeding(false)
  }

  useEffect(() => {
    const qUsuarios = query(collection(db, 'usuarios'), orderBy('createdAt', 'desc'))
    const unsubsUsuarios = onSnapshot(qUsuarios, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUsuarios(data)
      setCargando(false)
    }, (err) => {
      setMensaje('Error al cargar usuarios: ' + err.message)
      setCargando(false)
    })

    const qSol = query(collection(db, 'solicitudes_equipo'), orderBy('timestamp', 'desc'))
    const unsubsSol = onSnapshot(qSol, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setSolicitudes(data)
    })

    const qAuth = query(collection(db, 'correos_autorizados'), orderBy('timestamp', 'desc'))
    const unsubsAuth = onSnapshot(qAuth, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ email: doc.id, ...doc.data() }))
      setCorreosAutorizados(data)
    })

    return () => {
      unsubsUsuarios()
      unsubsSol()
      unsubsAuth()
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setVistaTarjetas(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const mostrarMensaje = (texto) => {
    setMensaje(texto)
    setTimeout(() => setMensaje(''), 3000)
  }

  const cambiarRol = async (userId, nuevoRol) => {
    try {
      await updateDoc(doc(db, 'usuarios', userId), { rol: nuevoRol })
      mostrarMensaje(`Rol actualizado a ${ETIQUETAS_ROL[nuevoRol]}`)
      setEditandoRol(null)
    } catch (err) {
      mostrarMensaje('Error al actualizar rol: ' + err.message)
    }
  }

  const toggleActivo = async (userId, activo) => {
    try {
      await updateDoc(doc(db, 'usuarios', userId), { activo: !activo })
      mostrarMensaje(activo ? 'Usuario desactivado' : 'Usuario activado')
    } catch (err) {
      mostrarMensaje('Error: ' + err.message)
    }
  }

  const eliminarUsuario = async (userId) => {
    if (!confirm('¿Eliminar este usuario permanentemente?')) return
    try {
      await deleteDoc(doc(db, 'usuarios', userId))
      mostrarMensaje('Usuario eliminado')
    } catch (err) {
      mostrarMensaje('Error: ' + err.message)
    }
  }

  const reiniciarPreferencias = async (userId) => {
    if (!confirm('¿Reiniciar preferencias de este usuario?')) return
    try {
      await updateDoc(doc(db, 'usuarios', userId), { preferencias: null })
      mostrarMensaje('Preferencias reiniciadas')
    } catch (err) {
      mostrarMensaje('Error: ' + err.message)
    }
  }

  const reiniciarTodosEstudiantes = async () => {
    if (!confirm('¿Reiniciar preferencias de TODOS los estudiantes?\n\nEsto borrará su carrera, grupo y turno guardados.\nTendrán que configurarlo de nuevo al iniciar sesión.')) return
    setConfirmandoReset(true)
    try {
      const estudiantes = usuarios.filter(u => u.rol === 'estudiante' && u.preferencias)
      const batch = writeBatch(db)
      estudiantes.forEach(u => {
        batch.update(doc(db, 'usuarios', u.id), { preferencias: null })
      })
      await batch.commit()
      mostrarMensaje(`${estudiantes.length} estudiantes reiniciados`)
    } catch (err) {
      mostrarMensaje('Error al reiniciar estudiantes: ' + err.message)
    }
    setConfirmandoReset(false)
  }

  if (cargando) {
    return (
      <div className="admin-panel">
        <div className="admin-loading">Cargando usuarios...</div>
      </div>
    )
  }

  const totalEstudiantes = usuarios.filter(u => u.rol === 'estudiante').length
  const estudiantesConPrefs = usuarios.filter(u => u.rol === 'estudiante' && u.preferencias)

  // Componente de tarjeta para móvil
  const TarjetaUsuario = ({ u }) => {
    const prefs = u.preferencias
    const esEstudiante = u.rol === 'estudiante'

    return (
      <div className={`admin-tarjeta ${!u.activo ? 'admin-tarjeta--inactivo' : ''}`}>
        <div className="admin-tarjeta-header">
          <div className="admin-tarjeta-avatar">
            {u.foto ? (
              <img className="admin-avatar" src={u.foto} alt="" />
            ) : (
              <div className="admin-avatar admin-avatar--placeholder">
                {(u.nombre || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="admin-tarjeta-info">
            <div className="admin-tarjeta-nombre">{u.nombre || 'Sin nombre'}</div>
            <div className="admin-tarjeta-email">{u.email}</div>
          </div>
          <div className="admin-tarjeta-acciones">
            {u.id !== usuario.uid && (
              <>
                <button
                  className="admin-btn admin-btn--editar"
                  onClick={() => setEditandoRol(editandoRol === u.id ? null : u.id)}
                  title="Cambiar rol"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="admin-btn admin-btn--eliminar"
                  onClick={() => eliminarUsuario(u.id)}
                  title="Eliminar usuario"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="admin-tarjeta-body">
          <div className="admin-tarjeta-campo">
            <span className="admin-tarjeta-campo-label">Rol:</span>
            {editandoRol === u.id ? (
              <select
                className="admin-select"
                defaultValue={u.rol}
                onChange={(e) => cambiarRol(u.id, e.target.value)}
                onBlur={() => setEditandoRol(null)}
                autoFocus
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{ETIQUETAS_ROL[r]}</option>
                ))}
              </select>
            ) : (
              <span
                className="admin-rol-badge"
                style={{ background: COLORES_ROL[u.rol] + '20', color: COLORES_ROL[u.rol] }}
              >
                {ETIQUETAS_ROL[u.rol] || u.rol}
              </span>
            )}
          </div>

          <div className="admin-tarjeta-campo">
            <span className="admin-tarjeta-campo-label">Estado:</span>
            <span className={`admin-estado ${u.activo ? 'admin-estado--activo' : 'admin-estado--inactivo'}`}>
              {u.activo ? 'Activo' : 'Inactivo'}
            </span>
            {u.id !== usuario.uid && (
              <button
                className={`admin-btn-small ${u.activo ? 'admin-btn-small--desactivar' : 'admin-btn-small--activar'}`}
                onClick={() => toggleActivo(u.id, u.activo)}
              >
                {u.activo ? 'Desactivar' : 'Activar'}
              </button>
            )}
          </div>

          {esEstudiante && (
            <div className="admin-tarjeta-campo">
              <span className="admin-tarjeta-campo-label">Horario:</span>
              {prefs ? (
                <div className="admin-prefs-badges">
                  <span className="admin-prefs-badge admin-prefs-badge--carrera">{prefs.carrera}</span>
                  <span className="admin-prefs-badge admin-prefs-badge--grupo">{prefs.grupo}</span>
                  <span className="admin-prefs-badge admin-prefs-badge--turno">{prefs.turno}</span>
                </div>
              ) : (
                <span className="admin-prefs-empty">Sin configurar</span>
              )}
              {prefs && u.id !== usuario.uid && (
                <button
                  className="admin-btn-small admin-btn-small--reset"
                  onClick={() => reiniciarPreferencias(u.id)}
                >
                  Reiniciar
                </button>
              )}
            </div>
          )}

          {!esEstudiante && prefs && (
            <div className="admin-tarjeta-campo">
              <span className="admin-tarjeta-campo-label">Preferencias:</span>
              <span className="admin-prefs-docente">{prefs.profesorLabel || prefs.profesorId || 'Configurado'}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const bloques = formClase.turno === 'Vespertino'
    ? [
        { id: 1, label: 'Bloque 1 (15:30 - 16:20)' },
        { id: 2, label: 'Bloque 2 (16:20 - 17:10)' },
        { id: 3, label: 'Bloque 3 (17:10 - 18:00)' },
        { id: 4, label: 'Bloque 4 (18:00 - 18:50)' },
        { id: 5, label: 'Bloque 5 (18:50 - 19:40)' },
        { id: 6, label: 'Bloque 6 (19:40 - 20:30)' },
        { id: 7, label: 'Bloque 7 (20:30 - 21:20)' },
      ]
    : [
        { id: 1, label: 'Bloque 1 (07:00 - 07:50)' },
        { id: 2, label: 'Bloque 2 (07:50 - 08:40)' },
        { id: 3, label: 'Bloque 3 (09:10 - 10:00)' },
        { id: 4, label: 'Bloque 4 (10:00 - 10:50)' },
        { id: 5, label: 'Bloque 5 (10:50 - 11:40)' },
        { id: 6, label: 'Bloque 6 (11:40 - 12:30)' },
        { id: 7, label: 'Bloque 7 (12:30 - 13:20)' },
        { id: 8, label: 'Bloque 8 (13:20 - 14:10)' },
      ]

  const filtrosCarreras = ['Todas', ...new Set(horariosDinamicos.map(h => h.carrera))].filter(Boolean).sort()
  const filtrosTurnos = ['Todos', ...new Set(horariosDinamicos.map(h => h.turno))].filter(Boolean).sort()
  const filtrosSalones = ['Todos', ...new Set(horariosDinamicos.map(h => h.salon))].filter(Boolean).sort()

  const horariosFiltradosAdmin = horariosDinamicos.filter(h => {
    if (filtroCarrera !== 'Todas' && h.carrera !== filtroCarrera) return false
    if (filtroTurno !== 'Todos' && h.turno !== filtroTurno) return false
    if (filtroSalon !== 'Todos' && h.salon !== filtroSalon) return false
    if (busqueda) {
      const b = busqueda.toLowerCase()
      const materia = (h.materia || '').toLowerCase()
      const profesor = (h.profesor || '').toLowerCase()
      if (!materia.includes(b) && !profesor.includes(b)) return false
    }
    return true
  })

  return (
    <div className="admin-panel">
      {/* ── Selector de Pestañas (Usuarios / Horarios) ── */}
      <div className="admin-tabs no-print">
        <button
          className={`admin-tab-btn ${tabActiva === 'usuarios' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setTabActiva('usuarios')}
        >
          👤 Gestión de Usuarios
        </button>
        <button
          className={`admin-tab-btn ${tabActiva === 'horarios' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setTabActiva('horarios')}
        >
          📅 Gestión de Horarios
        </button>
        <button
          className={`admin-tab-btn ${tabActiva === 'accesos' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setTabActiva('accesos')}
        >
          🔐 Accesos / Roles
        </button>
        <button
          className={`admin-tab-btn ${tabActiva === 'solicitudes' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setTabActiva('solicitudes')}
        >
          Solicitudes Equipo
          {solicitudes.length > 0 && <span className="admin-tab-badge">{solicitudes.length}</span>}
        </button>

        <button
          className="admin-tab-btn"
          onClick={() => window.dispatchEvent(new CustomEvent('cambiar-vista', { detail: 'bitacora' }))}
        >
          📝 Bitácoras Lab
        </button>
      </div>

      {mensaje && <div className="admin-toast">{mensaje}</div>}

      {/* ─────────────────────────────────────────────
         PESTAÑA 1: USUARIOS
         ───────────────────────────────────────────── */}
      {tabActiva === 'usuarios' && (
        <>
          <div className="admin-header">
            <div className="admin-header-top">
              <div>
                <h2 className="admin-title">Administración de usuarios</h2>
                <p className="admin-subtitle">{usuarios.length} usuarios · {totalEstudiantes} estudiantes ({estudiantesConPrefs.length} con horario configurado)</p>
              </div>
              {estudiantesConPrefs.length > 0 && (
                <button
                  className="admin-btn-reset-global"
                  onClick={reiniciarTodosEstudiantes}
                  disabled={confirmandoReset}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Reiniciar todos los estudiantes
                </button>
              )}
            </div>
          </div>

          {vistaTarjetas ? (
            <div className="admin-tarjetas">
              {usuarios.slice((paginaUsuarios-1)*ITEMS_POR_PAGINA, paginaUsuarios*ITEMS_POR_PAGINA).map(u => (
                <TarjetaUsuario key={u.id} u={u} />
              ))}
            </div>
          ) : (
            <div className="admin-tabla-container">
              <div className="admin-tabla">
                <div className="admin-tabla-header">
                  <span className="admin-col admin-col--foto"></span>
                  <span className="admin-col admin-col--nombre">Nombre</span>
                  <span className="admin-col admin-col--email">Email</span>
                  <span className="admin-col admin-col--rol">Rol</span>
                  <span className="admin-col admin-col--prefs">Horario</span>
                  <span className="admin-col admin-col--estado">Estado</span>
                  <span className="admin-col admin-col--acciones">Acciones</span>
                </div>

                {usuarios.slice((paginaUsuarios-1)*ITEMS_POR_PAGINA, paginaUsuarios*ITEMS_POR_PAGINA).map(u => {
                  const prefs = u.preferencias
                  const esEstudiante = u.rol === 'estudiante'

                  return (
                    <div key={u.id} className={`admin-fila ${!u.activo ? 'admin-fila--inactivo' : ''}`}>
                      <div className="admin-col admin-col--foto">
                        <div className="admin-avatar-wrapper">
                          {u.foto && (
                            <img
                              className="admin-avatar"
                              src={u.foto}
                              alt=""
                              onError={(e) => {
                                e.target.style.display = 'none'
                                const placeholder = e.target.parentElement.querySelector('.admin-avatar--placeholder')
                                if (placeholder) placeholder.style.display = 'flex'
                              }}
                            />
                          )}
                          <div
                            className="admin-avatar admin-avatar--placeholder"
                            style={{ display: u.foto ? 'none' : 'flex' }}
                          >
                            {(u.nombre || '?')[0].toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="admin-col admin-col--nombre">
                        <span className="admin-nombre">{u.nombre || 'Sin nombre'}</span>
                      </div>

                      <div className="admin-col admin-col--email">
                        <span className="admin-email">{u.email}</span>
                      </div>

                      <div className="admin-col admin-col--rol">
                        {editandoRol === u.id ? (
                          <select
                            className="admin-select"
                            defaultValue={u.rol}
                            onChange={(e) => cambiarRol(u.id, e.target.value)}
                            onBlur={() => setEditandoRol(null)}
                          >
                            {ROLES.map(r => (
                              <option key={r} value={r}>{ETIQUETAS_ROL[r]}</option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className="admin-rol-badge"
                            title={ETIQUETAS_ROL[u.rol] || u.rol}
                            style={{ background: COLORES_ROL[u.rol] + '20', color: COLORES_ROL[u.rol], borderColor: COLORES_ROL[u.rol] + '40' }}
                          >
                            {ETIQUETAS_ROL[u.rol] || u.rol}
                          </span>
                        )}
                      </div>

                      <div className="admin-col admin-col--prefs">
                        {esEstudiante && prefs ? (
                          <div className="admin-prefs-badges">
                            <span className="admin-prefs-badge admin-prefs-badge--carrera" title="Carrera">
                              {prefs.carrera}
                            </span>
                            <span className="admin-prefs-badge admin-prefs-badge--grupo" title="Grupo">
                              {prefs.grupo}
                            </span>
                            <span className="admin-prefs-badge admin-prefs-badge--turno" title="Turno">
                              {prefs.turno}
                            </span>
                          </div>
                        ) : esEstudiante ? (
                          <span className="admin-prefs-empty">Sin configurar</span>
                        ) : prefs ? (
                          <span className="admin-prefs-docente">
                            {prefs.profesorLabel || prefs.profesorId}
                          </span>
                        ) : (
                          <span className="admin-prefs-empty">—</span>
                        )}
                      </div>

                      <div className="admin-col admin-col--estado">
                        <span className={`admin-estado ${u.activo ? 'admin-estado--activo' : 'admin-estado--inactivo'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <div className="admin-col admin-col--acciones">
                        {u.id !== usuario.uid && (
                          <div className="admin-acciones">
                            <button
                              className="admin-btn admin-btn--editar"
                              onClick={() => setEditandoRol(editandoRol === u.id ? null : u.id)}
                              title="Cambiar rol"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            {esEstudiante && prefs && (
                              <button
                                className="admin-btn admin-btn--reset-prefs"
                                onClick={() => reiniciarPreferencias(u.id)}
                                title="Reiniciar horario (carrera, grupo, turno)"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="1 4 1 10 7 10" />
                                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                </svg>
                              </button>
                            )}
                            <button
                              className={`admin-btn ${u.activo ? 'admin-btn--desactivar' : 'admin-btn--activar'}`}
                              onClick={() => toggleActivo(u.id, u.activo)}
                              title={u.activo ? 'Desactivar' : 'Activar'}
                            >
                              {u.activo ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              )}
                            </button>
                            <button
                              className="admin-btn admin-btn--eliminar"
                              onClick={() => eliminarUsuario(u.id)}
                              title="Eliminar usuario"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {Math.ceil(usuarios.length / ITEMS_POR_PAGINA) > 1 && (
            <div className="admin-paginacion">
              <button className="admin-paginacion__btn" disabled={paginaUsuarios <= 1} onClick={() => setPaginaUsuarios(p => Math.max(1, p - 1))}>‹ Anterior</button>
              <span className="admin-paginacion__info">{paginaUsuarios} de {Math.ceil(usuarios.length / ITEMS_POR_PAGINA)}</span>
              <button className="admin-paginacion__btn" disabled={paginaUsuarios >= Math.ceil(usuarios.length / ITEMS_POR_PAGINA)} onClick={() => setPaginaUsuarios(p => Math.min(Math.ceil(usuarios.length / ITEMS_POR_PAGINA), p + 1))}>Siguiente ›</button>
            </div>
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────
         PESTAÑA 2: CRUD DE HORARIOS (¡NUEVO!)
         ───────────────────────────────────────────── */}
      {tabActiva === 'horarios' && (
        <>
          <div className="admin-header">
            <div className="admin-header-top">
              <div>
                <h2 className="admin-title">Gestión de Horarios CCD</h2>
                <p className="admin-subtitle">{horariosDinamicos.length} registros de clases guardados en tiempo real</p>
              </div>
              <div className="admin-header-actions">
                <button
                  className="admin-btn-reset-global admin-btn-seed"
                  onClick={inicializarSemilla}
                  disabled={seeding}
                  title="Carga masiva inicial usando datos estáticos si Firestore está vacío"
                >
                  <span className="btn-icon">🌱</span>
                  {seeding ? 'Cargando Semilla...' : 'Cargar Semilla Local'}
                </button>
                <button
                  className="admin-btn-crear"
                  onClick={abrirModalCrear}
                >
                  <span className="btn-icon">➕</span>
                  Crear Clase
                </button>
                <button
                  className="admin-btn-reset-global admin-btn-seed"
                  style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                  onClick={() => setModalImportarAbierto(true)}
                  title="Importar horarios desde un archivo PDF o pegando texto"
                >
                  <span className="btn-icon">📥</span>
                  Importar PDF / Texto
                </button>
              </div>
            </div>
          </div>

          {/* Filtros del CRUD */}
          <div className="admin-filters-bar">
            <div className="admin-filter-group">
              <label>Carrera</label>
              <select value={filtroCarrera} onChange={e => setFiltroCarrera(e.target.value)}>
                {filtrosCarreras.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-filter-group">
              <label>Turno</label>
              <select value={filtroTurno} onChange={e => setFiltroTurno(e.target.value)}>
                {filtrosTurnos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="admin-filter-group">
              <label>Salón</label>
              <select value={filtroSalon} onChange={e => setFiltroSalon(e.target.value)}>
                {filtrosSalones.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="admin-filter-group admin-filter-group--search">
              <label>Buscar Materia / Profesor</label>
              <input
                type="text"
                placeholder="Escribe para filtrar..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {vistaTarjetas ? (
            /* Vista Móvil para Horarios */
            <div className="admin-tarjetas admin-tarjetas--horarios">
              {horariosFiltradosAdmin.length === 0 ? (
                <div className="admin-tarjeta admin-tarjeta--empty">Sin resultados</div>
              ) : (
                horariosFiltradosAdmin.slice((paginaHorarios-1)*ITEMS_POR_PAGINA, paginaHorarios*ITEMS_POR_PAGINA).map(h => (
                  <div key={h.id} className="admin-tarjeta">
                    <div className="admin-tarjeta-header">
                      <span className="admin-prefs-badge admin-prefs-badge--carrera">{h.carrera} · {h.grupo}</span>
                      <span className="admin-tarjeta-salon">{h.salon}</span>
                    </div>
                    <div className="admin-tarjeta-body">
                      <div className="admin-tarjeta-materia" style={{ fontWeight: '700', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                        {h.materia}
                      </div>
                      <div className="admin-tarjeta-profesor" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        👤 {h.profesor}
                      </div>
                      <div className="admin-tarjeta-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                        <span className="admin-prefs-badge admin-prefs-badge--turno" style={{ background: 'rgba(0,0,0,0.05)', color: 'inherit' }}>
                          {h.dia} · B{h.bloque} ({h.turno})
                        </span>
                        {h.diaVirtual && (
                          <span className="admin-prefs-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7' }}>
                            💻 Virtual: {h.diaVirtual}
                          </span>
                        )}
                        {h.proyector && (
                          <span className="admin-prefs-badge" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#7e22ce' }}>
                            📹 {h.proyector}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="admin-tarjeta-acciones" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button className="admin-btn admin-btn--editar" onClick={() => abrirModalEditar(h)}>Editar</button>
                      <button className="admin-btn admin-btn--eliminar" onClick={() => eliminarClaseDB(h.id)}>Eliminar</button>
                    </div>
                  </div>
                ))
              )}
              {Math.ceil(horariosFiltradosAdmin.length / ITEMS_POR_PAGINA) > 1 && (
                <div className="admin-paginacion">
                  <button className="admin-paginacion__btn" disabled={paginaHorarios <= 1} onClick={() => setPaginaHorarios(p => Math.max(1, p - 1))}>‹ Anterior</button>
                  <span className="admin-paginacion__info">{paginaHorarios} de {Math.ceil(horariosFiltradosAdmin.length / ITEMS_POR_PAGINA)}</span>
                  <button className="admin-paginacion__btn" disabled={paginaHorarios >= Math.ceil(horariosFiltradosAdmin.length / ITEMS_POR_PAGINA)} onClick={() => setPaginaHorarios(p => Math.min(Math.ceil(horariosFiltradosAdmin.length / ITEMS_POR_PAGINA), p + 1))}>Siguiente ›</button>
                </div>
              )}
            </div>
          ) : (
            /* Vista Desktop para Horarios */
            <div className="admin-tabla-container">
              <div className="admin-tabla admin-tabla--horarios">
                <div className="admin-tabla-header">
                  <span className="admin-col admin-col--carrera" style={{ flex: '0.8' }}>Carrera</span>
                  <span className="admin-col admin-col--grupo" style={{ flex: '0.6' }}>Grupo</span>
                  <span className="admin-col admin-col--turno" style={{ flex: '0.8' }}>Turno</span>
                  <span className="admin-col admin-col--dia" style={{ flex: '0.8' }}>Día</span>
                  <span className="admin-col admin-col--bloque" style={{ flex: '0.6' }}>Bloque</span>
                  <span className="admin-col admin-col--materia" style={{ flex: '2' }}>Materia</span>
                  <span className="admin-col admin-col--profesor" style={{ flex: '2' }}>Profesor</span>
                  <span className="admin-col admin-col--salon" style={{ flex: '1.2' }}>Salón</span>
                  <span className="admin-col admin-col--acciones" style={{ flex: '1' }}>Acciones</span>
                </div>

                {horariosFiltradosAdmin.length === 0 ? (
                  <div className="admin-fila admin-fila--empty" style={{ justifyContent: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-6)' }}>
                    No se encontraron clases con los filtros aplicados.
                  </div>
                ) : (
                  horariosFiltradosAdmin.slice((paginaHorarios-1)*ITEMS_POR_PAGINA, paginaHorarios*ITEMS_POR_PAGINA).map(h => (
                    <div key={h.id} className="admin-fila">
                      <span className="admin-col admin-col--carrera" style={{ flex: '0.8' }}>
                        <span className="admin-prefs-badge admin-prefs-badge--carrera">{h.carrera}</span>
                      </span>
                      <span className="admin-col admin-col--grupo" style={{ flex: '0.6' }}>{h.grupo}</span>
                      <span className="admin-col admin-col--turno" style={{ flex: '0.8' }}>{h.turno}</span>
                      <span className="admin-col admin-col--dia" style={{ flex: '0.8' }}>
                        {h.dia}
                        {h.diaVirtual && <span className="admin-virtual-tag" title={`Clase virtual los ${h.diaVirtual}`}>💻</span>}
                      </span>
                      <span className="admin-col admin-col--bloque" style={{ flex: '0.6' }}>B{h.bloque}</span>
                      <span className="admin-col admin-col--materia admin-materia-txt" style={{ flex: '2', fontWeight: '500' }}>{h.materia}</span>
                      <span className="admin-col admin-col--profesor admin-profesor-txt" style={{ flex: '2' }}>{h.profesor}</span>
                      <span className="admin-col admin-col--salon" style={{ flex: '1.2' }}>
                        {h.salon}
                        {h.proyector && <span className="admin-proyector-tag" title={`Proyector asignado: ${h.proyector}`}>📹</span>}
                      </span>
                      <div className="admin-col admin-col--acciones" style={{ flex: '1' }}>
                        <div className="admin-acciones">
                          <button
                            className="admin-btn admin-btn--editar"
                            onClick={() => abrirModalEditar(h)}
                            title="Editar clase"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="admin-btn admin-btn--eliminar"
                            onClick={() => eliminarClaseDB(h.id)}
                            title="Eliminar clase"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {Math.ceil(horariosFiltradosAdmin.length / ITEMS_POR_PAGINA) > 1 && (
                <div className="admin-paginacion">
                  <button className="admin-paginacion__btn" disabled={paginaHorarios <= 1} onClick={() => setPaginaHorarios(p => Math.max(1, p - 1))}>‹ Anterior</button>
                  <span className="admin-paginacion__info">{paginaHorarios} de {Math.ceil(horariosFiltradosAdmin.length / ITEMS_POR_PAGINA)}</span>
                  <button className="admin-paginacion__btn" disabled={paginaHorarios >= Math.ceil(horariosFiltradosAdmin.length / ITEMS_POR_PAGINA)} onClick={() => setPaginaHorarios(p => Math.min(Math.ceil(horariosFiltradosAdmin.length / ITEMS_POR_PAGINA), p + 1))}>Siguiente ›</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Modal de Creación / Edición de Clase (Formulario Premium Overlay) ── */}
      {modalAbierto && (
        <div className="crud-modal-backdrop">
          <div className="crud-modal">
            <div className="crud-modal-header">
              <h3>{claseEdicion ? '📋 Editar Clase' : '➕ Crear Nueva Clase'}</h3>
              <button className="crud-modal-close" onClick={() => setModalAbierto(false)}>×</button>
            </div>
            <form onSubmit={guardarClaseDB} className="crud-modal-body">
              <div className="crud-form-row">
                <div className="crud-form-group">
                  <label>Carrera *</label>
                  <select
                    value={formClase.carrera}
                    onChange={e => setFormClase(prev => ({ ...prev, carrera: e.target.value }))}
                  >
                    {opcionesCRUD.carreras.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Custom">+ Agregar Otra...</option>
                  </select>
                  {formClase.carrera === 'Custom' && (
                    <input
                      type="text"
                      placeholder="Nombre de carrera (ej. DSM)..."
                      className="crud-custom-input"
                      onChange={e => setFormClase(prev => ({ ...prev, carrera: e.target.value.toUpperCase() }))}
                      required
                    />
                  )}
                </div>

                <div className="crud-form-group">
                  <label>Grupo *</label>
                  <select
                    value={formClase.grupo}
                    onChange={e => setFormClase(prev => ({ ...prev, grupo: e.target.value }))}
                  >
                    {opcionesCRUD.grupos.map(g => <option key={g} value={g}>{g}</option>)}
                    <option value="Custom">+ Agregar Otro...</option>
                  </select>
                  {formClase.grupo === 'Custom' && (
                    <input
                      type="text"
                      placeholder="Grupo (ej. 5B)..."
                      className="crud-custom-input"
                      onChange={e => setFormClase(prev => ({ ...prev, grupo: e.target.value.toUpperCase() }))}
                      required
                    />
                  )}
                </div>
              </div>

              <div className="crud-form-row">
                <div className="crud-form-group">
                  <label>Turno *</label>
                  <select
                    value={formClase.turno}
                    onChange={e => setFormClase(prev => ({ ...prev, turno: e.target.value }))}
                  >
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                  </select>
                </div>

                <div className="crud-form-group">
                  <label>Día *</label>
                  <select
                    value={formClase.dia}
                    onChange={e => setFormClase(prev => ({ ...prev, dia: e.target.value }))}
                  >
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                  </select>
                </div>
              </div>

              <div className="crud-form-row">
                <div className="crud-form-group">
                  <label>Día Virtual (Opcional)</label>
                  <select
                    value={formClase.diaVirtual}
                    onChange={e => setFormClase(prev => ({ ...prev, diaVirtual: e.target.value }))}
                  >
                    <option value="">Ninguno</option>
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                  </select>
                </div>

                <div className="crud-form-group">
                  <label>Bloque Horario *</label>
                  <select
                    value={formClase.bloque}
                    onChange={e => setFormClase(prev => ({ ...prev, bloque: Number(e.target.value) }))}
                  >
                    {bloques.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="crud-form-group">
                <label>Materia *</label>
                <input
                  type="text"
                  placeholder="Nombre de la materia (ej. Desarrollo Móvil Multiplataforma)"
                  value={formClase.materia}
                  onChange={e => setFormClase(prev => ({ ...prev, materia: e.target.value }))}
                  required
                />
              </div>

              <div className="crud-form-group">
                <label>Profesor *</label>
                <input
                  type="text"
                  placeholder="Nombre del docente completo (ej. Nelida Abril Zaragoza Carrillo)"
                  value={formClase.profesor}
                  onChange={e => setFormClase(prev => ({ ...prev, profesor: e.target.value }))}
                  required
                />
              </div>

              <div className="crud-form-row">
                <div className="crud-form-group">
                  <label>Salón *</label>
                  <select
                    value={formClase.salon}
                    onChange={e => setFormClase(prev => ({ ...prev, salon: e.target.value }))}
                  >
                    {opcionesCRUD.salones.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="Custom">+ Agregar Otro...</option>
                  </select>
                  {formClase.salon === 'Custom' && (
                    <input
                      type="text"
                      placeholder="Salón (ej. Taller PB07)..."
                      className="crud-custom-input"
                      onChange={e => setFormClase(prev => ({ ...prev, salon: e.target.value }))}
                      required
                    />
                  )}
                </div>

                <div className="crud-form-group">
                  <label>Proyector asignado (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Proyector 1, o deja vacío"
                    value={formClase.proyector}
                    onChange={e => setFormClase(prev => ({ ...prev, proyector: e.target.value }))}
                  />
                </div>
              </div>

              <div className="crud-modal-footer">
                <button type="button" className="crud-btn-cancelar" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="crud-btn-guardar" disabled={guardandoClase}>
                  {guardandoClase ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal de Importación Inteligente (PDF & Texto) ── */}
      {modalImportarAbierto && (
        <div className="crud-modal-backdrop">
          <div className="crud-modal import-modal">
            <div className="crud-modal-header">
              <h3>📥 Importador Inteligente de Horarios</h3>
              <button className="crud-modal-close" onClick={() => { setModalImportarAbierto(false); setClasesImportadas([]); }}>×</button>
            </div>
            <div className="crud-modal-body">
              <div className="import-tabs">
                <button
                  type="button"
                  className={`import-tab-btn ${tabImportar === 'pdf' ? 'import-tab-btn--active' : ''}`}
                  onClick={() => setTabImportar('pdf')}
                >
                  📄 Cargar Archivo PDF
                </button>
                <button
                  type="button"
                  className={`import-tab-btn ${tabImportar === 'texto' ? 'import-tab-btn--active' : ''}`}
                  onClick={() => setTabImportar('texto')}
                >
                  ✍️ Pegar Texto Plano
                </button>
              </div>

              {tabImportar === 'pdf' && (
                <div>
                  <div
                    className="import-dropzone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        procesarArchivoPDF(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => document.getElementById('import-file-input').click()}
                  >
                    <span className="import-dropzone-icon">📁</span>
                    <span className="import-dropzone-text">Arrastra tu PDF aquí o haz clic para buscar</span>
                    <span className="import-dropzone-subtext">Procesa automáticamente la cuadrícula de horarios oficiales de la UTJ</span>
                    <input
                      type="file"
                      id="import-file-input"
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          procesarArchivoPDF(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                  {cargandoImportar && (
                    <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                      ⏳ Procesando archivo y reconociendo celdas por coordenadas...
                    </div>
                  )}
                </div>
              )}

              {tabImportar === 'texto' && (
                <div>
                  <textarea
                    className="import-textarea"
                    placeholder="Pega las filas de tu horario copiadas aquí...&#10;Ejemplo:&#10;Lunes&#10;1 | Inglés I | Mario Oscar | Aula 501&#10;2 | Física | Héctor Jesús | Aula 501"
                    value={textoImportar}
                    onChange={(e) => setTextoImportar(e.target.value)}
                  />
                  <div style={{ textAlign: 'right', marginTop: 'var(--space-2)' }}>
                    <button
                      type="button"
                      className="admin-btn-crear"
                      onClick={procesarTextoImportar}
                      disabled={cargandoImportar}
                    >
                      {cargandoImportar ? 'Procesando...' : 'Reconocer Clases'}
                    </button>
                  </div>
                </div>
              )}

              {/* Vista Previa Interactiva de Clases */}
              {clasesImportadas.length > 0 && (
                <div className="import-preview-section">
                  <div className="import-preview-header">
                    <h4 className="import-preview-title">Vista Previa de Clases Detectadas</h4>
                    <span className="import-preview-count">{clasesImportadas.length} encontradas</span>
                  </div>

                  <div className="import-preview-table-container">
                    <table className="import-preview-table">
                      <thead>
                        <tr>
                          <th className="import-preview-th" style={{ width: '40px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={clasesImportadas.every(c => c.seleccionado)}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setClasesImportadas(prev => prev.map(c => ({ ...c, seleccionado: val })));
                              }}
                            />
                          </th>
                          <th className="import-preview-th">Carrera</th>
                          <th className="import-preview-th">Grupo</th>
                          <th className="import-preview-th">Turno</th>
                          <th className="import-preview-th">Día</th>
                          <th className="import-preview-th">Bloque</th>
                          <th className="import-preview-th">Horario</th>
                          <th className="import-preview-th">Materia</th>
                          <th className="import-preview-th">Profesor</th>
                          <th className="import-preview-th">Salón</th>
                          <th className="import-preview-th">Proyector</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clasesImportadas.map((clase, idx) => (
                          <tr key={clase.id} className="import-preview-row">
                            <td className="import-preview-td" style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={clase.seleccionado}
                                onChange={(e) => {
                                  const val = e.target.checked;
                                  setClasesImportadas(prev => prev.map((c, i) => i === idx ? { ...c, seleccionado: val } : c));
                                }}
                              />
                            </td>
                            <td className="import-preview-td" style={{ width: '80px' }}>
                              <span style={{ fontSize: 'var(--text-xs)' }}>{clase.carrera}</span>
                            </td>
                            <td className="import-preview-td" style={{ width: '50px' }}>
                              <span style={{ fontSize: 'var(--text-xs)' }}>{clase.grupo}</span>
                            </td>
                            <td className="import-preview-td" style={{ width: '80px' }}>
                              <span style={{ fontSize: 'var(--text-xs)' }}>{clase.turno}</span>
                            </td>
                            <td className="import-preview-td" style={{ width: '100px' }}>
                              <select
                                value={clase.dia}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setClasesImportadas(prev => prev.map((c, i) => i === idx ? { ...c, dia: val } : c));
                                }}
                                style={{ padding: '2px 4px', fontSize: 'var(--text-xs)', background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                              >
                                <option value="Lunes">Lunes</option>
                                <option value="Martes">Martes</option>
                                <option value="Miércoles">Miércoles</option>
                                <option value="Jueves">Jueves</option>
                                <option value="Viernes">Viernes</option>
                              </select>
                            </td>
                            <td className="import-preview-td" style={{ width: '60px' }}>
                              <input
                                type="number"
                                min="1"
                                max="8"
                                value={clase.bloque}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setClasesImportadas(prev => prev.map((c, i) => i === idx ? { ...c, bloque: val } : c));
                                }}
                              />
                            </td>
                            <td className="import-preview-td" style={{ width: '120px' }}>
                              <span style={{ fontSize: 'var(--text-xs)' }}>{clase.horario}</span>
                            </td>
                            <td className="import-preview-td">
                              <input
                                type="text"
                                value={clase.materia}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setClasesImportadas(prev => prev.map((c, i) => i === idx ? { ...c, materia: val } : c));
                                }}
                              />
                            </td>
                            <td className="import-preview-td">
                              <input
                                type="text"
                                value={clase.profesor}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setClasesImportadas(prev => prev.map((c, i) => i === idx ? { ...c, profesor: val } : c));
                                }}
                              />
                            </td>
                            <td className="import-preview-td" style={{ width: '100px' }}>
                              <input
                                type="text"
                                value={clase.salon}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setClasesImportadas(prev => prev.map((c, i) => i === idx ? { ...c, salon: val } : c));
                                }}
                              />
                            </td>
                            <td className="import-preview-td" style={{ width: '100px' }}>
                              <input
                                type="text"
                                placeholder="Proyector 1"
                                value={clase.proyector}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setClasesImportadas(prev => prev.map((c, i) => i === idx ? { ...c, proyector: val } : c));
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Acciones de Lote */}
                  <div className="import-preview-actions">
                    <div className="import-preview-action-group">
                      <label>Carrera:</label>
                      <select
                        value={carreraImportar}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCarreraImportar(val);
                          setClasesImportadas(prev => prev.map(c => ({ ...c, carrera: val })));
                        }}
                      >
                        {[...new Set([...opcionesCRUD.carreras, ...clasesImportadas.map(c => c.carrera).filter(Boolean)])].sort().map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="import-preview-action-group">
                      <label>Grupo:</label>
                      <select
                        value={grupoImportar}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGrupoImportar(val);
                          setClasesImportadas(prev => prev.map(c => ({ ...c, grupo: val })));
                        }}
                      >
                        {[...new Set([...opcionesCRUD.grupos, ...clasesImportadas.map(c => c.grupo).filter(Boolean)])].sort().map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>

                    <div className="import-preview-action-group">
                      <label>Turno:</label>
                      <select
                        value={turnoImportar}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTurnoImportar(val);
                          setClasesImportadas(prev => prev.map(c => ({ ...c, turno: val })));
                        }}
                      >
                        <option value="Matutino">Matutino</option>
                        <option value="Vespertino">Vespertino</option>
                      </select>
                    </div>

                    <div className="import-preview-action-group">
                      <label>Día Virtual:</label>
                      <select
                        value={diaVirtualImportar}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDiaVirtualImportar(val);
                          setClasesImportadas(prev => prev.map(c => ({ ...c, diaVirtual: val })));
                        }}
                      >
                        <option value="">Ninguno</option>
                        <option value="Lunes">Lunes</option>
                        <option value="Martes">Martes</option>
                        <option value="Miércoles">Miércoles</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Viernes">Viernes</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="crud-modal-footer" style={{ marginTop: 'var(--space-4)' }}>
              <button
                type="button"
                className="crud-btn-cancelar"
                onClick={() => { setModalImportarAbierto(false); setClasesImportadas([]); }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="crud-btn-guardar"
                onClick={confirmarImportacion}
                disabled={guardandoImportacion || clasesImportadas.filter(c => c.seleccionado).length === 0}
              >
                {guardandoImportacion ? 'Guardando lote...' : `Importar ${clasesImportadas.filter(c => c.seleccionado).length} Clases`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-footer">
        <p>Los cambios en horarios y usuarios se guardan en tiempo real en la nube (Firestore).</p>
      </div>

      {/* ─────────────────────────────────────────────
         PESTAÑA NUEVA: ACCESOS (WHITELIST)
         ───────────────────────────────────────────── */}
      {tabActiva === 'accesos' && (
        <div className="admin-header">
          <div className="admin-header-top">
            <div>
              <h2 className="admin-title">Correos Autorizados (Lista Blanca)</h2>
              <p className="admin-subtitle">
                Agrega manualmente los correos de los docentes y administrativos. 
                Si no están aquí, se les considerará alumnos al entrar por primera vez.
              </p>
              <div className="admin-whitelist-dynamic-info" style={{
                background: 'rgba(21, 101, 192, 0.1)',
                borderLeft: '4px solid #1565c0',
                padding: '1rem',
                borderRadius: '4px',
                marginTop: '1rem',
                color: 'var(--color-text)',
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                <strong>💡 Acceso Inteligente Activo:</strong> Los docentes que figuran en el horario escolar tienen acceso <strong>automático</strong>. El sistema predice sus correos UTJ (ej. <code>ebarbosa@utj.edu.mx</code> para <em>Eduardo Barbosa Olivares</em>) e inicializa sus preferencias sin requerir registro manual en esta lista.
              </div>
            </div>
          </div>

          <div className="admin-whitelist-form" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
            <input 
              type="email" 
              placeholder="correo@utj.edu.mx" 
              value={nuevoCorreoAuth}
              onChange={(e) => setNuevoCorreoAuth(e.target.value)}
              className="admin-select"
              style={{ flex: 1, height: '42px', padding: '0 1rem' }}
            />
            <select 
              value={nuevoRolAuth} 
              onChange={(e) => setNuevoRolAuth(e.target.value)}
              className="admin-select"
              style={{ height: '42px', padding: '0 1rem' }}
            >
              <option value="docente">Docente</option>
              <option value="administrativo">Administrativo</option>
              <option value="admin">Administrador</option>
            </select>
            <button 
              className="admin-btn-crear"
              style={{ fontSize: '0.9rem', padding: '0 1.5rem', whiteSpace: 'nowrap', height: '42px', margin: 0 }}
              onClick={async () => {
                if (!nuevoCorreoAuth) return;
                try {
                  await autorizarCorreo(nuevoCorreoAuth.toLowerCase().trim(), nuevoRolAuth);
                  setNuevoCorreoAuth('');
                  alert('Correo autorizado exitosamente');
                } catch(err) {
                  alert('Error al autorizar correo');
                }
              }}
            >
              Autorizar Correo
            </button>
          </div>

          <div className="admin-tabla-container" style={{ marginTop: '1.5rem' }}>
            <div className="admin-tabla">
              <div className="admin-tabla-header" style={{ gridTemplateColumns: 'minmax(200px, 1fr) 150px 100px' }}>
                <span className="admin-col">Correo Electrónico</span>
                <span className="admin-col">Rol Asignado</span>
                <span className="admin-col">Acciones</span>
              </div>
              {correosAutorizados.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No hay correos en la lista blanca.
                </div>
              ) : (
                correosAutorizados.map(auth => (
                  <div key={auth.email} className="admin-fila" style={{ gridTemplateColumns: 'minmax(200px, 1fr) 150px 100px' }}>
                    <div className="admin-col">
                      <span className="admin-email">{auth.email}</span>
                    </div>
                    <div className="admin-col">
                      <span className="admin-rol-badge" style={{ backgroundColor: COLORES_ROL[auth.rol] || COLORES_ROL.estudiante }}>
                        {ETIQUETAS_ROL[auth.rol] || auth.rol}
                      </span>
                    </div>
                    <div className="admin-col admin-acciones">
                      <button 
                        className="admin-btn admin-btn--eliminar" 
                        title="Eliminar Acceso"
                        onClick={async () => {
                          if(window.confirm('¿Eliminar este correo de la lista blanca?')) {
                            await eliminarCorreoAutorizado(auth.email)
                          }
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
         PESTAÑA 4: SOLICITUDES DE EQUIPO
         ───────────────────────────────────────────── */}
      {tabActiva === 'solicitudes' && (
        <div className="admin-header">
          <div className="admin-header-top">
            <div>
              <h2 className="admin-title">Solicitudes de Equipo</h2>
              <p className="admin-subtitle">Las solicitudes de los profesores se aplican automáticamente, aquí puedes revisarlas o cancelarlas.</p>
            </div>
          </div>

          <div className="admin-tabla-container" style={{ marginTop: '1rem' }}>
            <div className="admin-tabla">
              <div className="admin-tabla-header" style={{ gridTemplateColumns: 'minmax(150px, 1.5fr) minmax(200px, 2fr) 120px 120px 100px' }}>
                <span className="admin-col">Profesor</span>
                <span className="admin-col">Clase (Materia / Grupo)</span>
                <span className="admin-col">Equipo</span>
                <span className="admin-col">Frecuencia</span>
                <span className="admin-col">Acciones</span>
              </div>

              {solicitudes.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No hay solicitudes de equipo registradas.
                </div>
              ) : (
                solicitudes.map(req => (
                  <div key={req.id} className="admin-fila" style={{ gridTemplateColumns: 'minmax(150px, 1.5fr) minmax(200px, 2fr) 120px 120px 100px' }}>
                    <div className="admin-col"><span className="admin-nombre">{req.profesorNombre || req.profesorId}</span></div>
                    <div className="admin-col" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                      <span className="admin-nombre">{req.claseInfo?.materia}</span>
                      <span className="admin-email">{req.claseInfo?.carrera} {req.claseInfo?.grupo} · {req.claseInfo?.dia} · {req.claseInfo?.salon}</span>
                    </div>
                    <div className="admin-col">
                      <span className="admin-estado admin-estado--activo">{req.equipo?.join(', ')}</span>
                    </div>
                    <div className="admin-col">
                      {req.tipo === 'recurrente' ? (
                        <span className="admin-estado">Recurrente</span>
                      ) : (
                        <span className="admin-estado" style={{ background: '#e3f2fd', color: '#1565c0' }}>{req.fechaFocal}</span>
                      )}
                    </div>
                    <div className="admin-col admin-acciones">
                      <button 
                        className="admin-btn admin-btn--eliminar" 
                        title="Eliminar Solicitud"
                        onClick={() => {
                          if (window.confirm('¿Seguro que deseas eliminar esta solicitud?')) {
                            eliminarSolicitudEquipo(req.id)
                          }
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel