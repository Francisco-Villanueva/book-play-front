import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { Sheet } from './Sheet'
import { PhoneInput } from '@/shared/components/PhoneInput'
import { useAvailability, useBookingsPage, useCreateBooking } from '@/features/bookings/hooks/useBookings'
import {
  useCreateRecurring,
  usePreviewRecurring,
} from '@/features/recurring-bookings/hooks/useRecurringBookings'
import { RecurringPreviewPanel } from '../RecurringPreviewPanel'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { isValidArgentinePhone } from '@/shared/utils/phone'
import {
  dayOfWeek,
  formatMoneyARS,
  shortDateLabel,
  timeToHours,
  todayISO,
  weekdayNameEs,
} from '@/shared/utils/date'
import { hFmt, type AgendaCourt } from '../agendaTypes'
import { initials } from '../reservationTypes'
import type { RecurringPreview } from '@/shared/types/domain'

export interface NewBookingPrefill {
  courtId?: string | undefined
  startTime?: string | undefined
}

interface MobileNewBookingSheetProps {
  businessId: string
  date: string
  courts: AgendaCourt[]
  courtPrices: Record<string, number>
  courtDurations: Record<string, number>
  prefill: NewBookingPrefill
  onDateChange: (date: string) => void
  onClose: () => void
  onSaved: (guestName: string) => void
}

const chipClass = (on: boolean) =>
  cn(
    'rounded-md border-[1.5px] cursor-pointer font-body text-caption',
    on ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-ink-200 bg-white text-ink-700 font-semibold',
  )

