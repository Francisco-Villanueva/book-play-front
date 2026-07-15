import { create } from 'zustand'
import type { User } from '@/shared/types/domain'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),

  setAuth: (user, token) => {
    localStorage.setItem('auth_token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    set({ user: null, token: null })
  },
}))
