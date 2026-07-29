import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { ToastKind, ToastState } from '@/shared/store/toastStore'

const ICON = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
} as const

const ACCENT: Record<ToastKind, string> = {
  success: 'var(--green-500)',
  error: 'var(--red-500)',
  info: 'var(--blue-500)',
}

interface ToastProps {
  toast: ToastState
  onDismiss: () => void
}

// Arriba y no abajo: abajo compite con la barra de pestañas y el FAB.
export function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = ICON[toast.kind]

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-4 right-4 z-[120] flex items-center gap-2.5 rounded-md bg-ink-900 text-white px-3.5 py-3 shadow-lg animate-toast-in"
      style={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}
    >
      <Icon size={18} color={ACCENT[toast.kind]} aria-hidden />
      <span className="flex-1 text-caption font-semibold leading-snug">{toast.message}</span>
      {toast.onUndo && (
        <button
          type="button"
          onClick={() => {
            toast.onUndo?.()
            onDismiss()
          }}
          className="flex-none border-none bg-transparent text-green-300 font-body font-bold text-caption cursor-pointer"
        >
          Deshacer
        </button>
      )}
    </div>
  )
}
