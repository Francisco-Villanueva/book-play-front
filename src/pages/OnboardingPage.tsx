import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Switch } from '@/shared/components/Switch'
import { cn } from '@/shared/utils/cn'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { businessesApi } from '@/features/businesses/api/businessesApi'
import { createBusinessSchema, type CreateBusinessFormData } from '@/features/businesses/schemas/createBusinessSchema'
import { courtsApi } from '@/features/courts/api/courtsApi'
import { createCourtSchema, type CreateCourtFormData } from '@/features/courts/schemas/createCourtSchema'
import { availabilityRulesApi } from '@/features/availability-rules/api/availabilityRulesApi'
import { availabilityWizardSchema, type AvailabilityWizardFormData } from '@/features/availability-rules/schemas/availabilityWizardSchema'
import { authApi } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/features/auth/store/authStore'

const DEFAULT_TIMEZONE = 'America/Argentina/Buenos_Aires'

const STEPS = [
  { num: 1, label: 'Tu complejo',    sub: 'Nombre y datos de contacto' },
  { num: 2, label: 'Primera cancha', sub: 'Sport, superficie y precio' },
  { num: 3, label: 'Disponibilidad', sub: 'Días y horarios de apertura' },
]

const SPORTS_SLUGS: Record<string, string> = {
  'Fútbol 5': 'futbol5',
  'Pádel': 'padel',
  'Tenis': 'tenis',
  'Básquet': 'basquet',
  'Vóley': 'voley',
  'Otro': 'otro',
}
const SURFACES = ['Césped sintético', 'Parqué', 'Cristal panorámico', 'Hormigón', 'Polvo de ladrillo', 'Otro']
const DURATIONS = [30, 60, 90, 120] as const
const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ── Step 1 ────────────────────────────────────────────────────────
function Step1({ onNext }: { onNext: (businessId: string) => void }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateBusinessFormData>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: { slotDuration: 60 },
  })
  const slotDuration = watch('slotDuration')

  const createBusiness = useMutation({
    mutationFn: (data: CreateBusinessFormData) =>
      businessesApi.create({
        name: data.name,
        timezone: DEFAULT_TIMEZONE,
        slotDuration: data.slotDuration,
        ...(data.address ? { address: data.address } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.email ? { email: data.email } : {}),
      }),
  })

  const onSubmit = (data: CreateBusinessFormData) => {
    createBusiness.mutate(data, {
      onSuccess: ({ data: res }) => onNext(res.business.id),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-8 space-y-4">
        <div>
          <h2 className="font-display font-bold text-h2 text-ink-900 tracking-tight mb-1">Tu complejo</h2>
          <p className="text-body-sm text-ink-500">Contanos cómo se llama y dónde está ubicado.</p>
        </div>
        <div className="space-y-3">
          <Input
            label="Nombre del complejo"
            placeholder="Ej: Club Norte"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input label="Dirección" placeholder="Av. Libertad 1850, Palermo, CABA" {...register('address')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Teléfono" placeholder="+54 11 4567-8901" type="tel" {...register('phone')} />
            <Input
              label="Email de contacto"
              placeholder="info@micomplejo.com"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-ink-700 mb-1.5">Duración predeterminada de turno</p>
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setValue('slotDuration', d, { shouldValidate: true })}
                className={cn(
                  'px-4 py-2 rounded-md border-[1.5px] text-[13px] font-semibold cursor-pointer transition-colors',
                  slotDuration === d
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-ink-200 bg-white text-ink-600',
                )}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>
        {createBusiness.isError && (
          <p className="text-body-sm text-red-600">{getApiErrorMessage(createBusiness.error)}</p>
        )}
      </div>
      <div className="flex-none px-8 pb-8 pt-4 border-t border-ink-100">
        <Button
          type="submit"
          full
          size="lg"
          disabled={createBusiness.isPending}
          rightIcon={<ChevronRight size={18} aria-hidden />}
        >
          {createBusiness.isPending ? 'Creando complejo…' : 'Continuar'}
        </Button>
      </div>
    </form>
  )
}

// ── Step 2 ────────────────────────────────────────────────────────
function Step2({
  businessId,
  onNext,
  onBack,
}: {
  businessId: string
  onNext: (courtId: string) => void
  onBack: () => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCourtFormData>({
    resolver: zodResolver(createCourtSchema),
    defaultValues: { sportType: 'Fútbol 5', surface: 'Césped sintético', isIndoor: false, hasLighting: true },
  })
  const sport = watch('sportType')
  const surface = watch('surface')
  const isIndoor = watch('isIndoor')
  const hasLighting = watch('hasLighting')

  const createCourt = useMutation({
    mutationFn: (data: CreateCourtFormData) => {
      const capacity = data.capacity ? Number(data.capacity) : undefined
      const pricePerHour = data.pricePerHour ? Number(data.pricePerHour) : undefined
      return courtsApi.createCourt(businessId, {
        name: data.name,
        sportType: SPORTS_SLUGS[data.sportType] ?? data.sportType,
        surface: data.surface,
        isIndoor: data.isIndoor,
        hasLighting: data.hasLighting,
        ...(capacity !== undefined ? { capacity } : {}),
        ...(pricePerHour !== undefined ? { pricePerHour } : {}),
      })
    },
  })

  const onSubmit = (data: CreateCourtFormData) => {
    createCourt.mutate(data, {
      onSuccess: ({ data: res }) => onNext(res.id),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-8 space-y-4">
        <div>
          <h2 className="font-display font-bold text-h2 text-ink-900 tracking-tight mb-1">Primera cancha</h2>
          <p className="text-body-sm text-ink-500">Podés agregar más después.</p>
        </div>
        <div className="space-y-3">
          <Input
            label="Nombre de la cancha"
            placeholder="Ej: Cancha 1"
            error={errors.name?.message}
            {...register('name')}
          />
          <div>
            <p className="text-[13px] font-semibold text-ink-700 mb-2">Deporte</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(SPORTS_SLUGS).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue('sportType', s, { shouldValidate: true })}
                  className={cn(
                    'px-3 py-1.5 rounded-full border-[1.5px] text-[12px] font-semibold cursor-pointer transition-colors',
                    sport === s
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-ink-200 bg-white text-ink-600',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink-700 mb-2">Superficie</p>
            <div className="flex flex-wrap gap-2">
              {SURFACES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue('surface', s, { shouldValidate: true })}
                  className={cn(
                    'px-3 py-1.5 rounded-full border-[1.5px] text-[12px] font-semibold cursor-pointer transition-colors',
                    surface === s
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-ink-200 bg-white text-ink-600',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Capacidad (jugadores)" placeholder="10" type="number" {...register('capacity')} />
            <Input label="Precio por hora" placeholder="12000" type="number" {...register('pricePerHour')} />
          </div>
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-center justify-between py-2.5 px-3.5 bg-ink-50 rounded-md border border-ink-100">
              <span className="text-[13px] font-semibold text-ink-700">Cancha cubierta</span>
              <Switch
                checked={isIndoor}
                onChange={(e) => setValue('isIndoor', e.target.checked)}
                aria-label="Cancha cubierta"
              />
            </div>
            <div className="flex items-center justify-between py-2.5 px-3.5 bg-ink-50 rounded-md border border-ink-100">
              <span className="text-[13px] font-semibold text-ink-700">Iluminación nocturna</span>
              <Switch
                checked={hasLighting}
                onChange={(e) => setValue('hasLighting', e.target.checked)}
                aria-label="Iluminación nocturna"
              />
            </div>
          </div>
        </div>
        {createCourt.isError && (
          <p className="text-body-sm text-red-600">{getApiErrorMessage(createCourt.error)}</p>
        )}
      </div>
      <div className="flex-none px-8 pb-8 pt-4 border-t border-ink-100 flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>Atrás</Button>
        <Button
          type="submit"
          full
          size="lg"
          disabled={createCourt.isPending}
          rightIcon={<ChevronRight size={18} aria-hidden />}
        >
          {createCourt.isPending ? 'Creando cancha…' : 'Continuar'}
        </Button>
      </div>
    </form>
  )
}

// ── Step 3 ────────────────────────────────────────────────────────
function Step3({
  businessId,
  courtId,
  onFinish,
  onBack,
}: {
  businessId: string
  courtId: string
  onFinish: () => void
  onBack: () => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AvailabilityWizardFormData>({
    resolver: zodResolver(availabilityWizardSchema),
    defaultValues: { days: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '23:00' },
  })
  const activeDays = watch('days')
  const openH = watch('startTime')
  const closeH = watch('endTime')

  const PRESETS = [
    { label: 'Lun–Vie', days: [1, 2, 3, 4, 5] },
    { label: 'Lun–Sáb', days: [1, 2, 3, 4, 5, 6] },
    { label: 'Todos',   days: [0, 1, 2, 3, 4, 5, 6] },
  ]

  const toggleDay = (day: number) => {
    const next = activeDays.includes(day) ? activeDays.filter((d) => d !== day) : [...activeDays, day]
    setValue('days', next, { shouldValidate: true })
  }

  const createRules = useMutation({
    mutationFn: (data: AvailabilityWizardFormData) =>
      Promise.all(
        data.days.map((day) =>
          availabilityRulesApi.create(businessId, {
            name: `Horario ${DAYS_SHORT[day]}`,
            dayOfWeek: day,
            startTime: data.startTime,
            endTime: data.endTime,
            courtIds: [courtId],
          }),
        ),
      ),
    onSuccess: onFinish,
  })

  return (
    <form onSubmit={handleSubmit((data) => createRules.mutate(data))} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-8 space-y-5">
        <div>
          <h2 className="font-display font-bold text-h2 text-ink-900 tracking-tight mb-1">Disponibilidad</h2>
          <p className="text-body-sm text-ink-500">¿Cuándo está abierto el complejo?</p>
        </div>

        <div>
          <p className="text-[13px] font-semibold text-ink-700 mb-2">Presets</p>
          <div className="flex gap-2">
            {PRESETS.map((p) => {
              const active = JSON.stringify([...p.days].sort()) === JSON.stringify([...activeDays].sort())
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setValue('days', p.days, { shouldValidate: true })}
                  className={cn(
                    'px-3.5 py-1.5 rounded-md border-[1.5px] text-[13px] font-semibold cursor-pointer transition-colors',
                    active
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-ink-200 bg-white text-ink-600',
                  )}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-[13px] font-semibold text-ink-700 mb-2">Días activos</p>
          <div className="flex gap-2">
            {DAYS_SHORT.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  'w-10 h-10 rounded-full text-[12px] font-bold cursor-pointer border-none transition-colors',
                  activeDays.includes(i) ? 'bg-green-500 text-white' : 'bg-ink-100 text-ink-500',
                )}
              >
                {d.slice(0, 2)}
              </button>
            ))}
          </div>
          {errors.days && <p className="text-caption text-red-500 mt-1.5">{errors.days.message}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-ink-600 mb-1.5">Apertura</label>
            <input
              type="time"
              {...register('startTime')}
              className="border border-ink-200 rounded-md px-3 py-2 text-[13px] font-mono text-ink-900 bg-white outline-none focus:border-green-500"
            />
          </div>
          <span className="text-ink-400 mt-5">–</span>
          <div>
            <label className="block text-[12px] font-semibold text-ink-600 mb-1.5">Cierre</label>
            <input
              type="time"
              {...register('endTime')}
              className="border border-ink-200 rounded-md px-3 py-2 text-[13px] font-mono text-ink-900 bg-white outline-none focus:border-green-500"
            />
          </div>
        </div>
        {errors.endTime && <p className="text-caption text-red-500">{errors.endTime.message}</p>}

        {/* Preview */}
        <div className="bg-ink-50 rounded-md p-3.5 border border-ink-100">
          <p className="text-[11px] font-bold text-ink-400 uppercase tracking-wide mb-2">Vista previa</p>
          <div className="flex gap-1.5 flex-wrap">
            {DAYS_SHORT.map((d, i) => (
              <div
                key={d}
                className={cn(
                  'flex flex-col items-center rounded-md px-2.5 py-1.5 border',
                  activeDays.includes(i) ? 'bg-green-50 border-green-200' : 'bg-ink-100 border-ink-200 opacity-40',
                )}
              >
                <span className="text-[10px] font-bold" style={{ color: activeDays.includes(i) ? 'var(--green-700)' : 'var(--text-subtle)' }}>{d}</span>
                {activeDays.includes(i) && (
                  <span className="text-[10px] font-mono text-green-600 mt-0.5">{openH.slice(0, 5)}–{closeH.slice(0, 5)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        {createRules.isError && (
          <p className="text-body-sm text-red-600">{getApiErrorMessage(createRules.error)}</p>
        )}
      </div>
      <div className="flex-none px-8 pb-8 pt-4 border-t border-ink-100 flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>Atrás</Button>
        <Button type="submit" full size="lg" disabled={createRules.isPending}>
          {createRules.isPending ? 'Configurando…' : '¡Listo, crear complejo!'}
        </Button>
      </div>
    </form>
  )
}

// ── Success ───────────────────────────────────────────────────────
function SuccessScreen({ businessId }: { businessId: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div
        className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6"
        style={{ boxShadow: '0 0 0 12px var(--green-100)' }}
      >
        <Check size={38} className="text-white" strokeWidth={2.5} aria-hidden />
      </div>
      <h1 className="font-display font-bold text-h1 text-ink-900 tracking-tight mb-2">¡Listo para jugar!</h1>
      <p className="text-body text-ink-500 mb-8 max-w-[340px]">
        Tu complejo está configurado. Podés empezar a recibir reservas de inmediato.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-[320px]">
        <Button full size="lg" onClick={() => navigate(`/admin/${businessId}/agenda`)}>
          Ver la agenda
        </Button>
        <Button full variant="secondary" onClick={() => navigate(`/admin/${businessId}/courts`)}>
          Gestionar canchas
        </Button>
        <Button full variant="ghost" onClick={() => navigate(`/admin/${businessId}`)}>
          Ir al panel de resumen
        </Button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 'done'>(1)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [courtId, setCourtId] = useState<string | null>(null)
  const { token, setAuth } = useAuthStore()

  const handleFinish = async () => {
    // Refresh the profile so the auth store knows about the new OWNER membership —
    // future logins (and the current session) route straight to this business's admin panel.
    if (token) {
      try {
        const { data } = await authApi.me()
        setAuth(data, token)
      } catch {
        // Non-fatal — the business was created either way; it'll sync on next session restore.
      }
    }
    setStep('done')
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[860px] bg-white rounded-2xl shadow-xl overflow-hidden flex" style={{ minHeight: 580, maxHeight: '90vh' }}>
        {step !== 'done' && (
          <aside className="w-[280px] flex-none bg-ink-900 p-8 flex flex-col">
            <img src="/logo-wordmark-inverse.svg" height="30" alt="Book & Play" className="mb-10" />
            <div className="flex flex-col gap-6 flex-1">
              {STEPS.map((s) => {
                const done = typeof step === 'number' && step > s.num
                const active = typeof step === 'number' && step === s.num
                return (
                  <div key={s.num} className="flex items-start gap-3.5">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex-none flex items-center justify-center text-[12px] font-bold mt-0.5',
                        done    ? 'bg-green-500 text-white'
                        : active ? 'bg-white text-ink-900'
                        : 'bg-ink-700 text-ink-400',
                      )}
                    >
                      {done ? <Check size={14} strokeWidth={2.5} aria-hidden /> : s.num}
                    </div>
                    <div>
                      <p className={cn('text-[14px] font-bold', active ? 'text-white' : done ? 'text-green-400' : 'text-ink-500')}>{s.label}</p>
                      <p className="text-[12px] text-ink-500 mt-0.5">{s.sub}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-ink-500 mt-6">Podés cambiar todo esto después desde Configuración.</p>
          </aside>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          {step === 1 && <Step1 onNext={(id) => { setBusinessId(id); setStep(2) }} />}
          {step === 2 && businessId && (
            <Step2 businessId={businessId} onNext={(id) => { setCourtId(id); setStep(3) }} onBack={() => setStep(1)} />
          )}
          {step === 3 && businessId && courtId && (
            <Step3 businessId={businessId} courtId={courtId} onFinish={handleFinish} onBack={() => setStep(2)} />
          )}
          {step === 'done' && businessId && <SuccessScreen businessId={businessId} />}
        </div>
      </div>
    </div>
  )
}
