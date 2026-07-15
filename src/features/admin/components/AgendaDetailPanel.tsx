import { X, MapPin, Calendar, Clock, Timer, Banknote, Info, MessageCircle } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { hFmt, durationLabel, initials, STATUS_META, type AgendaBooking, type AgendaCourt } from './agendaTypes'

interface InfoRowProps {
  icon: typeof MapPin
  label: string
  value: string
  mono?: boolean
}

function InfoRow({ icon: Icon, label, value, mono }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2.5 mb-2.5">
      <Icon size={14} className="text-ink-400 flex-none mt-0.5" aria-hidden />
      <div>
        <p className="text-[11px] text-ink-400 mb-0.5">{label}</p>
        <p className="text-[13px] font-semibold text-ink-700" style={{ fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value}</p>
      </div>
    </div>
  )
}

interface AgendaDetailPanelProps {
  booking: AgendaBooking
  court: AgendaCourt
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
}

export function AgendaDetailPanel({ booking, court, onClose, onConfirm, onCancel }: AgendaDetailPanelProps) {
  const status = STATUS_META[booking.st]
  const isBlocked = booking.st === 'blocked'

  return (
    <div className="w-[284px] flex-none h-full bg-white border-l border-ink-100 flex flex-col overflow-y-auto">
      <div className="px-4 pt-3.5 pb-3 border-b border-ink-100">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wide">Detalle de reserva</span>
          <button type="button" onClick={onClose} aria-label="Cerrar panel" className="border-none bg-transparent cursor-pointer text-ink-400 p-0.5 flex">
            <X size={15} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-[42px] h-[42px] rounded-lg flex-none flex items-center justify-center text-white text-[15px] font-bold font-display"
            style={{ background: isBlocked ? 'var(--ink-200)' : court.color }}
          >
            {initials(booking.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-ink-900 font-display truncate">{booking.name}</p>
            {booking.ph && <p className="text-[12px] text-ink-500 mt-0.5">{booking.ph}</p>}
            {!booking.ph && booking.note && <p className="text-[12px] text-ink-500 mt-0.5 italic">{booking.note}</p>}
          </div>
        </div>
      </div>

      <div className="px-4 py-3.5 flex-1">
        <InfoRow icon={MapPin} label="Cancha" value={`${court.name} · ${court.sport}`} />
        <InfoRow icon={Calendar} label="Fecha" value="Lunes 24 de junio, 2026" />
        <InfoRow icon={Clock} label="Horario" value={`${hFmt(booking.s)} – ${hFmt(booking.e)}`} mono />
        <InfoRow icon={Timer} label="Duración" value={durationLabel(booking.s, booking.e)} />
        {booking.p && <InfoRow icon={Banknote} label="Importe" value={booking.p} mono />}
        {booking.note && booking.ph && <InfoRow icon={Info} label="Nota" value={booking.note} />}

        <div className="mt-3.5 px-3 py-2.5 bg-ink-50 rounded-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-none" style={{ background: status.fg }} />
          <span className="text-[13px] font-semibold" style={{ color: status.fg }}>{status.label}</span>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-ink-100 flex flex-col gap-2">
        {booking.st === 'pending' && (
          <Button full onClick={onConfirm} data-testid="agenda-confirm-booking">Confirmar reserva</Button>
        )}
        {!isBlocked && (
          <Button variant="outline" full onClick={onCancel} data-testid="agenda-cancel-booking">Cancelar reserva</Button>
        )}
        {isBlocked && (
          <Button variant="outline" full>Editar bloqueo</Button>
        )}
        {booking.ph && (
          <Button variant="ghost" full leftIcon={<MessageCircle size={15} aria-hidden />}>
            Contactar jugador
          </Button>
        )}
      </div>
    </div>
  )
}
