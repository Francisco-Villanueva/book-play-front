import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { NewBookingModalStep1 } from './NewBookingModalStep1'
import { NewBookingModalStep2, type BookingModalType } from './NewBookingModalStep2'
import { useCreateBooking } from '@/features/bookings/hooks/useBookings'
import { useCreateExceptionRule } from '@/features/exception-rules/hooks/useExceptionRules'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatLongDateEs, todayISO } from '@/shared/utils/date'
import { isValidArgentinePhone } from '@/shared/utils/phone'
import { hFmt, type AgendaCourt, type BookingPrefill } from './agendaTypes'

interface NewBookingModalProps {
  businessId: string
  date: string
  courts: AgendaCourt[]
  courtPrices: Record<string, number>
  prefill?: BookingPrefill
  onClose: () => void
  onSaved: () => void
}

export function NewBookingModal({ businessId, date: initialDate, courts, courtPrices, prefill, onClose, onSaved }: NewBookingModalProps) {
  const hasPrefill = prefill?.cid != null && prefill?.startH != null

  const [date, setDate] = useState(initialDate)
  const dateLabel = formatLongDateEs(date)
  const [step, setStep] = useState(hasPrefill ? 2 : 1)
  const [cid, setCid] = useState<string | null>(prefill?.cid ?? null)
  const [startH, setStartH] = useState<number | null>(prefill?.startH ?? null)
  const [endH, setEndH] = useState<number | null>(prefill?.startH != null ? prefill.startH + 1 : null)
  const [type, setType] = useState<BookingModalType>('booking')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('')
  const createBooking = useCreateBooking(businessId)
  const createException = useCreateExceptionRule(businessId)
  const mutation = type === 'booking' ? createBooking : createException

  const court = courts.find((c) => c.id === cid)
  const dur = startH != null && endH != null && endH > startH ? endH - startH : 0
  const rawPrice = cid && dur > 0 ? (courtPrices[cid] ?? 0) * dur : null
  const priceStr = rawPrice ? `$${rawPrice.toLocaleString('es-AR')}` : null

  const step1Ok = cid != null && startH != null && endH != null && endH > startH
  const step2Ok = type === 'booking'
    ? name.trim().length >= 2 && isValidArgentinePhone(phone)
    : startH != null && endH != null && endH > startH

  const handleSave = () => {
    if (cid == null || startH == null || endH == null) return
    if (type === 'block') {
      createException.mutate(
        {
          date,
          startTime: hFmt(startH),
          endTime: hFmt(endH),
          isAvailable: false,
          ...(reason.trim() ? { reason: reason.trim() } : {}),
          courtIds: [cid],
        },
        { onSuccess: onSaved },
      )
      return
    }
    createBooking.mutate(
      {
        courtId: cid,
        date,
        startTime: hFmt(startH),
        guestName: name,
        guestPhone: phone,
        ...(note ? { notes: note } : {}),
      },
      { onSuccess: onSaved },
    )
  }

  return (
    <div
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(13,20,25,0.48)', backdropFilter: 'blur(3px)' }}
    >
      <div className="w-[560px] max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex-none px-[22px] pt-5 pb-4 border-b border-ink-100">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400 mb-0.5">Paso {step} de 2</p>
              <h2 className="font-display font-bold text-[22px] tracking-tight text-ink-900">
                {step === 1 ? 'Seleccionar turno' : 'Datos del turno'}
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
          <div className="flex gap-1.5">
            {[1, 2].map((i) => (
              <div key={i} className="flex-1 h-[3px] rounded" style={{ background: i <= step ? 'var(--action-primary)' : 'var(--border-default)' }} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-[22px] py-5">
          {step === 1 ? (
            <NewBookingModalStep1
              courts={courts}
              courtPrices={courtPrices}
              date={date}
              setDate={setDate}
              dateLabel={dateLabel}
              minDate={todayISO()}
              cid={cid}
              setCid={setCid}
              startH={startH}
              setStartH={setStartH}
              endH={endH}
              setEndH={setEndH}
            />
          ) : (
            <NewBookingModalStep2
              type={type} setType={setType}
              name={name} setName={setName}
              phone={phone} setPhone={setPhone}
              note={note} setNote={setNote}
              reason={reason} setReason={setReason}
              court={court} startH={startH} endH={endH} setEndH={setEndH} priceStr={priceStr}
            />
          )}
          {mutation.isError && (
            <p className="text-body-sm text-red-600 mt-3">{getApiErrorMessage(mutation.error)}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none px-[22px] pt-3.5 pb-4 border-t border-ink-100 flex justify-between items-center bg-white">
          <Button variant="ghost" onClick={() => (step === 2 && !hasPrefill ? setStep(1) : onClose())}>
            {step === 2 && !hasPrefill ? '← Atrás' : 'Cancelar'}
          </Button>
          {step === 1 ? (
            <Button disabled={!step1Ok} onClick={() => setStep(2)} data-testid="new-booking-continue">Continuar →</Button>
          ) : (
            <Button disabled={!step2Ok || mutation.isPending} onClick={handleSave} data-testid="new-booking-confirm">
              {mutation.isPending ? 'Guardando…' : type === 'block' ? 'Confirmar bloqueo' : 'Confirmar reserva'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