export function MobileNewBookingSheet({
  businessId, date, courts, courtPrices, courtDurations, prefill,
  onDateChange, onClose, onSaved,
}: MobileNewBookingSheetProps) {
  const startedComplete = prefill.courtId != null && prefill.startTime != null
  const [step, setStep] = useState(startedComplete ? 2 : 1)
  const [courtId, setCourtId] = useState<string | null>(prefill.courtId ?? null)
  const [startTime, setStartTime] = useState<string | null>(prefill.startTime ?? null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [nameFocused, setNameFocused] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [email, setEmail] = useState('')
  const [preview, setPreview] = useState<RecurringPreview | null>(null)

  const createBooking = useCreateBooking(businessId)
  const previewRecurring = usePreviewRecurring(businessId)
  const createRecurring = useCreateRecurring(businessId)
  const { data: availability, isLoading: slotsLoading } = useAvailability(
    businessId,
    courtId ?? undefined,
    date,
  )

  const court = courts.find((c) => c.id === courtId) ?? null
  const price = courtId ? courtPrices[courtId] ?? 0 : 0
  const durationHours = (courtId ? courtDurations[courtId] ?? 60 : 60) / 60
  const endLabel = startTime ? hFmt(timeToHours(startTime) + durationHours) : null

  // El hueco precargado puede haber quedado ocupado entre que se pintó la agenda
  // y que se abrió la hoja; el servidor lo rechaza igual, pero avisamos antes.
  const slots = availability?.availableSlots ?? []
  const prefillStale =
    startedComplete && !slotsLoading && slots.length > 0 && !slots.some((s) => s.startTime === startTime)

  const suggestions = useClientSuggestions(businessId, name)

  const step1Ok = courtId != null && startTime != null
  const step2Ok = name.trim().length >= 2 && isValidArgentinePhone(phone)

  // El turno fijo no se guarda derecho: primero muestra qué fechas agarra y
  // cuáles quedan afuera, y recién ahí se confirma.
  const handleStep2 = () => {
    if (!courtId || !startTime) return
    if (isFixed) {
      previewRecurring.mutate(
        { courtId, startDate: date, startTime },
        { onSuccess: (data) => { setPreview(data); setStep(3) } },
      )
      return
    }
    createBooking.mutate(
      {
        courtId,
        date,
        startTime,
        guestName: name.trim(),
        guestPhone: phone,
        ...(note.trim() ? { notes: note.trim() } : {}),
      },
      { onSuccess: () => onSaved(name.trim()) },
    )
  }

  const handleConfirmFixed = () => {
    if (!courtId || !startTime) return
    createRecurring.mutate(
      {
        courtId,
        startDate: date,
        startTime,
        guestName: name.trim(),
        guestPhone: phone,
        ...(email.trim() ? { guestEmail: email.trim() } : {}),
        ...(note.trim() ? { notes: note.trim() } : {}),
      },
      { onSuccess: () => onSaved(name.trim()) },
    )
  }

  const totalSteps = isFixed ? 3 : 2
  const activeMutation =
    step === 3 ? createRecurring : isFixed ? previewRecurring : createBooking

  const stepCta = () => {
    if (step === 1) return { label: 'Continuar', disabled: !step1Ok, onClick: () => setStep(2) }
    if (step === 2) {
      return {
        label: activeMutation.isPending
          ? (isFixed ? 'Revisando…' : 'Guardando…')
          : (isFixed ? 'Continuar' : 'Confirmar reserva'),
        disabled: !step2Ok || activeMutation.isPending,
        onClick: handleStep2,
      }
    }
    return {
      label: createRecurring.isPending ? 'Guardando…' : 'Confirmar turno fijo',
      disabled: createRecurring.isPending,
      onClick: handleConfirmFixed,
    }
  }

  return (
    <SheetShell
      step={step}
      totalSteps={totalSteps}
      onClose={onClose}
      onBack={() => {
        if (step === 3) return setStep(2)
        if (step === 2 && !startedComplete) return setStep(1)
        onClose()
      }}
      backLabel={step > 1 && !(step === 2 && startedComplete) ? '‹ Atrás' : 'Cancelar'}
      cta={stepCta()}
    >
      {step === 3 && preview ? (
        <RecurringPreviewPanel preview={preview} />
      ) : step === 1 ? (
        <div>
          <p className="text-overline text-ink-400 mb-2.5">Fecha</p>
          <input
            type="date"
            value={date}
            min={todayISO()}
            onChange={(e) => {
              onDateChange(e.target.value)
              setStartTime(null)
            }}
            aria-label="Fecha de la reserva"
            className="w-full h-[50px] px-3.5 mb-[18px] rounded-md border-[1.5px] border-ink-200 bg-white font-body text-[16px] text-ink-900 outline-none focus:border-green-500"
          />

          <p className="text-overline text-ink-400 mb-2.5">Cancha</p>
          <div className="grid grid-cols-2 gap-2 mb-[18px]">
            {courts.map((c) => {
              const on = courtId === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setCourtId(c.id)
                    setStartTime(null)
                  }}
                  className={cn(chipClass(on), 'px-3 py-2.5 text-left')}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-none" style={{ background: c.color }} />
                    <span className="font-bold text-[14px] truncate">{c.name}</span>
                  </span>
                  <span className="tnum font-mono text-[11.5px] block mt-0.5 pl-3.5 opacity-80">
                    {formatMoneyARS(courtPrices[c.id] ?? 0)} · {courtDurations[c.id] ?? 60}′
                  </span>
                </button>
              )
            })}
          </div>

          <p className="text-overline text-ink-400 mb-2.5">Horario disponible</p>
          {!courtId ? (
            <p className="py-4 text-center text-caption text-ink-400">Elegí una cancha primero.</p>
          ) : slotsLoading ? (
            <p className="py-4 text-center text-caption text-ink-400">Buscando horarios…</p>
          ) : slots.length === 0 ? (
            <p className="py-4 text-center text-caption text-ink-500">
              No quedan horarios libres en esta cancha para el día elegido.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.startTime}
                  type="button"
                  aria-pressed={startTime === slot.startTime}
                  onClick={() => setStartTime(slot.startTime)}
                  className={cn(chipClass(startTime === slot.startTime), 'tnum font-mono py-2.5 text-center')}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {court && (
            <div className="px-3.5 py-3 bg-green-50 rounded-md mb-[18px]">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: court.color }} />
                <span className="font-bold text-body-sm text-green-800">
                  {court.name} · {court.sport}
                </span>
              </div>
              <div className="tnum font-mono text-green-700 flex justify-between items-baseline gap-2 pl-[18px]">
                <span className="text-caption font-semibold truncate">
                  {shortDateLabel(date)} · {startTime}–{endLabel}
                </span>
                <span className="text-[16px] font-bold flex-none">{formatMoneyARS(price)}</span>
              </div>
            </div>
          )}

          {prefillStale && (
            <p className="mb-4 px-3.5 py-2.5 rounded-md bg-amber-50 border border-amber-100 text-caption text-amber-700">
              Ese horario dejó de estar disponible. Volvé atrás y elegí otro.
            </p>
          )}

          <button
            type="button"
            role="switch"
            aria-checked={isFixed}
            onClick={() => setIsFixed((v) => !v)}
            data-testid="mobile-booking-fixed-toggle"
            className={cn(
              'w-full flex items-center justify-between gap-3 px-3.5 py-3 mb-4 rounded-md border-[1.5px] text-left cursor-pointer',
              isFixed ? 'border-green-500 bg-green-50' : 'border-ink-200 bg-white',
            )}
          >
            <span className="min-w-0">
              <span className="block font-bold text-[14px] text-ink-900">Turno fijo</span>
              <span className="block text-[12px] text-ink-500 mt-0.5">
                {isFixed
                  ? `Se repite todos los ${weekdayNameEs(dayOfWeek(date))}`
                  : 'Reservar este horario todas las semanas'}
              </span>
            </span>
            <span
              className={cn(
                'flex-none w-[42px] h-[24px] rounded-full transition-colors relative',
                isFixed ? 'bg-green-500' : 'bg-ink-200',
              )}
            >
              <span
                className={cn(
                  'absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all',
                  isFixed ? 'left-[21px]' : 'left-[3px]',
                )}
              />
            </span>
          </button>

          <div className="relative mb-4">
            <label htmlFor="mobile-booking-name" className="block text-[12.5px] font-bold text-ink-700 mb-1.5">
              Nombre
            </label>
            <input
              id="mobile-booking-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => window.setTimeout(() => setNameFocused(false), 150)}
              placeholder="Ej: Martín Gómez"
              autoComplete="off"
              className="w-full h-[50px] px-3.5 rounded-md border-[1.5px] border-ink-200 bg-white font-body text-[16px] text-ink-900 outline-none focus:border-green-500"
            />
            {nameFocused && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-[78px] z-10 bg-white border border-ink-100 rounded-md shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <li key={s.phone}>
                    <button
                      type="button"
                      onMouseDown={() => {
                        setName(s.name)
                        setPhone(s.phone)
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 border-none bg-transparent cursor-pointer text-left border-b border-ink-100 last:border-b-0"
                    >
                      <span className="w-[30px] h-[30px] flex-none rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[11px] font-bold">
                        {initials(s.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold text-[14px] text-ink-900 truncate">{s.name}</span>
                        <span className="block tnum font-mono text-[12px] text-ink-500">{s.phone}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <PhoneInput label="Teléfono" value={phone} onChange={setPhone} size="lg" required />
          </div>

          {isFixed && (
            <div className="mb-4">
              <label htmlFor="mobile-booking-email" className="block text-[12.5px] font-bold text-ink-700 mb-1.5">
                Email <span className="font-medium text-ink-400">(opcional)</span>
              </label>
              <input
                id="mobile-booking-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Para mandarle el detalle del turno fijo"
                className="w-full h-[50px] px-3.5 rounded-md border-[1.5px] border-ink-200 bg-white font-body text-[16px] text-ink-900 outline-none focus:border-green-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="mobile-booking-note" className="block text-[12.5px] font-bold text-ink-700 mb-1.5">
              Nota <span className="font-medium text-ink-400">(opcional)</span>
            </label>
            <input
              id="mobile-booking-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Seña, pago por transferencia…"
              className="w-full h-[50px] px-3.5 rounded-md border-[1.5px] border-ink-200 bg-white font-body text-[16px] text-ink-900 outline-none focus:border-green-500"
            />
          </div>

        </div>
      )}
      {activeMutation.isError && (
        <p className="mt-3 text-body-sm text-red-600">{getApiErrorMessage(activeMutation.error)}</p>
      )}
    </SheetShell>
  )
}

interface ClientSuggestion {
  name: string
  phone: string
}

// Autocompleta contra las reservas ya cargadas: en el mostrador, retipear un
// teléfono es el paso más lento del alta.
function useClientSuggestions(businessId: string, name: string): ClientSuggestion[] {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const trimmed = name.trim()
    const id = window.setTimeout(() => setQuery(trimmed.length >= 3 ? trimmed : ''), 300)
    return () => window.clearTimeout(id)
  }, [name])

  const { data } = useBookingsPage(query ? businessId : undefined, { q: query, limit: 20, sort: 'desc' })

  return useMemo(() => {
    const seen = new Map<string, ClientSuggestion>()
    for (const b of data?.data ?? []) {
      const phone = b.guestPhone ?? ''
      const guest = b.guestName ?? b.user?.name ?? ''
      if (!phone || !guest || seen.has(phone)) continue
      seen.set(phone, { name: guest, phone })
      if (seen.size === 3) break
    }
    return [...seen.values()]
  }, [data])
}

interface SheetShellProps {
  step: number
  totalSteps: number
  children: ReactNode
  onClose: () => void
  onBack: () => void
  backLabel: string
  cta: { label: string; disabled: boolean; onClick: () => void }
}

const SHEET_TITLES = ['Nueva reserva', 'Datos del turno', 'Confirmar turno fijo']

function SheetShell({ step, totalSteps, children, onClose, onBack, backLabel, cta }: SheetShellProps) {
  return (
    <Sheet
      onClose={onClose}
      snap="full"
      title={SHEET_TITLES[step - 1] ?? 'Nueva reserva'}
      subtitle={`Paso ${step} de ${totalSteps}`}
      footer={
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="flex-none h-[50px] px-4 rounded-md border-[1.5px] border-ink-200 bg-white cursor-pointer font-body font-bold text-body-sm text-ink-700"
          >
            {backLabel}
          </button>
          <button
            type="button"
            disabled={cta.disabled}
            onClick={cta.onClick}
            data-testid="mobile-booking-cta"
            className="flex-1 h-[50px] rounded-md border-none bg-green-500 text-white shadow-brand font-body font-bold text-[15.5px] cursor-pointer disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {cta.label}
          </button>
        </div>
      }
    >
      <div className="flex gap-1.5 mb-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((i) => (
          <div
            key={i}
            className={cn('flex-1 h-[3px] rounded', i <= step ? 'bg-green-500' : 'bg-ink-200')}
          />
        ))}
      </div>
      {children}
    </Sheet>
  )
}
