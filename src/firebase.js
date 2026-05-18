import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

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

export function getRolPorDominio(email) {
  if (ADMIN_EMAILS.includes(email)) return 'admin';
  if (email.endsWith(`@${DOMINIO_ESTUDIANTE}`)) return 'estudiante';
  if (email.endsWith(`@${DOMINIO_DOCENTE}`)) return 'docente';
  return null;
}

export function getProfesorPorEmail(email) {
  return PROFESOR_EMAILS[email] || null;
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
  const rolBase = getRolPorDominio(email);

  console.log('[firebase] photoURL desde Google:', usuarioFirebase.photoURL);

  try {
    const userRef = doc(db, 'usuarios', usuarioFirebase.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const preferencias = crearPreferenciasIniciales(rolBase, email);
      const nuevoUsuario = {
        email,
        nombre: usuarioFirebase.displayName || '',
        foto: usuarioFirebase.photoURL || '',
        uid: usuarioFirebase.uid,
        rol: rolBase,
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
