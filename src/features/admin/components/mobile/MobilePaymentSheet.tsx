import { useState } from 'react'
import { Check, Minus, Plus } from 'lucide-react'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatMoneyARS } from '@/shared/utils/date'
import { useUpdateBookingPayment } from '@/features/bookings/hooks/useBookings'
import { defaultPlayerCount, derivePaymentStatus, PAYMENT_META } from '../reservationTypes'
import type { AgendaCourt } from '../agendaTypes'
import { Sheet } from './Sheet'
import type { MobileBooking } from './mobileTypes'

const MAX_PLAYERS = 30

interface MobilePaymentSheetProps {
  businessId: string
  booking: MobileBooking
  court: AgendaCourt | undefined
  onClose: () => void
  onSaved: (amount: number) => void
}

export function MobilePaymentSheet({ businessId, booking, court, onClose, onSaved }: MobilePaymentSheetProps) {
  const [total, setTotal] = useState(booking.totalPlayers ?? defaultPlayerCount(court?.sport))
  const [rawPaid, setRawPaid] = useState(booking.playersPaid ?? 0)
  const [notes, setNotes] = useState(booking.paymentNotes ?? '')
  const mutation = useUpdateBookingPayment(businessId)

  // Se recorta en el render y no al bajar el total: si no, varios toques seguidos
  // en "−" leen el mismo `total` de la closure y sólo descuentan uno.
  const paid = Math.min(rawPaid, total)
  const price = booking.price ?? 0
  const status = derivePaymentStatus(paid, total)
  const meta = PAYMENT_META[status]
  const perPlayer = total > 0 ? price / total : 0
  const collected = paid >= total ? price : Math.round(perPlayer * paid)

  const handleSave = () => {
    mutation.mutate(
      {
        bookingId: booking.id,
        totalPlayers: total,
        playersPaid: paid,
        ...(notes.trim() ? { paymentNotes: notes.trim() } : {}),
      },
      { onSuccess: () => onSaved(collected) },
    )
  }

  return (
    <Sheet
      onClose={onClose}
      snap="full"
      title="Registrar cobro"
      subtitle={`${booking.name} · ${court?.name ?? 'Cancha'}`}
      footer={
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={handleSave}
          data-testid="mobile-payment-save"
          className="w-full h-[50px] rounded-md border-none bg-green-500 text-white shadow-brand font-body font-bold text-[15.5px] cursor-pointer disabled:opacity-50"
        >
          {mutation.isPending ? 'Guardando…' : 'Guardar cobro'}
        </button>
      }
    >
      <div className="px-4 py-4 bg-green-50 rounded-md text-center mb-[18px]">
        <p className="text-overline text-green-700">Total del turno</p>
        <p className="tnum font-mono font-bold text-[34px] text-green-700 tracking-tight mt-1">
          {formatMoneyARS(price)}
        </p>
      </div>

      <div className="flex items-center justify-between mb-3.5">
        <div>
          <p className="text-caption font-bold text-ink-700">Jugadores</p>
          <p className="text-[11px] text-ink-400">{formatMoneyARS(Math.round(perPlayer))} cada uno</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTotal((t) => Math.max(1, t - 1))}
            disabled={total <= 1}
            aria-label="Quitar un jugador"
            className="w-11 h-11 rounded-md border-[1.5px] border-ink-200 bg-white cursor-pointer flex items-center justify-center disabled:opacity-40"
          >
            <Minus size={16} className="text-ink-700" aria-hidden />
          </button>
          <span className="w-10 text-center font-display font-bold text-[18px] text-ink-900" aria-live="polite">
            {total}
          </span>
          <button
            type="button"
            onClick={() => setTotal((t) => Math.min(MAX_PLAYERS, t + 1))}
            disabled={total >= MAX_PLAYERS}
            aria-label="Agregar un jugador"
            className="w-11 h-11 rounded-md border-[1.5px] border-ink-200 bg-white cursor-pointer flex items-center justify-center disabled:opacity-40"
          >
            <Plus size={16} className="text-ink-700" aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3.5" role="group" aria-label="Jugadores que pagaron">
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
          const on = n <= paid
          return (
            <button
              key={n}
              type="button"
              aria-pressed={on}
              aria-label={`Marcar que pagaron ${n} de ${total}`}
              data-testid={`mobile-payment-player-${n}`}
              onClick={() => setRawPaid((p) => (p === n ? n - 1 : n))}
              className="w-11 h-11 rounded-md border-[1.5px] cursor-pointer flex items-center justify-center font-bold text-[14px]"
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

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setRawPaid(total)}
          data-testid="mobile-payment-all"
          className="flex-1 h-11 rounded-md border-none bg-green-50 text-green-700 font-body font-bold text-caption cursor-pointer"
        >
          Pagaron todos
        </button>
        <button
          type="button"
          onClick={() => setRawPaid(0)}
          disabled={paid === 0}
          className="flex-1 h-11 rounded-md border-[1.5px] border-ink-200 bg-white text-ink-700 font-body font-bold text-caption cursor-pointer disabled:opacity-40"
        >
          Ninguno
        </button>
      </div>

      <div
        className="rounded-md border px-3.5 py-3 flex items-center justify-between mb-4"
        style={{ background: meta.bg, borderColor: meta.bd }}
      >
        <div>
          <p className="text-caption font-bold" style={{ color: meta.fg }}>{meta.label}</p>
          <p className="text-[12px] font-medium opacity-80" style={{ color: meta.fg }}>
            {paid} de {total} jugadores
          </p>
        </div>
        <p className="tnum font-mono font-bold text-body-sm" style={{ color: meta.fg }}>
          {formatMoneyARS(collected)}
        </p>
      </div>

      <label htmlFor="mobile-payment-notes" className="block text-[12.5px] font-bold text-ink-700 mb-1.5">
        Notas <span className="font-medium text-ink-400">(opcional)</span>
      </label>
      <textarea
        id="mobile-payment-notes"
        rows={2}
        value={notes}
        maxLength={500}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ej: los 2 que faltan pagan el sábado"
        className="w-full px-3.5 py-3 rounded-md border-[1.5px] border-ink-200 bg-white font-body text-[16px] text-ink-900 outline-none resize-none placeholder:text-ink-400 focus:border-green-500"
      />

      {mutation.isError && (
        <p className="mt-3 text-body-sm text-red-600">{getApiErrorMessage(mutation.error)}</p>
      )}
    </Sheet>
  )
}
