import { useRef } from 'react'
import { Plus } from 'lucide-react'
import { hFmt, type AgendaCourt } from '../agendaTypes'
import { bookingAt, cellStateOf, firstName, freeCountAt, shortCourtName, type MobileBooking } from './mobileTypes'

const LONG_PRESS_MS = 480

interface AgendaCellProps {
  court: AgendaCourt
  booking: MobileBooking | null
  hour: number
  onFree: () => void
  onBooked: (booking: MobileBooking) => void
  onBlock: () => void
}

function AgendaCell({ court, booking, hour, onFree, onBooked, onBlock }: AgendaCellProps) {
  const timer = useRef<number | null>(null)
  const fired = useRef(false)
  const state = cellStateOf(booking)

  const startPress = () => {
    if (booking) return
    fired.current = false
    timer.current = window.setTimeout(() => {
      fired.current = true
      onBlock()
    }, LONG_PRESS_MS)
  }
  const endPress = () => {
    if (timer.current != null) window.clearTimeout(timer.current)
  }
  const handleClick = () => {
    if (fired.current) {
      fired.current = false
      return
    }
    if (booking) onBooked(booking)
    else onFree()
  }

  const label = booking
    ? `${court.name} ${hFmt(hour)}, ${state.label}: ${booking.name}`
    : `${court.name} ${hFmt(hour)}, libre. Tocá para reservar`

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      onPointerCancel={endPress}
      className="min-w-0 min-h-[64px] px-1.5 py-1.5 rounded-sm border-[1.5px] cursor-pointer flex flex-col items-start justify-center gap-px text-left overflow-hidden"
      style={{ background: state.bg, borderColor: state.bd }}
    >
      <span
        className="font-mono text-[10px] font-bold opacity-70 tracking-wide"
        style={{ color: state.fg }}
      >
        {shortCourtName(court.name)}
      </span>
      {booking ? (
        <span
          className="w-full text-[12.5px] font-bold leading-tight truncate"
          style={{ color: state.fg }}
        >
          {booking.st === 'blocked' ? booking.name : firstName(booking.name)}
        </span>
      ) : (
        <span className="text-[12.5px] font-bold text-green-600 flex items-center gap-0.5">
          <Plus size={13} strokeWidth={2.6} aria-hidden />
          LIBRE
        </span>
      )}
    </button>
  )
}

interface AgendaHourRowProps {
  hour: number
  courts: AgendaCourt[]
  bookings: MobileBooking[]
  columns: number
  isNow: boolean
  onFree: (courtId: string, hour: number) => void
  onBooked: (booking: MobileBooking) => void
  onBlock: (courtId: string, hour: number) => void
}

export function AgendaHourRow({
  hour, courts, bookings, columns, isNow, onFree, onBooked, onBlock,
}: AgendaHourRowProps) {
  const free = freeCountAt(bookings, courts, hour)

  return (
    <div className="flex gap-2 pb-2">
      <div className="w-[50px] flex-none pt-[3px]">
        <div
          className="tnum font-mono font-bold text-[14px]"
          style={{ color: isNow ? 'var(--green-600)' : 'var(--ink-900)' }}
        >
          {hFmt(hour)}
        </div>
        <div
          className="text-[10.5px] font-semibold mt-0.5 leading-tight"
          style={{ color: free === 0 ? 'var(--text-subtle)' : 'var(--green-600)' }}
        >
          {free === 0 ? 'completo' : `${free} de ${courts.length}`}
        </div>
      </div>

      <div
        className="flex-1 grid gap-1.5 min-w-0"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {courts.map((court) => (
          <AgendaCell
            key={court.id}
            court={court}
            hour={hour}
            booking={bookingAt(bookings, court.id, hour)}
            onFree={() => onFree(court.id, hour)}
            onBooked={onBooked}
            onBlock={() => onBlock(court.id, hour)}
          />
        ))}
      </div>
    </div>
  )
}
