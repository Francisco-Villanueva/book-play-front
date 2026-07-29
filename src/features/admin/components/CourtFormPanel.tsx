import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { Switch } from '@/shared/components/Switch'
import type { Court } from './courtTypes'

const SPORTS = ['Fútbol 5', 'Fútbol 7', 'Fútbol 11', 'Pádel', 'Tenis', 'Básquet', 'Vóley', 'Hockey', 'Otro']
const SURFACES = ['Césped sintético', 'Césped natural', 'Cristal panorámico', 'Polvo de ladrillo', 'Cemento', 'Parquet flotante', 'Goma', 'Otro']

const DURATIONS = [30, 60, 90, 120].map((d) => ({ value: String(d), label: `${d} minutos` }))

export type CourtFormValues = Omit<Court, 'id' | 'businessId' | 'createdAt'>

interface CourtFormPanelProps {
  court: Court | null
  defaultSlotDuration: number
  defaultPricePerSlot: number | null
  onClose: () => void
  onSave: (values: CourtFormValues, id?: string) => void
  saving?: boolean
}

function toFormValues(court: Court): CourtFormValues {
  return {
    name: court.name,
    sportType: court.sportType,
    surface: court.surface,
    capacity: court.capacity != null ? Number(court.capacity) : undefined,
    isIndoor: court.isIndoor,
    hasLighting: court.hasLighting,
    slotDuration: court.slotDuration,
    pricePerSlot: court.pricePerSlot != null ? Number(court.pricePerSlot) : undefined,
    description: court.description,
    isActive: court.isActive,
  }
}

export function CourtFormPanel({ court, defaultSlotDuration, defaultPricePerSlot, onClose, onSave, saving }: CourtFormPanelProps) {
  const isNew = !court
  const [form, setForm] = useState<CourtFormValues>(
    court
      ? toFormValues(court)
      : {
          name: '', sportType: 'Fútbol 5', surface: 'Césped sintético',
          capacity: 10, isIndoor: false, hasLighting: true, isActive: true,
          slotDuration: defaultSlotDuration,
          ...(defaultPricePerSlot != null ? { pricePerSlot: defaultPricePerSlot } : {}),
        },
  )
  const upd = <K extends keyof CourtFormValues>(k: K, v: CourtFormValues[K]) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="w-full md:w-[340px] flex-none h-full flex flex-col bg-white md:border-l md:border-ink-100">
      <div className="flex-none px-[18px] pt-4 pb-3 border-b border-ink-100 flex items-center justify-between">
        <h3 className="font-display font-bold text-h4 text-ink-900">
          {isNew ? 'Nueva cancha' : `Editar · ${court.name}`}
        </h3>
        <button type="button" onClick={onClose} aria-label="Cerrar panel" className="border-none bg-transparent cursor-pointer text-ink-400 flex">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-3.5">
        <Input
          label="Nombre"
          required
          placeholder="Ej: Cancha 1, Pádel Central…"
          value={form.name}
          onChange={(e) => upd('name', e.target.value)}
          data-testid="court-form-name"
        />
        <Select
          label="Deporte"
          required
          options={SPORTS}
          value={form.sportType ?? SPORTS[0]}
          onChange={(e) => upd('sportType', e.target.value)}
        />
        <Select
          label="Superficie"
          options={SURFACES}
          value={form.surface ?? SURFACES[0]}
          onChange={(e) => upd('surface', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Capacidad"
            type="number"
            min={2}
            max={22}
            value={form.capacity ?? ''}
            onChange={(e) => upd('capacity', Number(e.target.value))}
          />
          <Input
            label="Precio / turno ($)"
            type="number"
            step={500}
            min={0}
            value={form.pricePerSlot ?? ''}
            onChange={(e) => upd('pricePerSlot', Number(e.target.value))}
          />
        </div>
        <div>
          <Select
            label="Duración del turno"
            required
            options={DURATIONS}
            value={String(form.slotDuration)}
            onChange={(e) => upd('slotDuration', Number(e.target.value))}
          />
          <p className="text-[11px] text-ink-400 mt-1">
            {isNew
              ? `Por defecto usa la del complejo (${defaultSlotDuration} min).`
              : 'Solo afecta a las reservas nuevas.'}
          </p>
        </div>

        <div className="border-t border-ink-100 pt-3.5 flex flex-col gap-3">
          <Switch label="Indoor / cubierta" checked={!!form.isIndoor} onChange={(e) => upd('isIndoor', e.target.checked)} />
          <Switch label="Iluminación nocturna" checked={!!form.hasLighting} onChange={(e) => upd('hasLighting', e.target.checked)} />
          <Switch label="Cancha activa" description="Disponible para reservar" checked={form.isActive} onChange={(e) => upd('isActive', e.target.checked)} />
        </div>
      </div>

      <div className="flex-none px-[18px] py-3.5 border-t border-ink-100 flex gap-2">
        <Button variant="outline" full onClick={onClose}>Cancelar</Button>
        <Button
          full
          disabled={!form.name.trim() || saving}
          onClick={() => onSave(form, court?.id)}
          data-testid="court-form-save"
        >
          {saving ? 'Guardando…' : isNew ? 'Crear cancha' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  )
}
