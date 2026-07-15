import { cn } from '@/shared/utils/cn'

type BookingCardStatus = 'confirmed' | 'pending' | 'cancelled'

interface BookingCardProps {
  court: string
  sport?: string
  day?: string
  month?: string
  time?: string
  status?: BookingCardStatus
  price?: string
  onClick?: () => void
  className?: string
}

const statusStyles: Record<BookingCardStatus, { badge: string; dot: string }> = {
  confirmed: { badge: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  pending: { badge: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
  cancelled: { badge: 'bg-red-50 text-red-700 border-red-100 line-through', dot: 'bg-red-500' },
}

const statusLabels: Record<BookingCardStatus, string> = {
  confirmed: 'Confirmada',
  pending: 'En espera',
  cancelled: 'Cancelada',
}

export function BookingCard({
  court,
  sport,
  day,
  month,
  time,
  status = 'confirmed',
  price,
  onClick,
  className,
}: BookingCardProps) {
  const st = statusStyles[status] ?? statusStyles.confirmed

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'flex items-center gap-3 bg-white border border-ink-100 rounded-lg p-3.5 shadow-sm',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-[180ms] active:scale-[0.99]',
        className,
      )}
    >
      {(day ?? month) && (
        <div className="flex-none w-11 h-11 rounded-md bg-ink-50 border border-ink-100 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-h4 text-ink-900 leading-none">{day}</span>
          <span className="text-overline text-ink-400 uppercase leading-none mt-0.5">{month}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-body-sm text-ink-900 font-body truncate">
          {court}
          {sport && <span className="text-ink-400 font-normal"> · {sport}</span>}
        </p>
        {time && (
          <p className="font-mono text-caption text-ink-500 mt-0.5 [font-variant-numeric:tabular-nums]">{time}</p>
        )}
      </div>
      <div className="flex-none flex flex-col items-end gap-1.5">
        {price && (
          <span className="font-mono font-bold text-body-sm text-ink-900 [font-variant-numeric:tabular-nums]">{price}</span>
        )}
        <span className={cn('text-overline px-2 py-0.5 rounded-full border', st.badge)}>
          {statusLabels[status]}
        </span>
      </div>
    </div>
  )
}
