import { Input } from '@/shared/components/Input'
import { PhoneInput } from '@/shared/components/PhoneInput'
import { SegmentedControl } from '@/shared/components/SegmentedControl'
import { HOUR_END, hFmt, type AgendaCourt } from './agendaTypes'

export type BookingModalType = 'booking' | 'fixed' | 'block'

const TYPE_LABELS: Record<BookingModalType, string> = {
  booking: 'Reserva',
  fixed: 'Turno fijo',
  block: 'Bloqueo',
}

interface NewBookingModalStep2Props {
  type: BookingModalType
  setType: (v: BookingModalType) => void
  name: string
  setName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  email: string
  setEmail: (v: string) => void
  note: string
  setNote: (v: string) => void
  reason: string
  setReason: (v: string) => void
  endDate: string
  setEndDate: (v: string) => void
  dayLabel: string
  court: AgendaCourt | undefined
  startH: number | null
  endH: number | null
  setEndH: (h: number) => void
  priceStr: string | null
  slotHours: number
}

export function NewBookingModalStep2({
  type, setType, name, setName, phone, setPhone, email, setEmail, note, setNote,
  reason, setReason, endDate, setEndDate, dayLabel,
  court, startH, endH, setEndH, priceStr, slotHours,
}: NewBookingModalStep2Props) {
  const endOptions = startH != null
    ? Array.from({ length: HOUR_END - startH }, (_, i) => startH + 1 + i)
    : []
  // A booking always spans exactly court.slotDuration from startH — the end time
  // picked in step 1 is only meaningful for type === 'block', never for a real booking.
  const bookingEndH = startH != null ? startH + slotHours : null

  return (
    <div>
      <div className="px-3.5 py-3 rounded-md bg-ink-50 border border-ink-100 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {court && <span className="w-2 h-2 rounded-full flex-none" style={{ background: court.color }} />}
            <span className="font-bold text-[14px] text-ink-900 font-display">{court?.name} · {court?.sport}</span>
          </div>
          {type === 'block' ? (
            <div className="flex items-center gap-1 font-mono font-bold text-[13px] text-ink-900">
              <span>{startH != null ? `${String(startH).padStart(2, '0')}:00` : '--:--'}</span>
              <span className="text-ink-400">–</span>
              <select
                aria-label="Hora de finalización del bloqueo"
                value={endH ?? ''}
                onChange={(e) => setEndH(Number(e.target.value))}
                className="font-mono font-bold text-[13px] text-ink-900 bg-white border border-ink-200 rounded px-1.5 py-0.5 outline-none cursor-pointer"
              >
                {endOptions.map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          ) : (
            <span className="font-mono font-bold text-[13px] text-ink-900">
              {startH != null ? `${hFmt(startH)} – ${bookingEndH != null ? hFmt(bookingEndH) : '--:--'}` : ''}
            </span>
          )}
        </div>
        {type !== 'block' && priceStr && (
          <p className="text-[12px] text-ink-500 mt-1 text-right">
            {priceStr}{type === 'fixed' ? ' por turno' : ''}
          </p>
        )}
      </div>

      <div className="mb-4">
        <p className="text-[12px] font-bold uppercase tracking-wide text-ink-400 mb-2">Tipo</p>
        <SegmentedControl
          full
          options={Object.values(TYPE_LABELS)}
          value={TYPE_LABELS[type]}
          onChange={(v) => {
            const entry = Object.entries(TYPE_LABELS).find(([, label]) => label === v)
            if (entry) setType(entry[0] as BookingModalType)
          }}
        />
      </div>

      {type !== 'block' ? (
        <>
          {type === 'fixed' && (
            <div className="px-3.5 py-3 rounded-md bg-green-50 border border-green-200 mb-4">
              <p className="text-[13px] font-bold text-ink-900">Se repite todos los {dayLabel}</p>
              <p className="text-[12px] text-ink-600 mt-0.5">
                Se reservan las próximas 12 semanas y después se extiende solo.
              </p>
            </div>
          )}
          <p className="text-[12px] font-bold uppercase tracking-wide text-ink-400 mb-2.5">Datos del jugador</p>
          <div className="flex flex-col gap-3.5">
            <Input label="Nombre completo" placeholder="Ej: Martín Gómez" value={name} onChange={(e) => setName(e.target.value)} required />
            <PhoneInput label="Teléfono" value={phone} onChange={setPhone} required />
            {type === 'fixed' && (
              <>
                <Input
                  label="Email (opcional)"
                  type="email"
                  placeholder="Para mandarle el detalle del turno fijo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Hasta (opcional)"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </>
            )}
            <Input label="Nota (opcional)" placeholder="Pago por transferencia, etc." value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </>
      ) : (
        <>
          <p className="text-[12px] font-bold uppercase tracking-wide text-ink-400 mb-2.5">Motivo del bloqueo</p>
          <textarea
            aria-label="Motivo del bloqueo"
            rows={3}
            placeholder="Ej: Mantenimiento del piso, torneo, uso propio…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-3 rounded-md font-body text-body-sm text-ink-900 bg-white border border-ink-200 outline-none transition-colors duration-[120ms] placeholder:text-ink-400 focus:border-green-500 focus:ring-2 focus:ring-[rgba(31,194,116,0.2)] resize-none"
          />
        </>
      )}
    </div>
  )
}
