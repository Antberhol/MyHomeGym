import i18n from '../i18n'

/** Textos de los avisos, en el idioma actual de la app. */
export function streakWarningMessage(streakDays) {
  return {
    title: i18n.t('notifications.streakTitle'),
    body: i18n.t('notifications.streakBody', { count: streakDays }),
  }
}

export function restFinishedMessage() {
  return { title: 'MyHomeGym', body: i18n.t('notifications.restBody') }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error(i18n.t('notifications.unsupported'))
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function sendLocalNotification(title, body) {
  if (!('Notification' in window)) {
    throw new Error(i18n.t('notifications.unsupported'))
  }

  if (Notification.permission !== 'granted') {
    throw new Error(i18n.t('notifications.notGranted'))
  }

  new Notification(title, { body })
}

export function scheduleRestTimerNotification(seconds) {
  if (!('Notification' in window)) return null
  if (Notification.permission !== 'granted') return null
  if (seconds <= 0) return null

  return window.setTimeout(() => {
    try {
      const { title, body } = restFinishedMessage()
      sendLocalNotification(title, body)
    } catch {
      // El permiso puede haberse retirado mientras tanto: no hay nada que hacer.
    }
  }, seconds * 1000)
}
