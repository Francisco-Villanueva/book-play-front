import { X, MapPin, Calendar, Clock, Timer, Phone, Banknote, MessageCircle } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import type { Reservation } from './reservationTypes'
import { STATUS_META, hFmt, durationLabel, priceLabel, initials } from './reservationTypes'

interface ReservationDetailPanelProps {
  reservation: Reservation
  courtColor: string
  onClose: () => void
  onCancel: () => void
}

export function ReservationDetailPanel({ reservation, courtColor, onClose, onCancel }: ReservationDetailPanelProps) {
  const status = STATUS_META[reservation.status]
  const rows = [
    { icon: MapPin, label: 'Cancha', value: `${reservation.court} · ${reservation.sport}` },
    { icon: Calendar, label: 'Fecha', value: `${reservation.dayOfWeek}, ${reservation.dateLabel}` },
    { icon: Clock, label: 'Horario', value: `${hFmt(reservation.start)} – ${hFmt(reservation.end)}`, mono: true },
    { icon: Timer, label: 'Duración', value: durationLabel(reservation.start, reservation.end) },
    { icon: Phone, label: 'Teléfono', value: reservation.phone, mono: true },
    { icon: Banknote, label: 'Importe', value: priceLabel(reservation.price), mono: true },
  ]

  return (
    <div className="w-[280px] flex-none h-full flex flex-col bg-white border-l border-ink-100">
      <div className="flex-none px-4 pt-3.5 pb-3 border-b border-ink-100">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wide">Reserva</span>
          <button type="button" onClick={onClose} aria-label="Cerrar panel" className="border-none bg-transparent cursor-pointer text-ink-400 p-0.5 flex">
            <X size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-lg flex-none flex items-center justify-center text-white text-[14px] font-bold font-display"
            style={{ background: courtColor }}
          >
            {initials(reservation.playerName)}
          </div>
          <div>
            <p className="font-bold text-[15px] text-ink-900 font-display">{reservation.playerName}</p>
            <span
              className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold border"
              style={{ background: status.bg, borderColor: status.bd, color: status.fg }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: status.fg }} />
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-2.5 mb-2.5">
            <r.icon size={14} className="text-ink-400 flex-none mt-0.5" aria-hidden />
            <div>
              <p className="text-[10px] text-ink-400 mb-0.5">{r.label}</p>
              <p className="text-[13px] font-semibold text-ink-700" style={{ fontFamily: r.mono ? 'var(--font-mono)' : undefined }}>{r.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-none px-4 py-3 border-t border-ink-100 flex flex-col gap-1.5">
        {reservation.status !== 'cancelled' && (
          <Button variant="outline" full onClick={onCancel} data-testid="reservation-cancel">Cancelar reserva</Button>
        )}
        {reservation.phone && (
          <Button variant="ghost" full leftIcon={<MessageCircle size={15} aria-hidden />}>
            Contactar jugador
          </Button>
        )}
      </div>
    </div>
  )
}
