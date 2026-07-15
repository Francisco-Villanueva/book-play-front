import { create } from 'zustand'

interface AdminState {
  activeBusinessId: string | null
  sidebarOpen: boolean
  setActiveBusinessId: (id: string) => void
  toggleSidebar: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  activeBusinessId: null,
  sidebarOpen: true,
  setActiveBusinessId: (id) => set({ activeBusinessId: id }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
