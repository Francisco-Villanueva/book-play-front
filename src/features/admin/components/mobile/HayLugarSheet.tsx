import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useBusinessAvailability } from '@/features/bookings/hooks/useBookings'
import { formatLongDateEs, formatMoneyARS, timeToHours } from '@/shared/utils/date'
import { courtColor } from '../courtTypes'
import { Sheet } from './Sheet'

type Franja = 'manana' | 'tarde' | 'noche'

const FRANJAS: { key: Franja; label: string; from: number; to: number }[] = [
  { key: 'manana', label: 'Mañana', from: 0, to: 13 },
  { key: 'tarde', label: 'Tarde', from: 13, to: 18 },
  { key: 'noche', label: 'Noche', from: 18, to: 24 },
]

function currentFranja(): Franja {
  const h = new Date().getHours()
  return h < 13 ? 'manana' : h < 18 ? 'tarde' : 'noche'
}

interface HayLugarSheetProps {
  businessId: string
  date: string
  onPick: (courtId: string, startTime: string) => void
  onClose: () => void
}

export function HayLugarSheet({ businessId, date, onPick, onClose }: HayLugarSheetProps) {
  const [franja, setFranja] = useState<Franja>(currentFranja)
  const { data, isLoading, isError } = useBusinessAvailability(businessId, date)

  const range = FRANJAS.find((f) => f.key === franja)!

  const slots = useMemo(() => {
    const out = (data?.courts ?? []).flatMap((court) =>
      court.availableSlots
        .filter((slot) => {
          const h = timeToHours(slot.startTime)
          return h >= range.from && h < range.to
        })
        .map((slot) => ({
          courtId: court.courtId,
          courtName: court.name,
          sport: court.sportType ?? '—',
          price: court.pricePerSlot,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
    )
    return out.sort((a, b) => a.startTime.localeCompare(b.startTime) || a.courtName.localeCompare(b.courtName))
  }, [data, range])

  return (
    <Sheet onClose={onClose} snap="full" title="¿Hay lugar?" subtitle={formatLongDateEs(date)}>
      <p className="text-overline text-ink-400 mb-2.5">Franja</p>
      <div className="flex gap-2 mb-4">
        {FRANJAS.map((f) => {
          const on = franja === f.key
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={on}
              onClick={() => setFranja(f.key)}
              className={cn(
                'flex-1 py-2.5 rounded-md border-[1.5px] cursor-pointer font-body text-caption text-center',
                on ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-ink-200 bg-white text-ink-700 font-semibold',
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {isError ? (
        <p className="py-7 text-center text-body-sm text-red-600">No pudimos consultar la disponibilidad.</p>
      ) : isLoading ? (
        <p className="py-7 text-center text-body-sm text-ink-400">Buscando huecos…</p>
      ) : (
        <>
          <p className="text-overline text-ink-400 mb-2.5" aria-live="polite">
            {slots.length === 1 ? '1 hueco disponible' : `${slots.length} huecos disponibles`}
          </p>

          {slots.length === 0 ? (
            <p className="py-7 text-center text-body-sm text-ink-500">
              No hay huecos en esa franja. Probá otro momento del día u otra fecha.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {slots.map((slot) => (
                <button
                  key={`${slot.courtId}-${slot.startTime}`}
                  type="button"
                  onClick={() => onPick(slot.courtId, slot.startTime)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-md border border-ink-100 bg-white shadow-xs cursor-pointer text-left"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-none"
                    style={{ background: courtColor(slot.sport) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-body-sm text-ink-900 truncate">
                      {slot.courtName} · {slot.sport}
                    </div>
                    <div className="tnum font-mono text-caption text-ink-500 mt-px">
                      {slot.startTime} – {slot.endTime}
                      {slot.price != null && ` · ${formatMoneyARS(slot.price)}`}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-ink-400 flex-none" aria-hidden />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </Sheet>
  )
}
