import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Lock, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AvailabilityLegend } from '@/features/bookings/components/AvailabilityLegend'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Badge } from '@/shared/components/Badge'
import { courtsApi } from '@/features/courts/api/courtsApi'
import { courtsKeys } from '@/features/courts/api/courtsKeys'
import { useAvailability, useCreateBooking } from '@/features/bookings/hooks/useBookings'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { addDaysISO, formatShortDay, relativeDayLabel, todayISO } from '@/shared/utils/date'
import type { Court } from '@/shared/types/domain'

const NEXT_DAYS = Array.from({ length: 7 }, (_, i) => addDaysISO(todayISO(), i))

function humanizeSport(s?: string): string {
  if (!s) return 'Cancha'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

type Step = 1 | 2 | 3 | 4

function DateStrip({ selected, onSelect }: { selected: string; onSelect: (iso: string) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto py-2.5 px-4 bg-white" style={{ scrollbarWidth: 'none' }}>
      {NEXT_DAYS.map((iso) => {
        const on = selected === iso
        const { weekday, day } = formatShortDay(iso)
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            className="flex-none w-[52px] py-1.5 rounded-md border-[1.5px] text-center cursor-pointer transition-colors"
            style={{
              borderColor: on ? 'var(--action-primary)' : 'var(--border-default)',
              background: on ? 'var(--action-primary)' : 'transparent',
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide font-body" style={{ color: on ? 'rgba(255,255,255,.75)' : 'var(--text-subtle)' }}>{weekday}</div>
            <div className="text-[17px] font-extrabold font-display tracking-tight" style={{ color: on ? 'white' : 'var(--text-strong)' }}>{day}</div>
          </button>
        )
      })}
    </div>
  )
}

function Step1({ businessId, onPick }: { businessId: string; onPick: (c: Court) => void }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: courts, isLoading, isError } = useQuery({
    queryKey: courtsKeys.all(businessId),
    queryFn: () => courtsApi.listByBusiness(businessId).then((res) => res.data),
  })
  const activeCourts = (courts ?? []).filter((c) => c.isActive)

  return (
    <>
      <div className="flex-none flex items-center gap-2 px-4 pb-3 pt-4 bg-white border-b border-ink-100">
        {user && (
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="border-none bg-transparent cursor-pointer p-1 -ml-1 flex-none"
            aria-label="Volver al buscador"
          >
            <ChevronLeft size={20} className="text-ink-700" />
          </button>
        )}
        <div className="flex items-center gap-1.5 text-ink-500">
          <MapPin size={13} className="flex-none" aria-hidden />
          <span className="text-[12px]">Reservá tu cancha</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-8 flex flex-col gap-2.5">
        {isLoading ? (
          <p className="text-center text-body-sm text-ink-400 py-12">Cargando canchas…</p>
        ) : isError ? (
          <p className="text-center text-body-sm text-red-600 py-12">No pudimos cargar las canchas de este complejo.</p>
        ) : activeCourts.length === 0 ? (
          <p className="text-center text-body-sm text-ink-400 py-12">Este complejo no tiene canchas disponibles todavía.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-overline text-ink-400 uppercase">{activeCourts.length} canchas</span>
              <Badge tone="success" dot>Reservá online</Badge>
            </div>
            {activeCourts.map((c) => (
              <div
                key={c.id}
                onClick={() => onPick(c)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onPick(c)}
                className="bg-white border-[1.5px] border-ink-100 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-[180ms]"
                data-testid={`public-court-${c.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="font-display font-bold text-[16px] text-ink-900">{c.name}</span>
                    <p className="text-[12px] text-ink-500 mt-0.5">{humanizeSport(c.sportType)}{c.surface ? ` · ${c.surface}` : ''}</p>
                  </div>
                  {c.pricePerHour != null && (
                    <div className="text-right flex-none">
                      <p className="font-mono font-bold text-[15px] text-ink-900">${c.pricePerHour.toLocaleString('es-AR')}</p>
                      <p className="text-[10px] text-ink-400 mt-0.5">por hora</p>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <div className="flex items-center gap-1 bg-green-500 text-white rounded-full px-3.5 py-1.5 text-[13px] font-bold font-body">
                    Reservar →
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )
}

function Step2({ businessId, court, onBack, onPick }: { businessId: string; court: Court; onBack: () => void; onPick: (date: string, time: string) => void }) {
  const [date, setDate] = useState(NEXT_DAYS[0]!)
  const [sel, setSel] = useState<string | null>(null)
  const { data, isLoading, isError } = useAvailability(businessId, court.id, date)
  const slots = data?.availableSlots ?? []

  return (
    <>
      <div className="flex-none flex items-center gap-2 px-4 py-3 bg-white border-b border-ink-100">
        <button type="button" onClick={onBack} className="border-none bg-transparent cursor-pointer p-1" aria-label="Volver">
          <ChevronLeft size={20} className="text-ink-700" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[16px] text-ink-900 truncate">{court.name}</p>
          <p className="text-[11px] text-ink-500 truncate">{humanizeSport(court.sportType)}{court.surface ? ` · ${court.surface}` : ''}</p>
        </div>
        <div className="text-[11px] font-bold text-ink-400 uppercase tracking-wide">Paso 2 de 3</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <DateStrip selected={date} onSelect={(iso) => { setDate(iso); setSel(null) }} />
        <div className="px-4 py-2.5"><AvailabilityLegend /></div>
        {isLoading ? (
          <p className="text-center text-body-sm text-ink-400 py-8">Buscando horarios…</p>
        ) : isError ? (
          <p className="text-center text-body-sm text-red-600 py-8">No pudimos cargar la disponibilidad.</p>
        ) : slots.length === 0 ? (
          <p className="text-center text-body-sm text-ink-400 py-8">Sin horarios libres {relativeDayLabel(date).toLowerCase()}.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 px-4 pb-8">
            {slots.map((s) => {
              const isSel = sel === s.startTime
              return (
                <button
                  key={s.startTime}
                  type="button"
                  onClick={() => setSel(s.startTime)}
                  className="py-3 rounded-md border-[1.5px] text-center font-mono font-bold text-[13px] transition-all"
                  style={{
                    borderColor: isSel ? 'var(--action-primary)' : 'var(--state-available-bd)',
                    background: isSel ? 'var(--action-primary)' : 'var(--state-available-bg)',
                    color: isSel ? 'white' : 'var(--state-available-fg)',
                    boxShadow: isSel ? 'var(--shadow-brand)' : 'none',
                  }}
                  data-testid={`pub-slot-${s.startTime}`}
                >
                  {s.startTime}
                </button>
              )
            })}
          </div>
        )}
      </div>
      <div className="flex-none px-4 pb-4 pt-3 bg-white border-t border-ink-100" style={{ boxShadow: '0 -4px 16px -10px rgba(19,26,31,.2)' }}>
        {sel && <p className="text-center text-caption text-ink-500 mb-2">{court.name} · {sel} hs</p>}
        <Button full size="lg" disabled={!sel} onClick={() => sel && onPick(date, sel)}>Continuar</Button>
      </div>
    </>
  )
}

function Step3({
  businessId, court, date, time, onBack, onConfirm,
}: {
  businessId: string
  court: Court
  date: string
  time: string
  onBack: () => void
  onConfirm: (name: string, phone: string, bookingId: string) => void
}) {
  const { user } = useAuthStore()
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const valid = name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 8
  const createBooking = useCreateBooking(businessId)

  const handleConfirm = () => {
    createBooking.mutate(
      { courtId: court.id, date, startTime: time, guestName: name, guestPhone: phone },
      { onSuccess: ({ data }) => onConfirm(name, phone, data.id) },
    )
  }

  return (
    <>
      <div className="flex-none flex items-center gap-2 px-4 py-3 bg-white border-b border-ink-100">
        <button type="button" onClick={onBack} className="border-none bg-transparent cursor-pointer p-1" aria-label="Volver">
          <ChevronLeft size={20} className="text-ink-700" />
        </button>
        <div>
          <p className="font-display font-bold text-[16px] text-ink-900">Tus datos</p>
        </div>
        <div className="ml-auto text-[11px] font-bold text-ink-400 uppercase tracking-wide">Paso 3 de 3</div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-4">
        <div className="bg-white border border-ink-100 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-green-50 border-b border-green-100 px-3.5 py-2.5 flex items-center gap-2">
            <span className="font-display font-bold text-[14px] text-ink-900">{court.name}</span>
            <span className="text-[12px] text-ink-500 ml-auto">{humanizeSport(court.sportType)}</span>
          </div>
          {[
            { k: 'Fecha', v: relativeDayLabel(date) },
            { k: 'Horario', v: `${time} hs`, mono: true },
            ...(court.pricePerHour != null ? [{ k: 'Precio', v: `$${court.pricePerHour.toLocaleString('es-AR')}`, mono: true }] : []),
          ].map((r, i) => (
            <div key={r.k} className="flex justify-between items-center px-3.5 py-2.5" style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <span className="text-[13px] text-ink-500">{r.k}</span>
              <span className="text-[14px] font-bold text-ink-900" style={{ fontFamily: r.mono ? 'var(--font-mono)' : undefined }}>{r.v}</span>
            </div>
          ))}
        </div>
        <Input label="Nombre completo" placeholder="Ej: Martín Gómez" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Teléfono" placeholder="+54 9 11 1234-5678" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required helperText="El complejo te puede contactar por este número." />
        <div className="flex gap-2 items-start px-3 py-2.5 bg-ink-50 rounded-md">
          <Lock size={13} className="text-ink-400 flex-none mt-0.5" aria-hidden />
          <span className="text-[11px] text-ink-400 leading-relaxed">
            {user
              ? 'Vas a reservar con tu cuenta — la vas a poder ver en "Mis turnos".'
              : 'Tus datos solo los ve el complejo. No creamos una cuenta ni enviamos publicidad.'}
          </span>
        </div>
        {createBooking.isError && (
          <p className="text-body-sm text-red-600 text-center">{getApiErrorMessage(createBooking.error)}</p>
        )}
      </div>
      <div className="flex-none px-4 pb-4 pt-3 bg-white border-t border-ink-100" style={{ boxShadow: '0 -4px 16px -10px rgba(19,26,31,.2)' }}>
        <Button full size="lg" disabled={!valid || createBooking.isPending} onClick={handleConfirm}>
          {createBooking.isPending ? 'Confirmando…' : 'Confirmar reserva'}
        </Button>
      </div>
    </>
  )
}

function Step4({
  court, date, time, player, bookingId, onRebook,
}: {
  court: Court
  date: string
  time: string
  player: { name: string; phone: string }
  bookingId: string
  onRebook: () => void
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-7 py-8 text-center" style={{ background: 'linear-gradient(160deg, var(--green-50) 0%, var(--surface-page) 100%)' }}>
        <div className="w-[76px] h-[76px] rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center" style={{ boxShadow: '0 0 0 10px var(--green-100)' }}>
          <span className="text-white text-[40px]">✓</span>
        </div>
        <h1 className="font-display font-bold text-[26px] text-ink-900 tracking-tight mb-1.5">¡Turno confirmado!</h1>
        <p className="text-[14px] text-ink-500 mb-0.5">{court.name} · {humanizeSport(court.sportType)}</p>
        <p className="font-mono font-bold text-[16px] text-ink-900 mb-1.5">{relativeDayLabel(date)} · {time} hs</p>
        <span className="text-[11px] text-ink-400 font-mono tracking-wide">#{bookingId.slice(0, 8).toUpperCase()}</span>
      </div>
      <div className="px-4">
        <div className="bg-white border border-ink-100 rounded-lg shadow-sm overflow-hidden">
          {[
            { label: 'Jugador', value: player.name },
            { label: 'Teléfono', value: player.phone, mono: true },
            { label: 'Cancha', value: court.name },
            { label: 'Fecha', value: relativeDayLabel(date) },
            { label: 'Horario', value: `${time} hs`, mono: true },
          ].map((r, i) => (
            <div key={r.label} className="flex items-center gap-2.5 px-3.5 py-2.5" style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <span className="text-[12px] text-ink-500 w-[70px] flex-none">{r.label}</span>
              <span className="text-[13px] font-semibold text-ink-900 flex-1" style={{ fontFamily: r.mono ? 'var(--font-mono)' : undefined }}>{r.value}</span>
            </div>
          ))}
        </div>

        <button type="button" onClick={onRebook} className="w-full mt-3.5 py-3 border-none bg-transparent cursor-pointer text-[13px] text-ink-500 underline">
          Reservar otra cancha
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-1.5 pb-8">
          <img src="/logo-mark.svg" width="13" height="13" alt="" />
          <span className="text-[11px] text-ink-400">Reserva gestionada con Book & Play</span>
        </div>
      </div>
    </div>
  )
}

export default function PublicBookingPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const [step, setStep] = useState<Step>(1)
  const [court, setCourt] = useState<Court | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [player, setPlayer] = useState<{ name: string; phone: string } | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)

  if (!businessId) return null

  return (
    <div className="min-h-screen bg-ink-200 flex items-center justify-center p-4">
      <div
        className="w-full bg-ink-25 rounded-2xl shadow-xl overflow-hidden flex flex-col"
        style={{ maxWidth: 420, maxHeight: '90vh', minHeight: 600 }}
      >
        {step === 1 && (
          <Step1 businessId={businessId} onPick={(c) => { setCourt(c); setStep(2) }} />
        )}
        {step === 2 && court && (
          <Step2 businessId={businessId} court={court} onBack={() => setStep(1)} onPick={(d, t) => { setDate(d); setTime(t); setStep(3) }} />
        )}
        {step === 3 && court && date && time && (
          <Step3
            businessId={businessId}
            court={court}
            date={date}
            time={time}
            onBack={() => setStep(2)}
            onConfirm={(name, phone, id) => { setPlayer({ name, phone }); setBookingId(id); setStep(4) }}
          />
        )}
        {step === 4 && court && date && time && player && bookingId && (
          <Step4
            court={court}
            date={date}
            time={time}
            player={player}
            bookingId={bookingId}
            onRebook={() => { setCourt(null); setDate(null); setTime(null); setPlayer(null); setBookingId(null); setStep(1) }}
          />
        )}
      </div>
    </div>
  )
}
