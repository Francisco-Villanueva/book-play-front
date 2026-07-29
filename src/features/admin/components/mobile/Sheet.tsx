import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

type SheetSnap = 'auto' | 'mid' | 'full'

interface SheetProps {
  onClose: () => void
  children: ReactNode
  title?: string
  subtitle?: string
  footer?: ReactNode
  snap?: SheetSnap
  ariaLabel?: string
}

const SNAP_HEIGHT: Record<SheetSnap, string> = {
  auto: 'max-h-[88%]',
  mid: 'max-h-[74%]',
  full: 'max-h-[94%]',
}

// Arrastrar más que esto cierra la hoja; por debajo vuelve sola a su lugar.
const DISMISS_PX = 90

export function Sheet({ onClose, children, title, subtitle, footer, snap = 'auto', ariaLabel }: SheetProps) {
  const [drag, setDrag] = useState(0)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  const handleDown = (e: PointerEvent<HTMLDivElement>) => {
    startY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (startY.current == null) return
    setDrag(Math.max(0, e.clientY - startY.current))
  }
  const handleUp = () => {
    if (startY.current == null) return
    if (drag > DISMISS_PX) onClose()
    setDrag(0)
    startY.current = null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title ?? 'Panel'}
      className="fixed inset-0 z-[100] flex flex-col justify-end"
    >
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(13,20,25,0.42)] animate-backdrop-in"
      />

      <div
        className={cn(
          'relative flex flex-col bg-white rounded-t-2xl shadow-xl animate-sheet-in',
          SNAP_HEIGHT[snap],
        )}
        style={{
          transform: `translateY(${drag}px)`,
          transition: startY.current == null ? 'transform 180ms cubic-bezier(0.22,1,0.36,1)' : 'none',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          className="flex-none pt-2.5 pb-1 cursor-grab touch-none"
        >
          <div className="w-9 h-[5px] rounded-[3px] bg-ink-200 mx-auto" />
        </div>

        {(title ?? subtitle) && (
          <div className="flex-none px-5 pt-1 pb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title && (
                <h2 className="font-display font-bold text-[21px] tracking-tight text-ink-900">{title}</h2>
              )}
              {subtitle && <p className="text-caption text-ink-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="w-11 h-11 -mr-2 -mt-1 flex-none rounded-full border-none bg-transparent cursor-pointer flex items-center justify-center text-ink-700"
            >
              <span className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center">
                <X size={17} aria-hidden />
              </span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>

        {footer && (
          <div className="flex-none px-5 pt-3 pb-4 border-t border-ink-100 bg-white">{footer}</div>
        )}
      </div>
    </div>
  )
}
