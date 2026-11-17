import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function ReloadPrompt() {
  const { t } = useTranslation()
  const [closed, setClosed] = useState(false)
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh || closed) return null

  return (
    <div className="fixed right-4 z-50 w-[min(92vw,360px)] rounded-xl border border-gym-border-2 bg-gym-black p-4 shadow-xl md:bottom-6 bottom-[calc(5rem+env(safe-area-inset-bottom))]">
      <p className="font-semibold text-gym-text-bright">{t('pwa.reloadPrompt.title')}</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            void updateServiceWorker(true)
          }}
          className="h-10 rounded-lg bg-gym-accent px-4 text-sm font-semibold text-gym-on-accent"
        >
          {t('pwa.reloadPrompt.update')}
        </button>
        <button
          type="button"
          onClick={() => setClosed(true)}
          className="h-10 rounded-lg border border-gym-border-2 px-4 text-sm font-semibold text-gym-text-bright"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  )
}
