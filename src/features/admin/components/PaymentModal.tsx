import { useState } from 'react'
import { Check, Minus, Plus, X } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { useUpdateBookingPayment } from '@/features/bookings/hooks/useBookings'
import { PAYMENT_META, defaultPlayerCount, derivePaymentStatus, hFmt, priceLabel, type Reservation } from './reservationTypes'

interface PaymentModalProps {
  businessId: string
  reservation: Reservation
  onClose: () => void
}

const MAX_PLAYERS = 30

export function PaymentModal({ businessId, reservation, onClose }: PaymentModalProps) {
  const [total, setTotal] = useState(reservation.totalPlayers ?? defaultPlayerCount(reservation.sport))
  const [rawPaid, setPaid] = useState(reservation.playersPaid ?? 0)
  const [notes, setNotes] = useState(reservation.paymentNotes ?? '')
  const mutation = useUpdateBookingPayment(businessId)

  // Se recorta en el render y no al bajar el total: si no, varios clicks seguidos
  // en "−" leen el mismo `total` de la closure y solo descuentan uno.
  const paid = Math.min(rawPaid, total)
  const status = derivePaymentStatus(paid, total)
  const meta = PAYMENT_META[status]
  const perPlayer = total > 0 ? reservation.price / total : 0
  const collected = paid >= total ? reservation.price : Math.round(perPlayer * paid)

  const changeTotal = (delta: number) =>
    setTotal((t) => Math.min(MAX_PLAYERS, Math.max(1, t + delta)))

  // Chips estilo rating: clickear el jugador N marca que pagaron N. Clickear el
  // último pagado lo desmarca, que es el único "deshacer" que hace falta.
  const toggle = (n: number) => setPaid((p) => (p === n ? n - 1 : n))

  const handleSave = () => {
    mutation.mutate(
      {
        bookingId: reservation.id,
        totalPlayers: total,
        playersPaid: paid,
        ...(notes.trim() ? { paymentNotes: notes.trim() } : {}),
      },
      { onSuccess: onClose },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(19,26,31,.45)] p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar cobro"
    >
      <div className="w-full max-w-[460px] max-h-full overflow-y-auto rounded-lg bg-white shadow-lg">
        <div className="px-[22px] pt-5 pb-3.5 border-b border-ink-100">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400 mb-0.5">Cobro</p>
              <h2 className="font-display font-bold text-[22px] tracking-tight text-ink-900">
                {reservation.playerName}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-md border-[1.5px] border-ink-200 bg-ink-50 cursor-pointer flex items-center justify-center"
            >
              <X size={16} className="text-ink-700" />
            </button>
          </div>
          <p className="text-[13px] text-ink-500">
            {reservation.court} · {reservation.dateLabel} {hFmt(reservation.start)} ·{' '}
            <span className="font-semibold text-ink-700">{priceLabel(reservation.price)}</span>
          </p>
        </div>

        <div className="px-[22px] py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption font-bold text-ink-700">Jugadores</p>
              <p className="text-[11px] text-ink-400">{priceLabel(Math.round(perPlayer))} cada uno</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeTotal(-1)}
                disabled={total <= 1}
                aria-label="Quitar un jugador"
                className="w-8 h-8 rounded-md border-[1.5px] border-ink-200 bg-white cursor-pointer flex items-center justify-center disabled:opacity-40"
              >
                <Minus size={15} className="text-ink-700" />
              </button>
              <span className="w-9 text-center font-display font-bold text-[18px] text-ink-900" aria-live="polite">
                {total}
              </span>
              <button
                type="button"
                onClick={() => changeTotal(1)}
                disabled={total >= MAX_PLAYERS}
                aria-label="Agregar un jugador"
                className="w-8 h-8 rounded-md border-[1.5px] border-ink-200 bg-white cursor-pointer flex items-center justify-center disabled:opacity-40"
              >
                <Plus size={15} className="text-ink-700" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Jugadores que pagaron">
            {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
              const on = n <= paid
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggle(n)}
                  aria-pressed={on}
                  aria-label={`Marcar que pagaron ${n} de ${total}`}
                  data-testid={`payment-player-${n}`}
                  className="w-11 h-11 rounded-md border-[1.5px] cursor-pointer flex items-center justify-center font-bold text-[14px] transition-colors"
                  style={{
                    borderColor: on ? 'var(--green-500)' : 'var(--border-default)',
                    background: on ? 'var(--green-500)' : 'white',
                    color: on ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {on ? <Check size={18} aria-hidden /> : n}
                </button>
              )
            })}
          </div>

          <div className="flex gap-2">
            <Button variant="soft" size="sm" onClick={() => setPaid(total)} data-testid="payment-all">
              Pagaron todos
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPaid(0)} disabled={paid === 0}>
              Ninguno
            </Button>
          </div>

          <div
            className="rounded-md border px-3.5 py-3 flex items-center justify-between"
            style={{ background: meta.bg, borderColor: meta.bd }}
          >
            <div>
              <p className="text-[13px] font-bold" style={{ color: meta.fg }}>{meta.label}</p>
              <p className="text-[12px] font-medium" style={{ color: meta.fg, opacity: 0.8 }}>
                {paid} de {total} jugadores
              </p>
            </div>
            <p className="font-mono font-bold text-[15px]" style={{ color: meta.fg }}>
              {priceLabel(collected)}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="payment-notes" className="text-caption font-bold text-ink-700">
              Notas (opcional)
            </label>
            <textarea
              id="payment-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              placeholder="Ej: los 2 que faltan pagan el sábado"
              className="w-full px-3.5 py-3 rounded-md font-body text-body-sm text-ink-900 bg-white border border-ink-200 outline-none resize-none placeholder:text-ink-400 focus:border-green-500"
            />
          </div>

          {mutation.isError && <p className="text-body-sm text-red-600">{getApiErrorMessage(mutation.error)}</p>}
        </div>

        <div className="px-[22px] pt-3.5 pb-4 border-t border-ink-100 flex justify-between items-center">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={mutation.isPending} onClick={handleSave} data-testid="payment-save">
            {mutation.isPending ? 'Guardando…' : 'Guardar cobro'}
          </Button>
        </div>
      </div>
    </div>
  )
}
