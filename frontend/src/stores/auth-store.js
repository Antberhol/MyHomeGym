import { create } from 'zustand'
import i18n from '../i18n'
import { ApiError, onSessionExpired } from '../lib/api'
import { authService } from '../services/authService'

function messageFrom(error, fallback) {
  if (error instanceof ApiError || error instanceof Error) return error.message || fallback
  return fallback
}

export const useAuthStore = create((set) => ({
  user: null,
  isAuthReady: false,
  isAuthLoading: false,
  authError: undefined,

  restoreSession: async () => {
    try {
      const user = await authService.restoreSession()
      set({ user, isAuthReady: true })
    } catch {
      set({ user: null, isAuthReady: true })
    }
  },

  login: async (credentials) => {
    set({ isAuthLoading: true, authError: undefined })
    try {
      const user = await authService.login(credentials)
      set({ user, isAuthLoading: false })
      return true
    } catch (error) {
      set({ isAuthLoading: false, authError: messageFrom(error, i18n.t('errors.loginFailed')) })
      return false
    }
  },

  register: async (data) => {
    set({ isAuthLoading: true, authError: undefined })
    try {
      const user = await authService.register(data)
      set({ user, isAuthLoading: false })
      return true
    } catch (error) {
      set({ isAuthLoading: false, authError: messageFrom(error, i18n.t('errors.registerFailed')) })
      return false
    }
  },

  logout: async () => {
    set({ isAuthLoading: true })
    try {
      await authService.logout()
    } finally {
      set({ user: null, isAuthLoading: false, authError: undefined })
    }
  },

  clearAuthError: () => set({ authError: undefined }),
}))

onSessionExpired(() => {
  useAuthStore.setState({ user: null, authError: i18n.t('errors.SESSION_EXPIRED') })
})
