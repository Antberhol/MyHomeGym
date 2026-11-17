import { db } from '../lib/db'

/** Ajustes de avisos de un usuario que aún no ha tocado nada. Coinciden con los del servidor. */
export const DEFAULT_NOTIFICATION_SETTINGS = {
  streakWarningEnabled: true,
  streakWarningHour: 19,
  restTimerNotificationEnabled: true,
}

export const settingsRepository = {
  async clearAllData() {
    await db.clearAllData()
  },

  async getNotificationSettings() {
    const stored = await db.getNotificationSettings()
    if (!stored) {
      return DEFAULT_NOTIFICATION_SETTINGS
    }
    return {
      streakWarningEnabled: stored.streakWarningEnabled ?? DEFAULT_NOTIFICATION_SETTINGS.streakWarningEnabled,
      streakWarningHour: stored.streakWarningHour ?? DEFAULT_NOTIFICATION_SETTINGS.streakWarningHour,
      restTimerNotificationEnabled:
        stored.restTimerNotificationEnabled ?? DEFAULT_NOTIFICATION_SETTINGS.restTimerNotificationEnabled,
    }
  },

  async saveNotificationSettings(settings) {
    await db.saveNotificationSettings(settings)
  },
}
