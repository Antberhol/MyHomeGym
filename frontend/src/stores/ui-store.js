import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function isAutoTimeDark(date) {
  const hour = date.getHours()
  return hour >= 21 || hour < 7
}

export function resolveDarkThemePreference(theme, prefersDark, now = new Date()) {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  if (theme === 'auto-time') return isAutoTimeDark(now)
  return prefersDark
}

export const useUiStore = create()(
  persist(
    (set) => ({
      // La interfaz está diseñada en modo oscuro (fondo de caucho, texto tiza).
      theme: 'dark',
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'gym-ui-state',
      version: 2,
      migrate: (persisted) => ({ ...persisted, theme: 'dark' }),
    },
  ),
)
