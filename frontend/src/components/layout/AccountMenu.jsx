import { LogOut, Settings, UserCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/useLanguage'
import { useAuthStore } from '../../stores/auth-store'

export function AccountMenu() {
  const { t } = useTranslation()
  const { currentLanguage, changeLanguage } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const name = user?.displayName || user?.username || ''
  const initial = name.charAt(0).toUpperCase() || '?'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('auth.accountMenu')}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-gym-border bg-gym-card font-display text-xl font-extrabold text-gym-text-bright"
      >
        {initial}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-gym-border bg-gym-card shadow-2xl"
        >
          <p className="border-b border-gym-border px-4 py-3 text-sm text-gym-text-dim">
            {t('auth.signedInAs', { name })}
          </p>
          <Link
            role="menuitem"
            to="/perfil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gym-text-base hover:bg-gym-card-2"
          >
            <UserCircle size={18} /> {t('nav.profile')}
          </Link>
          <Link
            role="menuitem"
            to="/configuracion"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gym-text-base hover:bg-gym-card-2"
          >
            <Settings size={18} /> {t('nav.settings')}
          </Link>
          <div className="flex gap-2 border-t border-gym-border px-4 py-3">
            {[
              ['es', 'Español'],
              ['en', 'English'],
            ].map(([code, label]) => (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={currentLanguage === code}
                onClick={() => void changeLanguage(code)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-semibold ${
                  currentLanguage === code ? 'bg-gym-card-2 text-gym-text-bright' : 'text-gym-text-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void logout()
            }}
            className="flex w-full items-center gap-3 border-t border-gym-border px-4 py-3 text-left text-sm font-semibold text-gym-danger hover:bg-gym-card-2"
          >
            <LogOut size={18} /> {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
