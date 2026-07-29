import { create } from 'zustand'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastState {
  /** Cambia en cada flash: sirve de `key` para que la animación de entrada se repita. */
  id: number
  message: string
  kind: ToastKind
  onUndo?: (() => void) | undefined
}

export interface ToastOptions {
  kind?: ToastKind
  onUndo?: () => void
}

interface ToastStore {
  toast: ToastState | null
  flash: (message: string, options?: ToastOptions) => void
  dismiss: () => void
}

const PLAIN_MS = 2600
const UNDO_MS = 5000

let timer: number | null = null
let nextId = 0

// Un solo toast a la vez: el nuevo reemplaza al anterior. Apilarlos taparía el
// header en mobile, que es donde vive (ver Toast.tsx).
export const useToastStore = create<ToastStore>((set) => ({
  toast: null,

  flash: (message, options = {}) => {
    if (timer != null) window.clearTimeout(timer)
    nextId += 1
    set({
      toast: { id: nextId, message, kind: options.kind ?? 'success', onUndo: options.onUndo },
    })
    timer = window.setTimeout(
      () => set({ toast: null }),
      options.onUndo ? UNDO_MS : PLAIN_MS,
    )
  },

  dismiss: () => {
    if (timer != null) window.clearTimeout(timer)
    set({ toast: null })
  },
}))

/** Para disparar toasts fuera de React (interceptores, QueryCache, etc.). */
export function flashToast(message: string, options?: ToastOptions) {
  useToastStore.getState().flash(message, options)
}
