import { Clock } from 'lucide-react'
import { hFmt, toY, initials, SLOT_H, STATUS_META, type AgendaBooking } from './agendaTypes'

interface AgendaBookingBlockProps {
  booking: AgendaBooking
  courtColor: string
  isSelected: boolean
  onClick: (booking: AgendaBooking) => void
}

export function AgendaBookingBlock({ booking, courtColor, isSelected, onClick }: AgendaBookingBlockProps) {
  const blockH = (booking.e - booking.s) * SLOT_H - 4
  const status = STATUS_META[booking.st]
  const tall = blockH >= 80
  const medium = blockH >= 44 && blockH < 80
  const isBlocked = booking.st === 'blocked'
  const stripes = 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(0,0,0,0.035) 5px, rgba(0,0,0,0.035) 10px)'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(booking)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(booking)}
      className="absolute cursor-pointer overflow-hidden rounded-md transition-shadow"
      data-testid={`agenda-booking-${booking.id}`}
      style={{
        top: toY(booking.s) + 2, left: 3, right: 3, height: blockH,
        background: status.bg,
        backgroundImage: isBlocked ? stripes : undefined,
        border: `1.5px solid ${status.bd}`,
        borderLeft: `3px solid ${isBlocked ? 'var(--ink-300)' : courtColor}`,
        boxShadow: isSelected ? '0 0 0 2.5px var(--focus-ring)' : 'var(--shadow-sm)',
        padding: tall ? '8px 10px' : '3px 8px',
        display: 'flex',
        flexDirection: tall ? 'column' : 'row',
        alignItems: tall ? 'flex-start' : 'center',
        gap: tall ? 2 : 5,
        zIndex: isSelected ? 5 : 2,
      }}
    >
      {tall ? (
        <>
          <div className="flex items-center gap-1.5 w-full">
            <span
              className="w-5 h-5 rounded-full flex-none flex items-center justify-center text-white text-[9px] font-bold"
              style={{ background: isBlocked ? 'var(--ink-300)' : courtColor }}
            >
              {initials(booking.name)}
            </span>
            <span className="text-[12px] font-bold overflow-hidden text-ellipsis whitespace-nowrap flex-1 font-body" style={{ color: status.fg }}>
              {booking.name}
            </span>
          </div>
          <div className="text-[11px] font-mono font-semibold pl-[26px] opacity-80" style={{ color: status.fg }}>
            {hFmt(booking.s)} – {hFmt(booking.e)}
          </div>
          {booking.p && <div className="text-[11px] font-mono pl-[26px]" style={{ color: status.fg }}>{booking.p}</div>}
          {booking.note && (
            <div className="text-[10px] pl-[26px] opacity-60 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: status.fg }}>
              {booking.note}
            </div>
          )}
          {booking.st === 'pending' && (
            <div className="mt-1 ml-[26px] inline-flex items-center gap-1 bg-amber-100 rounded px-1 py-0.5">
              <Clock size={9} className="text-amber-700" aria-hidden />
              <span className="text-[9px] font-bold text-amber-700">Por confirmar</span>
            </div>
          )}
        </>
      ) : medium ? (
        <>
          <span className="text-[11px] font-bold overflow-hidden text-ellipsis whitespace-nowrap flex-1 font-body" style={{ color: status.fg }}>
            {booking.name}
          </span>
          <span className="text-[10px] font-mono opacity-75 flex-none" style={{ color: status.fg }}>{hFmt(booking.s)}</span>
        </>
      ) : (
        <span className="text-[10px] font-bold overflow-hidden text-ellipsis whitespace-nowrap flex-1" style={{ color: status.fg }}>
          {booking.name.split(' ')[0]} · {hFmt(booking.s)}
        </span>
      )}
    </div>
  )
}
