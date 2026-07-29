import { type ReactNode, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'

interface StackScreenProps {
  title: string
  subtitle?: string
  onBack: () => void
  children: ReactNode
}

// Pantalla que se apila sobre la pestaña activa: mismo nivel visual que el shell,
// con "volver" propio. Se usa para lo que no merece una ruta (resumen, detalles).
export function StackScreen({ title, subtitle, onBack, children }: StackScreenProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onBack])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[90] flex flex-col bg-ink-25 animate-screen-in"
    >
      <div
        className="flex-none flex items-center gap-1.5 h-14 px-2 bg-white border-b border-ink-100"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className="w-11 h-11 flex-none rounded-full border-none bg-transparent cursor-pointer flex items-center justify-center"
        >
          <ChevronLeft size={24} className="text-ink-700" aria-hidden />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[18px] text-ink-900 leading-tight truncate">{title}</p>
          {subtitle && <p className="text-[12px] text-ink-500 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
        {children}
      </div>
    </div>
  )
}
