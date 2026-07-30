import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { PhoneInput } from '@/shared/components/PhoneInput'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { useBusiness, useUpdateBusiness } from '../hooks/useBusinesses'

const TIMEZONES = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires' },
  { value: 'America/Montevideo', label: 'Montevideo' },
  { value: 'America/Santiago', label: 'Santiago' },
  { value: 'America/Lima', label: 'Lima' },
  { value: 'America/Bogota', label: 'Bogotá' },
]

// 16px en mobile: por debajo de eso iOS hace zoom al enfocar y descuadra la pantalla.
const FIELD =
  'w-full px-3 py-2.5 rounded-md border-[1.5px] border-ink-200 bg-white font-body text-ink-900 outline-none focus:border-green-500 text-[16px] md:text-[14px]'
const LABEL = 'block text-[12px] font-bold text-ink-500 mb-1.5'
const SECTION_TITLE =
  'font-display font-bold text-[16px] text-ink-900 mb-3.5 pb-2 border-b border-ink-100'

interface BusinessGeneralFormProps {
  businessId: string
}

export function BusinessGeneralForm({ businessId }: BusinessGeneralFormProps) {
  const { data: business, isLoading } = useBusiness(businessId)
  const updateBusiness = useUpdateBusiness(businessId)
  const [form, setForm] = useState({
    name: '', address: '', phone: '', email: '',
    defaultSlotDuration: 60, defaultPricePerSlot: '', timezone: TIMEZONES[0]!.value,
    cancellationDeadlineHours: 24,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!business) return
    setForm({
      name: business.name,
      address: business.address ?? '',
      phone: business.phone ?? '',
      email: business.email ?? '',
      defaultSlotDuration: business.defaultSlotDuration,
      defaultPricePerSlot: business.defaultPricePerSlot != null ? String(business.defaultPricePerSlot) : '',
      timezone: business.timezone,
      cancellationDeadlineHours: business.cancellationDeadlineHours ?? 24,
    })
  }, [business])

  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    const { defaultPricePerSlot, ...rest } = form
    updateBusiness.mutate(
      { ...rest, ...(defaultPricePerSlot.trim() ? { defaultPricePerSlot: Number(defaultPricePerSlot) } : {}) },
      {
        onSuccess: () => {
          setSaved(true)
          window.setTimeout(() => setSaved(false), 2200)
        },
      },
    )
  }

  if (isLoading) return <p className="text-body-sm text-ink-400">Cargando…</p>

  return (
    <div className="max-w-[580px]">
      <section className="mb-7">
        <h3 className={SECTION_TITLE}>Datos del complejo</h3>
        <div className="flex flex-col gap-3.5">
          <div>
            <label htmlFor="biz-name" className={LABEL}>Nombre del complejo *</label>
            <input
              id="biz-name"
              className={FIELD}
              value={form.name}
              onChange={(e) => upd('name', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="biz-address" className={LABEL}>Dirección</label>
            <input
              id="biz-address"
              className={FIELD}
              value={form.address}
              onChange={(e) => upd('address', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PhoneInput label="Teléfono" value={form.phone} onChange={(v) => upd('phone', v)} />
            <div>
              <label htmlFor="biz-email" className={LABEL}>Email</label>
              <input
                id="biz-email"
                type="email"
                className={FIELD}
                value={form.email}
                onChange={(e) => upd('email', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-7">
        <h3 className={SECTION_TITLE}>Valores por defecto de las canchas</h3>
        <p className="text-[12px] text-ink-500 -mt-1.5 mb-3.5">
          Se aplican a las canchas nuevas. Cada cancha puede tener su propia duración y precio.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="biz-slot" className={LABEL}>Duración del turno</label>
            <select
              id="biz-slot"
              className={FIELD}
              value={form.defaultSlotDuration}
              onChange={(e) => upd('defaultSlotDuration', Number(e.target.value))}
            >
              {[30, 60, 90, 120].map((d) => (
                <option key={d} value={d}>{d} minutos</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="biz-price" className={LABEL}>Precio por turno ($)</label>
            <input
              id="biz-price"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              className={FIELD}
              value={form.defaultPricePerSlot}
              onChange={(e) => upd('defaultPricePerSlot', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mb-7">
        <h3 className={SECTION_TITLE}>Cancelaciones</h3>
        <p className="text-[12px] text-ink-500 -mt-1.5 mb-3.5">
          Con cuánta antelación puede cancelar <strong>el cliente</strong>. Vos y tu equipo
          pueden cancelar siempre, sin límite de tiempo.
        </p>
        <div className="max-w-[283px]">
          <label htmlFor="biz-cancel-deadline" className={LABEL}>
            Antelación mínima
          </label>
          <select
            id="biz-cancel-deadline"
            className={FIELD}
            value={form.cancellationDeadlineHours}
            onChange={(e) => upd('cancellationDeadlineHours', Number(e.target.value))}
          >
            <option value={0}>Sin restricción</option>
            {[1, 2, 3, 6, 12, 24, 48, 72].map((h) => (
              <option key={h} value={h}>
                {h === 1 ? '1 hora antes' : `${h} horas antes`}
              </option>
            ))}
          </select>
          <p className="text-[12px] text-ink-500 mt-1.5">
            {form.cancellationDeadlineHours === 0
              ? 'El cliente puede cancelar hasta el momento del turno.'
              : `Pasadas esas horas, el cliente tiene que comunicarse con el complejo.`}
          </p>
        </div>
      </section>

      <section className="mb-7">
        <h3 className={SECTION_TITLE}>Zona horaria</h3>
        <div className="max-w-[283px]">
          <label htmlFor="biz-tz" className="sr-only">Zona horaria</label>
          <select
            id="biz-tz"
            className={FIELD}
            value={form.timezone}
            onChange={(e) => upd('timezone', e.target.value)}
          >
            {TIMEZONES.map((z) => (
              <option key={z.value} value={z.value}>{z.label}</option>
            ))}
          </select>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={updateBusiness.isPending || !form.name.trim()}>
          {updateBusiness.isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-caption font-semibold text-green-700">
            <CheckCircle size={15} className="text-green-600" aria-hidden /> Guardado
          </span>
        )}
        {updateBusiness.isError && (
          <span className="text-caption text-red-700">{getApiErrorMessage(updateBusiness.error)}</span>
        )}
      </div>
    </div>
  )
}
