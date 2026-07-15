import { forwardRef } from 'react'
import { AgendaCourtColumn } from './AgendaCourtColumn'
import { HOUR_START, HOUR_END, SLOT_H, TOTAL_H, nowHour, hFmt, toY, type AgendaBooking, type AgendaCourt, type BookingPrefill } from './agendaTypes'

interface AgendaGridProps {
  courts: AgendaCourt[]
  bookings: AgendaBooking[]
  selectedId: string | null
  onSelect: (booking: AgendaBooking) => void
  onNewBooking: (prefill: BookingPrefill) => void
  isToday?: boolean
}

export const AgendaGrid = forwardRef<HTMLDivElement, AgendaGridProps>(function AgendaGrid(
  { courts, bookings, selectedId, onSelect, onNewBooking, isToday = true },
  gridRef,
) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Court header row */}
      <div className="flex-none flex bg-white border-b-2 border-ink-200">
        <div style={{ width: 64 }} className="flex-none" />
        {courts.map((c) => (
          <div key={c.id} className="flex-1 min-w-[108px] px-3.5 py-2.5 border-l border-ink-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-none" style={{ background: c.color }} />
              <span className="font-display font-bold text-[14px] text-ink-900">{c.name}</span>
            </div>
            <p className="text-[11px] text-ink-500 mt-0.5 pl-3.5">{c.sport}</p>
          </div>
        ))}
      </div>

      {/* Scrollable grid */}
      <div ref={gridRef} className="flex-1 overflow-y-auto" style={{ background: 'var(--surface-page)' }}>
        <div className="flex" style={{ height: TOTAL_H + 24, paddingBottom: 24 }}>
          {/* Time ruler */}
          <div className="flex-none relative border-r border-ink-100" style={{ width: 64, height: TOTAL_H }}>
            {Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute right-2 font-mono text-[11px] font-bold text-ink-400 leading-none text-right select-none"
                style={{ top: i * SLOT_H + 5 }}
              >
                {String(HOUR_START + i).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div className="flex-1 relative flex">
            {/* Now line */}
            {isToday && (
              <div className="absolute left-0 right-0 pointer-events-none z-10" style={{ top: toY(nowHour()) }}>
                <div className="h-0.5 bg-green-500 relative">
                  <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-green-500" />
                  <div className="absolute right-2 -top-2.5 bg-green-500 text-white text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-[3px]">
                    {hFmt(nowHour())}
                  </div>
                </div>
              </div>
            )}

            {courts.map((court) => (
              <AgendaCourtColumn
                key={court.id}
                court={court}
                bookings={bookings.filter((b) => b.cid === court.id)}
                selectedId={selectedId}
                onSelect={onSelect}
                onNewBooking={onNewBooking}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})
