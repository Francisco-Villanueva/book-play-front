import { create } from 'zustand'
import { useAdminStore } from '@/features/admin/store/adminStore'
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
    // El id del complejo queda en localStorage: en una máquina compartida no
    // debe sobrevivir a la sesión que lo generó.
    useAdminStore.getState().clearActiveBusinessId()
    set({ user: null, token: null })
  },
}))
