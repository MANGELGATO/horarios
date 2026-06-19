import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, addDoc, collection, deleteDoc, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { horarios } from './data/horarios';

const firebaseConfig = {
  apiKey: "AIzaSyDpnWad3uYy1qVQyQlxjOSHt7JLPzCUa3E",
  authDomain: "horarios-ccd.firebaseapp.com",
  projectId: "horarios-ccd",
  storageBucket: "horarios-ccd.firebasestorage.app",
  messagingSenderId: "888408866342",
  appId: "1:888408866342:web:688519cef16e670a8c70e7",
  measurementId: "G-YLR0YZQQQK"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);

enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('[Firestore] Persistencia offline no disponible: múltiples pestañas abiertas');
  } else if (err.code === 'unimplemented') {
    console.warn('[Firestore] Persistencia offline no soportada en este navegador');
  }
});

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

const DOMINIO_ESTUDIANTE = 'soy.utj.edu.mx';
const DOMINIO_DOCENTE = 'utj.edu.mx';

const ADMIN_EMAILS = [
  'maximo.murillo@utj.edu.mx',
  'miguel.garcia@utj.edu.mx',
  'jose.rodriguez@utj.edu.mx',
];

const PROFESOR_EMAILS = {
  'ilopez@utj.edu.mx': 'Iliana López Guillen',
  'jcarlos.lopez@utj.edu.mx': 'Juan Carlos López Lucio',
  'marisol.guzman@utj.edu.mx': 'Marisol Guzmán Padilla',
  'mario.rodriguez@utj.edu.mx': 'Mario Oscar Rodríguez Rodríguez',
  'hector.guzman@utj.edu.mx': 'Héctor Jesús Guzmán Colín',
  'juan.martinez@utj.edu.mx': 'Juan Antonio Martínez Carbajal',
  'ana.velazquez@utj.edu.mx': 'Ana Luz Velázquez Moreno',
  'andrea.villasenor@utj.edu.mx': 'Andrea Villaseñor Sahagún',
  'eduardo.barbosa@utj.edu.mx': 'Eduardo Barbosa Olivares',
  'ernesto.roque@utj.edu.mx': 'Ernesto Roque Rodríguez',
  'tania.jauregui@utj.edu.mx': 'Tania Sarai Jauregui López',
  'hector.gomez@utj.edu.mx': 'Héctor Orlando Gómez Castellanos',
  'edgardo.gonzalez@utj.edu.mx': 'Edgardo Emmanuel Gonzalez Del C',
  'jose.navarro@utj.edu.mx': 'José Navarro Ríos',
  'marlene.mora@utj.edu.mx': 'Marlene Mora Olmos',
  'astrid.gomez@utj.edu.mx': 'Astrid Gómez Sahagun',
  'jose.rojas@utj.edu.mx': 'José Luis Rojas Cisneros',
  'candelario.castaneda@utj.edu.mx': 'Candelario Castañeda Castañeda',
  'nelida.zaragoza@utj.edu.mx': 'Nelida Abril Zaragoza Carrillo',
  'sergio.ramirez@utj.edu.mx': 'Sergio Ramírez Ulloa',
  'bertha.vazquez@utj.edu.mx': 'Bertha Guadalupe Vázquez López',
  'bronislava.franco@utj.edu.mx': 'Bronislava Franco Llamas',
  'carlos.media@utj.edu.mx': 'Carlos Iván Media López',
  'diego.iniguez@utj.edu.mx': 'Diego Iñiguez Jiménez',
  'jorge.rodriguez@utj.edu.mx': 'Jorge Rodríguez Gallegos',
  'jose.ayllon@utj.edu.mx': 'José Antonio Ayllón Ríos',
  'roberto.cazares@utj.edu.mx': 'Roberto Cazares Gomez',
  'olivia.hernandez@utj.edu.mx': 'Olivia Hernández Arce',
  'luis.lopez@utj.edu.mx': 'Luis Manuel López Hernández',
  'silvia.magana@utj.edu.mx': 'Silvia Ruth Magaña Valdes',
  'jaime.cerda@utj.edu.mx': 'Jaime Antonio Cerda Soto',
  'edgar.toledo@utj.edu.mx': 'Edgar Ulises Toledo Nares',
  'victor.ramirez@utj.edu.mx': 'Victor Hugo Ramírez Salazar',
  'jesus.simental@utj.edu.mx': 'Jesús Simental Pacheco',
  'saul.gutierrez@utj.edu.mx': 'Saúl Gutiérrez Garibay',
  'ruben.gonzalez@utj.edu.mx': 'Rubén González Ruiz',
  'ricardo.ortiz@utj.edu.mx': 'Ricardo Ortiz Ponce',
  'omar.moreno@utj.edu.mx': 'Omar Enrique Moreno López',
  'pedro.gonzalez@utj.edu.mx': 'Pedro González Echeverría',
  'adolfo.castaneda@utj.edu.mx': 'Adolfo Yakov Castañeda Navarrete',
  'felipe.belmont@utj.edu.mx': 'Felipe Belmont Polanco',
  'fernando.villasenor@utj.edu.mx': 'Fernando Rafael Villaseñor Ulloa',
  'brandon.devora@utj.edu.mx': 'Brandon Javier Devora Lucio',
  'edgar.banos@utj.edu.mx': 'Edgar Miguel Baños Enríquez',
  'marcia.barajas@utj.edu.mx': 'Marcia Josefina Barajas Solorzano',
  'lorena.santoyo@utj.edu.mx': 'Lorena del Rocio Santoyo Palafox',
  'jesus.cortes@utj.edu.mx': 'Jesus Osvaldo Cortés Guerra',
  'ana.romo@utj.edu.mx': 'Ana Eugenia Romo González',
  'juan.morales@utj.edu.mx': 'Juan Carlos Morales Aragón',
};

