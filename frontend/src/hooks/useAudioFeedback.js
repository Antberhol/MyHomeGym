import { useEffect, useRef } from 'react'
import { subscribeWorkoutTimerFinished } from '../lib/events'

/** Un pitido corto con la Web Audio API. */
function beep(audioContext, startAt, frequency) {
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(0.25, startAt + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.18)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + 0.2)
}

/** Hace sonar un pitido doble cuando termina el descanso (FR-3.09). Si el navegador no tiene audio, no hace nada. */
export function useAudioFeedback() {
  const audioContextRef = useRef(null)

  useEffect(
    () =>
      subscribeWorkoutTimerFinished(() => {
        const Ctx = window.AudioContext || window.webkitAudioContext
        if (!Ctx) return
        try {
          audioContextRef.current ??= new Ctx()
          const audioContext = audioContextRef.current
          void audioContext.resume?.()
          beep(audioContext, audioContext.currentTime, 880)
          beep(audioContext, audioContext.currentTime + 0.25, 1175)
        } catch {
          // Sin permiso de audio (por ejemplo, antes de la primera pulsación) no suena, y no pasa nada.
        }
      }),
    [],
  )
}
