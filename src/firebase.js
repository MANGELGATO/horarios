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

export function getRolPorDominio(email) {
  if (ADMIN_EMAILS.includes(email)) return 'admin';
  if (email.endsWith(`@${DOMINIO_ESTUDIANTE}`)) return 'estudiante';
  if (email.endsWith(`@${DOMINIO_DOCENTE}`)) return 'docente';
  return null;
}

export function dominioPermitido(email) {
  return email.endsWith(`@${DOMINIO_ESTUDIANTE}`) || email.endsWith(`@${DOMINIO_DOCENTE}`);
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
      const nuevoUsuario = {
        email,
        nombre: usuarioFirebase.displayName || '',
        foto: usuarioFirebase.photoURL || '',
        uid: usuarioFirebase.uid,
        rol: rolBase,
        dominio,
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
    return {
      email,
      nombre: usuarioFirebase.displayName || '',
      foto: usuarioFirebase.photoURL || '',
      uid: usuarioFirebase.uid,
      rol: rolBase,
      dominio,
      activo: true,
      ultimoAcceso: new Date(),
      createdAt: new Date(),
      _sinFirestore: true,
    };
  }
}
