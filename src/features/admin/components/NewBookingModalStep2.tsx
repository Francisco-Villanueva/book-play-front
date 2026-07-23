import { Input } from '@/shared/components/Input'
import { PhoneInput } from '@/shared/components/PhoneInput'
import { SegmentedControl } from '@/shared/components/SegmentedControl'
import { HOUR_END, type AgendaCourt } from './agendaTypes'

export type BookingModalType = 'booking' | 'block'

interface NewBookingModalStep2Props {
  type: BookingModalType
  setType: (v: BookingModalType) => void
  name: string
  setName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  note: string
  setNote: (v: string) => void
  reason: string
  setReason: (v: string) => void
  court: AgendaCourt | undefined
  startH: number | null
  endH: number | null
  setEndH: (h: number) => void
  priceStr: string | null
}

export function NewBookingModalStep2({
  type, setType, name, setName, phone, setPhone, note, setNote, reason, setReason,
  court, startH, endH, setEndH, priceStr,
}: NewBookingModalStep2Props) {
  const endOptions = startH != null
    ? Array.from({ length: HOUR_END - startH }, (_, i) => startH + 1 + i)
    : []

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
              {startH != null ? `${String(startH).padStart(2, '0')}:00 – ${String(endH).padStart(2, '0')}:00` : ''}
            </span>
          )}
        </div>
        {type === 'booking' && priceStr && <p className="text-[12px] text-ink-500 mt-1 text-right">{priceStr}</p>}
      </div>

      <div className="mb-4">
        <p className="text-[12px] font-bold uppercase tracking-wide text-ink-400 mb-2">Tipo</p>
        <SegmentedControl
          full
          options={['Reserva', 'Bloqueo']}
          value={type === 'booking' ? 'Reserva' : 'Bloqueo'}
          onChange={(v) => setType(v === 'Reserva' ? 'booking' : 'block')}
        />
      </div>

      {type === 'booking' ? (
        <>
          <p className="text-[12px] font-bold uppercase tracking-wide text-ink-400 mb-2.5">Datos del jugador</p>
          <div className="flex flex-col gap-3.5">
            <Input label="Nombre completo" placeholder="Ej: Martín Gómez" value={name} onChange={(e) => setName(e.target.value)} required />
            <PhoneInput label="Teléfono" value={phone} onChange={setPhone} required />
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
