import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Hoja inferior para formularios y detalles. En escritorio se centra como un diálogo.
 * `footer` queda fijo abajo (el botón de guardar), el contenido hace scroll.
 */
export function Sheet({ isOpen, onClose, title, footer, children }) {
  const { t } = useTranslation()
  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-gym-black/70 md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl border border-gym-border bg-gym-card md:rounded-3xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
              <h2 className="font-display text-2xl text-gym-text-bright">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('common.close')}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-gym-text-dim hover:bg-gym-card-2"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
            {footer && (
              <div className="border-t border-gym-border px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
                {footer}
              </div>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Nombre antiguo, para las pantallas que aún lo usan. */
export const BottomSheet = Sheet
