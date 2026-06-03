import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore'

// ── Pega tu firebaseConfig aquí ──
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "horarios-ccd.firebaseapp.com",
  projectId:         "horarios-ccd",
  storageBucket:     "horarios-ccd.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

// ── Importa tus horarios actuales ──
import { horarios } from '../src/data/horarios.js'

const CUATRIMESTRE = '2026B'

async function cargar() {
  console.log(`🚀 Iniciando carga de ${CUATRIMESTRE}...`)

  // 1. Crea el documento del calendario
  await setDoc(doc(db, 'calendarios', CUATRIMESTRE), {
    nombre:    CUATRIMESTRE,
    activo:    true,
    creadoEn:  new Date()
  })
  console.log(`✅ Calendario ${CUATRIMESTRE} creado`)

  // 2. Carga clases en lotes de 499 (límite Firestore)
  const chunks = []
  for (let i = 0; i < horarios.length; i += 499) {
    chunks.push(horarios.slice(i, i + 499))
  }

  let total = 0
  for (const chunk of chunks) {
    const batch = writeBatch(db)
    chunk.forEach(clase => {
      const ref = doc(collection(db, 'calendarios', CUATRIMESTRE, 'clases'))
      batch.set(ref, clase)
    })
    await batch.commit()
    total += chunk.length
    console.log(`📦 ${total}/${horarios.length} clases subidas...`)
  }

  console.log(`🎉 ¡Listo! ${horarios.length} clases en Firestore`)
  process.exit(0)
}

cargar().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})