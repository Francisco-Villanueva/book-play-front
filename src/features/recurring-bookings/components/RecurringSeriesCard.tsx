import { Calendar, Clock, Mail, MapPin, Phone, Repeat } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { formatLongDateEs, weekdayNameEs } from '@/shared/utils/date'
import type { RecurringBooking } from '@/shared/types/domain'

interface RecurringSeriesCardProps {
  series: RecurringBooking
  onEnd: (series: RecurringBooking) => void
  onResendLink: (series: RecurringBooking) => void
}

export function RecurringSeriesCard({ series, onEnd, onResendLink }: RecurringSeriesCardProps) {
  const isActive = series.status === 'ACTIVE'

  return (
    <li className="rounded-lg border border-ink-100 bg-white p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-display font-bold text-[15px] text-ink-900 truncate">
            {series.guestName ?? 'Sin nombre'}
          </p>
          <span
            className={
              isActive
                ? 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold border border-green-200 bg-green-50 text-green-700'
                : 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold border border-ink-200 bg-ink-50 text-ink-500'
            }
          >
            <Repeat size={10} aria-hidden />
            {isActive ? 'Activo' : 'Terminado'}
          </span>
        </div>

        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1.5 text-[12px] text-ink-600">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} className="text-ink-400" aria-hidden />
            Todos los {weekdayNameEs(series.dayOfWeek)} a las {series.startTime.slice(0, 5)}
          </span>
          {series.court && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-ink-400" aria-hidden />
              {series.court.name}
            </span>
          )}
          {series.guestPhone && (
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Phone size={13} className="text-ink-400" aria-hidden />
              {series.guestPhone}
            </span>
          )}
        </div>

        <p className="text-[11px] text-ink-400 mt-1.5 inline-flex items-center gap-1.5">
          <Calendar size={12} aria-hidden />
          {isActive
            ? `Reservado hasta el ${formatLongDateEs(series.generatedUntil)}`
            : `Terminó el ${formatLongDateEs(series.endDate ?? series.generatedUntil)}`}
        </p>

        {isActive && !series.guestEmail && (
          <p className="text-[11px] text-amber-700 mt-1">
            Sin correo: el cliente no puede ver ni gestionar sus fechas.
          </p>
        )}
      </div>

      {isActive && (
        <div className="flex gap-2 flex-none">
          <Button
            variant="ghost"
            onClick={() => onResendLink(series)}
            data-testid={`recurring-resend-${series.id}`}
            title={
              series.guestEmail
                ? `Reenviar el link a ${series.guestEmail}`
                : 'Este turno fijo no tiene correo cargado'
            }
          >
            <Mail size={15} aria-hidden />
            <span className="ml-1.5">{series.guestEmail ? 'Reenviar link' : 'Cargar correo'}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onEnd(series)}
            data-testid={`recurring-end-${series.id}`}
          >
            Terminar
          </Button>
        </div>
      )}
    </li>
  )
}
