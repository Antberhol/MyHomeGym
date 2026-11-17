import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WORKOUT_TIMER_FINISHED_EVENT } from '../../src/lib/events'
import { elapsedSeconds, formatClock, remainingSeconds } from '../../src/utils/workoutClock'

const notified = vi.fn()
vi.mock('../../src/lib/notifications', () => ({
  scheduleRestTimerNotification: (seconds) => window.setTimeout(notified, seconds * 1000),
}))

const { useWorkoutTimer } = await import('../../src/hooks/useWorkoutTimer')

/** El navegador congela los temporizadores en segundo plano: el reloj avanza, pero no hay tics. */
function sleepInBackground(seconds) {
  vi.setSystemTime(Date.now() + seconds * 1000)
  act(() => document.dispatchEvent(new Event('visibilitychange')))
}

describe('reloj del entreno (funciones puras)', () => {
  it('suma lo acumulado y lo que lleva en marcha; en pausa no avanza', () => {
    expect(elapsedSeconds(120, 1_000, 31_500)).toBe(150)
    expect(elapsedSeconds(120, null, 999_999)).toBe(120)
  })

  it('el descanso restante se redondea hacia arriba y nunca es negativo', () => {
    expect(remainingSeconds(10_000, 9_100)).toBe(1)
    expect(remainingSeconds(10_000, 12_000)).toBe(0)
    expect(remainingSeconds(null, 0)).toBe(0)
  })

  it('formatea minutos y segundos', () => {
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(95)).toBe('01:35')
  })
})

describe('useWorkoutTimer (RN-3.04, RN-3.10, RN-3.11)', () => {
  let finished

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 16, 18, 0, 0))
    notified.mockClear()
    finished = vi.fn()
    window.addEventListener(WORKOUT_TIMER_FINISHED_EVENT, finished)
  })

  afterEach(() => {
    window.removeEventListener(WORKOUT_TIMER_FINISHED_EVENT, finished)
    vi.useRealTimers()
  })

  it('el cronómetro sigue la hora real aunque la app esté en segundo plano', () => {
    const { result } = renderHook(() => useWorkoutTimer({ initialSessionSeconds: 10 }))
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.sessionSeconds).toBe(15)

    sleepInBackground(600)
    expect(result.current.sessionSeconds).toBe(615)
  })

  it('el tiempo en pausa no cuenta', () => {
    const { result } = renderHook(() => useWorkoutTimer())
    act(() => vi.advanceTimersByTime(30_000))
    act(() => result.current.toggleSessionRunning())
    act(() => vi.advanceTimersByTime(120_000))
    expect(result.current.sessionSeconds).toBe(30)

    act(() => result.current.toggleSessionRunning())
    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current.sessionSeconds).toBe(40)
  })

  it('el descanso termina a su hora aunque el móvil haya estado bloqueado, y avisa una sola vez', () => {
    const { result } = renderHook(() => useWorkoutTimer())
    act(() => result.current.startRestTimer(90))
    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current.restSeconds).toBe(80)

    sleepInBackground(200)
    expect(result.current.restSeconds).toBe(0)
    expect(finished).toHaveBeenCalledTimes(1)
  })

  it('saltar el descanso no suena ni deja un aviso pendiente', () => {
    const { result } = renderHook(() => useWorkoutTimer({ restNotificationsEnabled: true }))
    act(() => result.current.startRestTimer(90))
    act(() => result.current.setRestSeconds(0))
    act(() => vi.advanceTimersByTime(120_000))

    expect(result.current.restSeconds).toBe(0)
    expect(finished).not.toHaveBeenCalled()
    expect(notified).not.toHaveBeenCalled()
  })

  it('al alargar el descanso, el aviso se reprograma con el tiempo nuevo', () => {
    const { result } = renderHook(() => useWorkoutTimer({ restNotificationsEnabled: true }))
    act(() => result.current.startRestTimer(60))
    act(() => vi.advanceTimersByTime(30_000))
    act(() => result.current.setRestSeconds(result.current.restSeconds + 15))
    expect(result.current.restSeconds).toBe(45)

    // Se bloquea la pantalla: los temporizadores del aviso sí corren, el reloj visible no importa.
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    act(() => vi.advanceTimersByTime(44_000))
    expect(notified).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1_500))
    expect(notified).toHaveBeenCalledTimes(1)
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
  })
})
