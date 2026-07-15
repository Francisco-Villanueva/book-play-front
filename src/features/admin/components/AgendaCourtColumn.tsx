import { useState, type MouseEvent } from 'react'
import { Plus } from 'lucide-react'
import { AgendaBookingBlock } from './AgendaBookingBlock'
import { HOUR_START, HOUR_END, SLOT_H, TOTAL_H, hFmt, type AgendaBooking, type AgendaCourt, type BookingPrefill } from './agendaTypes'

interface AgendaCourtColumnProps {
  court: AgendaCourt
  bookings: AgendaBooking[]
  selectedId: string | null
  onSelect: (booking: AgendaBooking) => void
  onNewBooking: (prefill: BookingPrefill) => void
}

export function AgendaCourtColumn({ court, bookings, selectedId, onSelect, onNewBooking }: AgendaCourtColumnProps) {
  const [hoverHour, setHoverHour] = useState<number | null>(null)
  const isSlotFree = hoverHour != null && !bookings.some((b) => b.s <= hoverHour && b.e > hoverHour)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const h = Math.floor((e.clientY - rect.top) / SLOT_H) + HOUR_START
    setHoverHour(h >= HOUR_START && h < HOUR_END ? h : null)
  }

  return (
    <div
      className="flex-1 min-w-[108px] relative border-l border-ink-100"
      style={{ height: TOTAL_H }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverHour(null)}
    >
      {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
        <div key={i}>
          <div className="absolute left-0 right-0 h-px bg-ink-100" style={{ top: i * SLOT_H }} />
          <div className="absolute left-0 right-0 h-px bg-ink-100 opacity-45" style={{ top: i * SLOT_H + SLOT_H / 2 }} />
        </div>
      ))}

      {isSlotFree && hoverHour != null && (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onNewBooking({ cid: court.id, startH: hoverHour }) }}
          className="absolute rounded-md flex items-center justify-center cursor-pointer z-[1]"
          style={{
            top: (hoverHour - HOUR_START) * SLOT_H + 2, left: 3, right: 3, height: SLOT_H - 4,
            background: 'var(--green-50)', border: '1.5px dashed var(--green-300)',
          }}
          data-testid={`agenda-slot-${court.id}-${hoverHour}`}
        >
          <div className="flex items-center gap-1 text-green-600">
            <Plus size={13} aria-hidden />
            <span className="text-[11px] font-semibold font-body">Reservar {hFmt(hoverHour)}</span>
          </div>
        </div>
      )}

      {bookings.map((b) => (
        <AgendaBookingBlock key={b.id} booking={b} courtColor={court.color} isSelected={selectedId === b.id} onClick={onSelect} />
      ))}
    </div>
  )
}