export function getProfesoresDinamicos() {
  const profesSet = new Set();
  horarios.forEach(h => {
    if (h.profesor && h.profesor.trim()) {
      profesSet.add(h.profesor.trim());
    }
  });
  return Array.from(profesSet);
}

export function predecirCorreosParaDocente(nombreCompleto) {
  if (!nombreCompleto) return [];
  
  const normalizado = nombreCompleto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .toLowerCase();
    
  const conectores = ['de', 'del', 'la', 'las', 'los', 'y'];
  const words = normalizado.split(/\s+/).filter(w => w.length > 0 && !conectores.includes(w));
  
  if (words.length === 0) return [];
  
  const emails = new Set();
  const firstName = words[0];
  const firstLetter = firstName.charAt(0);
  
  if (words.length === 1) {
    emails.add(`${firstName}@utj.edu.mx`);
  } else if (words.length === 2) {
    const surname1 = words[1];
    emails.add(`${firstLetter}${surname1}@utj.edu.mx`);
    emails.add(`${firstName}.${surname1}@utj.edu.mx`);
    emails.add(`${firstName}${surname1}@utj.edu.mx`);
  } else if (words.length === 3) {
    const surname1 = words[1];
    const surname2 = words[2];
    
    emails.add(`${firstLetter}${surname1}@utj.edu.mx`);
    emails.add(`${firstName}.${surname1}@utj.edu.mx`);
    emails.add(`${firstName}${surname1}@utj.edu.mx`);
    
    emails.add(`${firstLetter}${surname1}${surname2}@utj.edu.mx`);
    emails.add(`${firstName}.${surname1}.${surname2}@utj.edu.mx`);
    emails.add(`${firstName}${surname1}${surname2}@utj.edu.mx`);
  } else if (words.length >= 4) {
    const middleName = words[1];
    const surname1 = words[2];
    const surname2 = words[3] || '';
    
    emails.add(`${firstLetter}${surname1}@utj.edu.mx`);
    emails.add(`${firstName}.${surname1}@utj.edu.mx`);
    emails.add(`${firstName}${surname1}@utj.edu.mx`);
    
    const middleLetter = middleName.charAt(0);
    emails.add(`${middleLetter}${surname1}@utj.edu.mx`);
    emails.add(`${middleName}.${surname1}@utj.edu.mx`);
    
    if (surname2) {
      emails.add(`${firstLetter}${surname1}${surname2}@utj.edu.mx`);
      emails.add(`${firstName}.${surname1}.${surname2}@utj.edu.mx`);
      emails.add(`${firstName}${surname1}${surname2}@utj.edu.mx`);
    }
  }
  
  return Array.from(emails);
}

