import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadedBarbell } from '../components/brand/LoadedBarbell'
import { useAuthStore } from '../stores/auth-store'

function Field({ id, label, hint, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gym-text-base">
        {label}
      </label>
      <input
        id={id}
        className="mt-1.5 w-full rounded-xl border border-gym-border bg-gym-black px-4 py-3 text-base text-gym-text-bright outline-none transition placeholder:text-gym-text-muted focus:border-gym-accent"
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-gym-text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}

export function LoginPage() {
  const { t } = useTranslation()
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading)
  const authError = useAuthStore((state) => state.authError)
  const clearAuthError = useAuthStore((state) => state.clearAuthError)
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  const isRegister = mode === 'register'

  const switchMode = (next) => {
    setMode(next)
    clearAuthError()
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (isRegister) {
      await register({ username: username.trim(), password, displayName: displayName.trim() || undefined })
    } else {
      await login({ username: username.trim(), password })
    }
  }

  const errorText = authError?.startsWith('No se puede conectar') ? t('auth.serverDown') : authError

  return (
    <div className="min-h-[100dvh] bg-gym-bg-dark text-gym-text-base">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-10 pt-12">
        <div className="-mx-2">
          <LoadedBarbell weight={140} label={t('auth.heroAlt')} />
        </div>

        <h1 className="mt-6 font-display text-6xl font-black leading-[0.9] text-gym-text-bright">
          MyHomeGym
        </h1>
        <p className="mt-3 max-w-[34ch] text-base leading-relaxed text-gym-text-dim">{t('auth.tagline')}</p>

        <div role="tablist" className="mt-8 grid grid-cols-2 rounded-xl bg-gym-black p-1">
          {[
            ['login', t('auth.loginTab')],
            ['register', t('auth.registerTab')],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => switchMode(value)}
              className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                mode === value ? 'bg-gym-card-2 text-gym-text-bright' : 'text-gym-text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate={false}>
          <Field
            id="username"
            label={t('auth.username')}
            hint={isRegister ? t('auth.usernameHint') : undefined}
            autoComplete="username"
            required
            minLength={3}
            maxLength={40}
            pattern="[A-Za-z0-9._\-]+"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          {isRegister && (
            <Field
              id="displayName"
              label={t('auth.displayName')}
              autoComplete="nickname"
              maxLength={80}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          )}
          <Field
            id="password"
            type="password"
            label={t('auth.password')}
            hint={isRegister ? t('auth.passwordHint') : undefined}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            minLength={isRegister ? 8 : 1}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {errorText && (
            <p
              role="alert"
              className="rounded-xl border border-gym-danger/40 bg-gym-danger/10 px-4 py-3 text-sm text-gym-text-bright"
            >
              {errorText}
            </p>
          )}

          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full rounded-xl bg-gym-accent py-3.5 font-display text-2xl font-extrabold text-gym-on-accent transition hover:bg-gym-accent-light disabled:opacity-60"
          >
            {isAuthLoading
              ? t('auth.working')
              : isRegister
                ? t('auth.submitRegister')
                : t('auth.submitLogin')}
          </button>
        </form>
      </div>
    </div>
  )
}
