import { useState } from 'react'
import { AvailabilityLegend } from '@/features/bookings/components/AvailabilityLegend'
import { Button } from '@/shared/components/Button'
import { useAvailability } from '@/features/bookings/hooks/useBookings'
import { formatMoneyARS, relativeDayLabel } from '@/shared/utils/date'
import type { Court } from '@/shared/types/domain'
import { humanizeSport, NEXT_DAYS } from '../lib'
import { DateStrip } from './DateStrip'
import { StepHeader } from './ComplexHeader'

interface SlotPickerProps {
  businessId: string
  court: Court
  initialDate: string
  onBack: () => void
  onPick: (date: string, startTime: string, endTime: string) => void
}

export function SlotPicker({ businessId, court, initialDate, onBack, onPick }: SlotPickerProps) {
  const [date, setDate] = useState(initialDate || NEXT_DAYS[0]!)
  const [sel, setSel] = useState<string | null>(null)
  const { data, isLoading, isError } = useAvailability(businessId, court.id, date)
  const slots = data?.availableSlots ?? []

  const subtitle = [
    humanizeSport(court.sportType),
    court.surface,
    court.pricePerHour != null ? `${formatMoneyARS(court.pricePerHour)}/h` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <StepHeader title={court.name} subtitle={subtitle} onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <DateStrip selected={date} onSelect={(iso) => { setDate(iso); setSel(null) }} />
        <div className="px-4 py-2.5">
          <AvailabilityLegend />
        </div>
        {isLoading ? (
          <p className="text-center text-body-sm text-ink-400 py-8">Buscando horarios…</p>
        ) : isError ? (
          <p className="text-center text-body-sm text-red-600 py-8">No pudimos cargar la disponibilidad.</p>
        ) : slots.length === 0 ? (
          <p className="text-center text-body-sm text-ink-400 py-8">
            Sin horarios libres {relativeDayLabel(date).toLowerCase()}.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 px-4 pb-8">
            {slots.map((s) => {
              const isSel = sel === s.startTime
              return (
                <button
                  key={s.startTime}
                  type="button"
                  onClick={() => setSel(s.startTime)}
                  className="py-3 rounded-md border-[1.5px] text-center font-mono font-bold text-[13px] transition-all"
                  style={{
                    borderColor: isSel ? 'var(--action-primary)' : 'var(--state-available-bd)',
                    background: isSel ? 'var(--action-primary)' : 'var(--state-available-bg)',
                    color: isSel ? 'white' : 'var(--state-available-fg)',
                    boxShadow: isSel ? 'var(--shadow-brand)' : 'none',
                  }}
                  data-testid={`pub-slot-${s.startTime}`}
                >
                  {s.startTime}
                </button>
              )
            })}
          </div>
        )}
      </div>
      <div
        className="flex-none px-4 pb-5 pt-3 bg-white border-t border-ink-100"
        style={{ boxShadow: '0 -4px 16px -10px rgba(19,26,31,.2)' }}
      >
        <p className="text-center text-caption text-ink-500 mb-2">
          {sel ? `${court.name} · ${sel} hs` : 'Elegí un turno libre'}
        </p>
        <Button
          full
          size="lg"
          disabled={!sel}
          onClick={() => {
            const slot = slots.find((s) => s.startTime === sel)
            if (slot) onPick(date, slot.startTime, slot.endTime)
          }}
        >
          Continuar
        </Button>
      </div>
    </>
  )
}
