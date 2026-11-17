import { useTranslation } from 'react-i18next'

export function LoadingSpinner() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status">
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-gym-border-2 border-t-gym-text-bright"
        aria-hidden="true"
      />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  )
}
