import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AccountMenu } from './AccountMenu'

/**
 * Cabecera de todas las pantallas: título grande, subtítulo opcional y, a la derecha,
 * una acción propia de la pantalla y el menú de cuenta.
 */
export function PageHeader({ title, subtitle, action, back, children }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <header className="mb-5">
      <div className="flex items-start gap-3">
        {back && (
          <button
            type="button"
            onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
            aria-label={t('common.back')}
            className="-ml-2 mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gym-text-dim hover:bg-gym-card"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="font-display text-[2.5rem] leading-[0.95] text-gym-text-bright">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[15px] text-gym-text-muted">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <AccountMenu />
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  )
}
