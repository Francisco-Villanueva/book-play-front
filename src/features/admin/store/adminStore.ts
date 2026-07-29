import { create } from 'zustand'

// Persistido: al volver del modo jugador (o tras un reload) hay que reabrir el
// complejo que el usuario estaba usando, no el primero de su lista.
const LAST_BUSINESS_KEY = 'last_business_id'

interface AdminState {
  activeBusinessId: string | null
  sidebarOpen: boolean
  setActiveBusinessId: (id: string) => void
  clearActiveBusinessId: () => void
  toggleSidebar: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  activeBusinessId: localStorage.getItem(LAST_BUSINESS_KEY),
  sidebarOpen: true,

  setActiveBusinessId: (id) => {
    localStorage.setItem(LAST_BUSINESS_KEY, id)
    set({ activeBusinessId: id })
  },

  clearActiveBusinessId: () => {
    localStorage.removeItem(LAST_BUSINESS_KEY)
    set({ activeBusinessId: null })
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
