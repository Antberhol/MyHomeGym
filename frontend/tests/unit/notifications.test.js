import { afterAll, describe, expect, it } from 'vitest'
import i18n from '../../src/i18n'
import { restFinishedMessage, streakWarningMessage } from '../../src/lib/notifications'

describe('textos de los avisos', () => {
  afterAll(() => i18n.changeLanguage('es'))

  it('salen en el idioma de la app', async () => {
    await i18n.changeLanguage('es')
    expect(streakWarningMessage(4).body).toBe('Llevas 4 días seguidos. Entrena hoy para no perder la racha.')
    expect(restFinishedMessage().body).toBe('Descanso terminado. Siguiente serie.')

    await i18n.changeLanguage('en')
    expect(streakWarningMessage(4).body).toBe("You're on a 4-day streak. Train today to keep it going.")
    expect(restFinishedMessage().body).toBe('Rest over. Next set.')
  })
})