export function buscarDocentePorEmail(email) {
  if (!email || !email.endsWith(`@${DOMINIO_DOCENTE}`)) return null;
  
  if (PROFESOR_EMAILS[email]) {
    return PROFESOR_EMAILS[email];
  }
  
  const profesores = getProfesoresDinamicos();
  for (const prof of profesores) {
    const correosPredichos = predecirCorreosParaDocente(prof);
    if (correosPredichos.includes(email)) {
      return prof;
    }
  }
  
  return null;
}

export function getRolPorDominio(email) {
  if (ADMIN_EMAILS.includes(email)) return 'admin';
  if (email.endsWith(`@${DOMINIO_ESTUDIANTE}`)) return 'estudiante';
  if (email.endsWith(`@${DOMINIO_DOCENTE}`)) {
    if (buscarDocentePorEmail(email)) {
      return 'docente';
    }
  }
  return null;
}

export function getProfesorPorEmail(email) {
  return buscarDocentePorEmail(email);
}

export function dominioPermitido(email) {
  return email.endsWith(`@${DOMINIO_ESTUDIANTE}`) || email.endsWith(`@${DOMINIO_DOCENTE}`);
}

function crearPreferenciasIniciales(rol, email) {
  if (rol === 'estudiante') return null;
  if (rol === 'docente') {
    const profesorNombre = getProfesorPorEmail(email);
    if (profesorNombre) {
      const slug = slugify(profesorNombre);
      return { tipo: 'docente', profesorId: slug, profesorLabel: profesorNombre };
    }
  }
  return null;
}

