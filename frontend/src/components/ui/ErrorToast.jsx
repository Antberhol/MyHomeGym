import { useEffect, useState } from 'react'
import { ApiError } from '../../lib/api'

const VISIBLE_MS = 6000

/**
 * Aviso global cuando una acción que habla con el servidor falla y nadie lo ha gestionado (por
 * ejemplo, guardar el orden de una rutina sin conexión). Así ningún fallo de guardado pasa en
 * silencio. El mensaje ya viene traducido en el ApiError.
 */
export function ErrorToast() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const onRejection = (event) => {
      if (!(event.reason instanceof ApiError)) return
      event.preventDefault()
      setMessage(event.reason.message)
    }
    window.addEventListener('unhandledrejection', onRejection)
    return () => window.removeEventListener('unhandledrejection', onRejection)
  }, [])

  useEffect(() => {
    if (!message) return
    const timeoutId = window.setTimeout(() => setMessage(''), VISIBLE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [message])

  if (!message) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <p
        role="alert"
        className="pointer-events-auto max-w-md rounded-xl border border-gym-danger bg-gym-card px-4 py-3 text-[15px] font-semibold text-gym-text-bright shadow-lg"
      >
        {message}
      </p>
    </div>
  )
}
