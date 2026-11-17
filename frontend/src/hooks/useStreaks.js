import { useEffect } from 'react'
import { useLiveQuery } from '../lib/liveQuery'
import { sendLocalNotification, streakWarningMessage } from '../lib/notifications'
import { progressRepository } from '../repositories/progressRepository'
import { settingsRepository } from '../repositories/settingsRepository'
import { streakWarningDelay, summarizeStreaks, toLocalDateKey } from '../utils/streaks'

const EMPTY_STREAKS = summarizeStreaks([])

const STREAK_WARNING_STORAGE_KEY = 'lastStreakWarningDate'

export function useStreaks() {
  const data = useLiveQuery(async () => {
    const trainings = await progressRepository.listTrainingsUntil(new Date().toISOString())
    return summarizeStreaks(trainings.map((item) => item.fecha))
  }, [])

  const notificationSettings = useLiveQuery(() => settingsRepository.getNotificationSettings(), [])

  const streak = data?.currentDayStreak ?? 0
  const trainedToday = Boolean(data?.trainedToday)
  const warningEnabled = Boolean(notificationSettings?.streakWarningEnabled)
  const warningHour = notificationSettings?.streakWarningHour ?? 19

  // Aviso de racha (RN-6.06). Si entrenas antes de la hora, el efecto se repite y el aviso se cancela.
  useEffect(() => {
    if (!warningEnabled || !('Notification' in window) || Notification.permission !== 'granted') return
    const delay = streakWarningDelay({
      streak,
      trainedToday,
      hour: warningHour,
      lastWarningDay: window.localStorage.getItem(STREAK_WARNING_STORAGE_KEY),
    })
    if (delay === null) return

    const timeoutId = window.setTimeout(() => {
      try {
        const { title, body } = streakWarningMessage(streak)
        sendLocalNotification(title, body)
        // Solo se apunta como avisado cuando el aviso ha salido de verdad: como mucho uno al día.
        window.localStorage.setItem(STREAK_WARNING_STORAGE_KEY, toLocalDateKey(new Date()))
      } catch {
        // El permiso puede haberse retirado mientras tanto: no hay nada que hacer.
      }
    }, delay)
    return () => window.clearTimeout(timeoutId)
  }, [streak, trainedToday, warningEnabled, warningHour])

  if (!data) return EMPTY_STREAKS

  return {
    currentDayStreak: data.currentDayStreak,
    currentWeekStreak: data.currentWeekStreak,
    totalTrainings: data.totalTrainings,
    lastTrainingDate: data.lastTrainingDate,
    trainedToday: Boolean(data.trainedToday),
  }
}