export function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['´`]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

export async function obtenerCrearPerfilUsuario(usuarioFirebase) {
  const email = usuarioFirebase.email;
  const dominio = email.split('@')[1];
  const esAdminEmail = ADMIN_EMAILS.includes(email);
  const rolBase = getRolPorDominio(email);

  // Validacion de dominio: solo correos institucionales,
  // a menos que el correo este explicitamente en la whitelist
  if (!esAdminEmail && !dominioPermitido(email)) {
    try {
      const authRef = doc(db, 'correos_autorizados', email);
      const authSnap = await getDoc(authRef);
      if (!authSnap.exists()) {
        throw new Error('ACCESO DENEGADO: Correo no autorizado. Debes usar tu correo institucional.');
      }
    } catch (e) {
      if (e.message?.includes('ACCESO DENEGADO')) throw e;
      throw new Error('ACCESO DENEGADO: Correo no autorizado. Debes usar un correo institucional.');
    }
  }

  console.log('[firebase] photoURL desde Google:', usuarioFirebase.photoURL);

  try {
    const userRef = doc(db, 'usuarios', usuarioFirebase.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      let rolDefinitivo = rolBase;
      if (rolBase !== 'admin') {
        const authRef = doc(db, 'correos_autorizados', email);
        const authSnap = await getDoc(authRef);
        if (authSnap.exists()) {
          rolDefinitivo = authSnap.data().rol;
        } else if (!rolBase) {
          throw new Error('ACCESO DENEGADO: Tu correo no está autorizado para acceder al sistema.');
        }
      }

      const preferencias = crearPreferenciasIniciales(rolDefinitivo, email);
      const nuevoUsuario = {
        email,
        nombre: usuarioFirebase.displayName || '',
        foto: usuarioFirebase.photoURL || '',
        uid: usuarioFirebase.uid,
        rol: rolDefinitivo,
        dominio,
        preferencias,
        activo: true,
        ultimoAcceso: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, nuevoUsuario);
      const result = { ...nuevoUsuario, ultimoAcceso: new Date(), createdAt: new Date() };
      console.log('[firebase] Usuario creado con foto:', result.foto);
      return result;
    }

    const data = snap.data();

    if (!data.activo) {
      await auth.signOut();
      throw new Error('Tu cuenta ha sido desactivada. Contacta al administrador.');
    }

    const fotoActualizada = usuarioFirebase.photoURL || data.foto;

    await updateDoc(userRef, {
      ultimoAcceso: serverTimestamp(),
      nombre: usuarioFirebase.displayName || data.nombre,
      foto: fotoActualizada,
    });

    return {
      ...data,
      nombre: usuarioFirebase.displayName || data.nombre,
      foto: fotoActualizada,
      ultimoAcceso: new Date(),
    };
  } catch (err) {
    if (err.message?.includes('desactivada')) throw err;

    console.warn('[firebase] Firestore no disponible, usando fallback:', err.message);

    if (!esAdminEmail && !dominioPermitido(email)) {
      throw new Error('ACCESO DENEGADO: Correo no autorizado. Debes usar un correo institucional.');
    }

    const preferencias = crearPreferenciasIniciales(rolBase, email);

    return {
      email,
      nombre: usuarioFirebase.displayName || '',
      foto: usuarioFirebase.photoURL || '',
      uid: usuarioFirebase.uid,
      rol: rolBase,
      dominio,
      preferencias,
      activo: true,
      ultimoAcceso: new Date(),
      createdAt: new Date(),
      _sinFirestore: true,
    };
  }
}

export async function guardarPreferencias(uid, preferencias) {
  try {
    await updateDoc(doc(db, 'usuarios', uid), { preferencias });
  } catch (err) {
    console.warn('[firebase] No se pudieron guardar preferencias:', err.message);
  }
}

export async function guardarSolicitudEquipo(solicitud) {
  try {
    const docRef = await addDoc(collection(db, 'solicitudes_equipo'), {
      ...solicitud,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.error('[firebase] Error al guardar solicitud de equipo:', err);
    throw err;
  }
}

export async function eliminarSolicitudEquipo(id) {
  try {
    await deleteDoc(doc(db, 'solicitudes_equipo', id));
  } catch (err) {
    console.error('[firebase] Error al eliminar solicitud de equipo:', err);
    throw err;
  }
}

export async function autorizarCorreo(email, rol) {
  try {
    await setDoc(doc(db, 'correos_autorizados', email), { rol, timestamp: serverTimestamp() });
  } catch (err) {
    console.error('[firebase] Error al autorizar correo:', err);
    throw err;
  }
}

export async function eliminarCorreoAutorizado(email) {
  try {
    await deleteDoc(doc(db, 'correos_autorizados', email));
  } catch (err) {
    console.error('[firebase] Error al eliminar correo autorizado:', err);
    throw err;
  }
}

// ── Bitácora de Laboratorios ──

export const LABORATORIOS = [
  '102', '106', '109',
  '503', '506',
  'M02', 'M05', 'M11', 'M12', 'M13', 'M14'
];

export const ACTIVIDADES = {
  'CP': 'Clase Programada',
  'CNP': 'Clase No Programada',
  'O': 'Otros'
};

export async function guardarRegistroBitacora(registro) {
  try {
    const docRef = await addDoc(collection(db, 'bitacora_lab'), {
      ...registro,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.error('[firebase] Error al guardar registro de bitácora:', err);
    throw err;
  }
}

export async function eliminarRegistroBitacora(id) {
  try {
    await deleteDoc(doc(db, 'bitacora_lab', id));
  } catch (err) {
    console.error('[firebase] Error al eliminar registro de bitácora:', err);
    throw err;
  }
}
