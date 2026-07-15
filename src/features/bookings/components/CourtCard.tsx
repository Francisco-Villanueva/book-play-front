import { type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { Badge } from '@/shared/components/Badge'

interface CourtCardProps {
  name: string
  sport?: string
  surface?: string
  price?: string
  nextSlot?: string | null
  available?: boolean
  accent?: string
  icon?: ReactNode
  onClick?: (() => void) | undefined
  className?: string
}

export function CourtCard({
  name,
  sport,
  surface,
  price,
  nextSlot,
  available = true,
  accent = 'var(--green-500)',
  icon,
  onClick,
  className,
}: CourtCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'bg-white border border-ink-100 rounded-lg p-4 shadow-sm',
        'transition-all duration-[180ms]',
        onClick && available && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]',
        !available && 'opacity-60',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {icon && (
            <div
              className="w-10 h-10 rounded-md flex-none flex items-center justify-center"
              style={{ background: `color-mix(in srgb, ${accent} 12%, white)` }}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-display font-bold text-h4 text-ink-900 truncate">{name}</p>
            {(sport ?? surface) && (
              <p className="text-caption text-ink-500 mt-0.5 truncate">
                {[sport, surface].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
        {price && (
          <div className="text-right flex-none">
            <p className="font-mono font-bold text-body-sm text-ink-900 [font-variant-numeric:tabular-nums]">{price}</p>
            <p className="text-overline text-ink-400 mt-0.5">por hora</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {available && nextSlot ? (
          <span className="text-caption text-green-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-none" />
            Libre · próximo: <strong className="font-mono">{nextSlot}</strong>
          </span>
        ) : available ? (
          <Badge tone="success" dot>Disponible</Badge>
        ) : (
          <span className="text-caption text-ink-500">Completa por hoy</span>
        )}
        {available && onClick && (
          <span
            className="text-caption font-bold px-3 py-1 rounded-full text-white"
            style={{ background: accent }}
          >
            Reservar →
          </span>
        )}
      </div>
    </div>
  )
}
