import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useLiveQuery } from './lib/liveQuery'
import { useTranslation } from 'react-i18next'
import { AppShell } from './components/layout/AppShell'
import { ReloadPrompt } from './components/pwa/ReloadPrompt'
import { ErrorToast } from './components/ui/ErrorToast'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { useLanguage } from './context/useLanguage'
import { LANGUAGE_STORAGE_KEY } from './i18n'
import { profileRepository } from './repositories/profileRepository'
import { useAuthStore } from './stores/auth-store'
import { resolveDarkThemePreference, useUiStore } from './stores/ui-store'

const LoginPage = lazy(() => import('./pages/Login').then((module) => ({ default: module.LoginPage })))
const OnboardingWizard = lazy(() =>
  import('./components/profile/OnboardingWizard').then((module) => ({ default: module.OnboardingWizard })),
)
const CatalogoPage = lazy(() =>
  import('./pages/Catalogo').then((module) => ({ default: module.CatalogoPage })),
)
const ExerciseDetailPage = lazy(() =>
  import('./pages/ExerciseDetailPage').then((module) => ({ default: module.ExerciseDetailPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.DashboardPage })),
)
const EntrenarPage = lazy(() =>
  import('./pages/Entrenar').then((module) => ({ default: module.EntrenarPage })),
)
const MisRutinasPage = lazy(() =>
  import('./pages/MisRutinas').then((module) => ({ default: module.MisRutinasPage })),
)
const RoutineDetailPage = lazy(() =>
  import('./pages/RoutineDetailPage').then((module) => ({ default: module.RoutineDetailPage })),
)
const PerfilPage = lazy(() => import('./pages/Perfil').then((module) => ({ default: module.PerfilPage })))
const ProgresoPage = lazy(() =>
  import('./pages/Progreso').then((module) => ({ default: module.ProgresoPage })),
)
const DiagramaCorporalPage = lazy(() =>
  import('./pages/DiagramaCorporal').then((module) => ({ default: module.DiagramaCorporalPage })),
)
const ConfiguracionPage = lazy(() =>
  import('./pages/Configuracion').then((module) => ({ default: module.ConfiguracionPage })),
)

function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/entrenar" element={<EntrenarPage />} />
            <Route path="/rutinas" element={<MisRutinasPage />} />
            <Route path="/rutinas/:id" element={<RoutineDetailPage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/catalogo/:id" element={<ExerciseDetailPage />} />
            <Route path="/progreso" element={<ProgresoPage />} />
            <Route path="/diagrama-corporal" element={<DiagramaCorporalPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function App() {
  const { t } = useTranslation()
  const { changeLanguage } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const isAuthReady = useAuthStore((state) => state.isAuthReady)
  const restoreSession = useAuthStore((state) => state.restoreSession)
  const profileQuery = useLiveQuery(async () => {
    if (!user) return null
    const result = await profileRepository.getProfile()
    return result ?? null
  }, [user?.id])
  const theme = useUiStore((state) => state.theme)
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return stored === 'es' || stored === 'en'
  })

  const languageButtons = useMemo(
    () => [
      { code: 'es', label: 'Español', flag: '🇪🇸' },
      { code: 'en', label: 'English', flag: '🇬🇧' },
    ],
    [],
  )

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const shouldUseDark = resolveDarkThemePreference(theme, media.matches)
      root.classList.toggle('dark', shouldUseDark)
    }

    applyTheme()

    const handleSystemThemeChange = () => {
      applyTheme()
    }

    media.addEventListener('change', handleSystemThemeChange)

    const intervalId = theme === 'auto-time' ? window.setInterval(applyTheme, 60 * 1000) : null

    return () => {
      media.removeEventListener('change', handleSystemThemeChange)
      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }
    }
  }, [theme])

  if (!hasSelectedLanguage) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gym-bg-dark p-4 text-gym-text-base">
        <div className="w-full max-w-md rounded-2xl border border-gym-border bg-gym-card p-6">
          <h1 className="font-display text-4xl font-extrabold text-gym-text-bright">
            {t('languageSelection.title')}
          </h1>
          <p className="mt-2 text-[15px] text-gym-text-muted">{t('languageSelection.subtitle')}</p>
          <div className="mt-5 grid grid-cols-1 gap-3">
            {languageButtons.map((option) => (
              <button
                key={option.code}
                type="button"
                className="flex items-center justify-center gap-3 rounded-xl border border-gym-border bg-gym-black px-4 py-4 text-lg font-semibold text-gym-text-bright transition hover:border-gym-accent"
                onClick={() => {
                  void changeLanguage(option.code)
                  setHasSelectedLanguage(true)
                }}
              >
                <span aria-hidden="true" className="text-2xl">
                  {option.flag}
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthReady) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LoginPage />
      </Suspense>
    )
  }

  // undefined = still loading, null = loaded but no profile
  if (profileQuery === undefined) {
    return <LoadingSpinner />
  }

  if (profileQuery === null) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <OnboardingWizard />
      </Suspense>
    )
  }

  return (
    <>
      <AppRouter />
      <ReloadPrompt />
      <ErrorToast />
    </>
  )
}

export default App
