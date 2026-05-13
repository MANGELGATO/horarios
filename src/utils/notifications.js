export const NOTIFICATION_TAG = {
  PROXIMA: 'clase-proxima',
  PROXIMA_10: 'clase-proxima-10',
  TERMINANDO: 'clase-terminando',
}

let permisoResuelto = false

export async function solicitarPermiso() {
  if (permisoResuelto) return Notification.permission === 'granted'
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') {
    permisoResuelto = true
    return true
  }
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  permisoResuelto = true
  return result === 'granted'
}

export async function enviarNotificacion(title, body, tag) {
  if (!('serviceWorker' in navigator)) return
  if (!await solicitarPermiso()) return

  try {
    const reg = await navigator.serviceWorker.ready
    reg.showNotification(title, {
      body,
      icon: '/pwa-192x192.webp',
      badge: '/pwa-192x192.webp',
      tag: tag || 'default',
      vibrate: [200, 100, 200],
    })
  } catch { /* notification not supported */ }
}
