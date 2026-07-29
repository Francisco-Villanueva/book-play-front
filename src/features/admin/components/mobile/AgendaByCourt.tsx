import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { HOUR_END, HOUR_START, hFmt, type AgendaCourt } from '../agendaTypes'
import { bookingAt, cellStateOf, type MobileBooking } from './mobileTypes'

interface AgendaByCourtProps {
  courts: AgendaCourt[]
  bookings: MobileBooking[]
  nowHour: number | null
  onFree: (courtId: string, hour: number) => void
  onBooked: (booking: MobileBooking) => void
}

export function AgendaByCourt({ courts, bookings, nowHour, onFree, onBooked }: AgendaByCourtProps) {
  const [courtId, setCourtId] = useState(courts[0]?.id ?? '')

  // Si cambian las canchas (otro complejo, filtro), la seleccionada puede dejar de existir.
  useEffect(() => {
    if (!courts.some((c) => c.id === courtId)) setCourtId(courts[0]?.id ?? '')
  }, [courts, courtId])

  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
        {courts.map((court) => {
          const on = court.id === courtId
          return (
            <button
              key={court.id}
              type="button"
              aria-pressed={on}
              onClick={() => setCourtId(court.id)}
              className={cn(
                'flex-none flex items-center gap-1.5 px-3.5 py-2 rounded-full border-[1.5px] cursor-pointer',
                on ? 'border-green-500 bg-green-50' : 'border-ink-200 bg-white',
              )}
            >
              <span className="w-2 h-2 rounded-full flex-none" style={{ background: court.color }} />
              <span className={cn('font-bold text-caption', on ? 'text-green-700' : 'text-ink-700')}>
                {court.name}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        {hours.map((hour) => {
          const booking = bookingAt(bookings, courtId, hour)
          const state = cellStateOf(booking)
          const isNow = nowHour != null && Math.floor(nowHour) === hour

          return (
            <button
              key={hour}
              type="button"
              onClick={() => (booking ? onBooked(booking) : onFree(courtId, hour))}
              className={cn(
                'w-full flex items-center gap-3 px-3.5 py-3 rounded-md border-[1.5px] cursor-pointer text-left min-h-[56px]',
                isNow && 'ring-2 ring-green-200',
              )}
              style={{ background: state.bg, borderColor: state.bd }}
            >
              <span
                className="tnum font-mono font-bold text-[14px] w-11 flex-none"
                style={{ color: state.fg }}
              >
                {hFmt(hour)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-body-sm truncate" style={{ color: state.fg }}>
                  {booking ? booking.name : 'Libre'}
                </div>
                {booking?.note && (
                  <div className="text-[12px] opacity-70 truncate" style={{ color: state.fg }}>
                    {booking.note}
                  </div>
                )}
              </div>
              {!booking && <Plus size={17} className="text-green-600 flex-none" aria-hidden />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
