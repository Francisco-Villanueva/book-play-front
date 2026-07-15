import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Switch } from '@/shared/components/Switch'
import { Checkbox } from '@/shared/components/Checkbox'
import type { Plan } from '@/shared/types/domain'
import type { PlanFormPayload } from '../api/plansApi'
import { ALL_FEATURE_KEYS, featureLabel } from '../featureLabels'

interface PlanFormPanelProps {
  plan: Plan | null
  onClose: () => void
  onSave: (values: PlanFormPayload, id?: string) => void
  saving?: boolean
}

const EMPTY_FORM: PlanFormPayload = {
  name: '',
  code: '',
  description: '',
  priceArs: 0,
  courtsLimit: undefined,
  staffLimit: undefined,
  featureKeys: [],
  isPubliclyVisible: true,
  sortOrder: 0,
}

function toFormValues(plan: Plan): PlanFormPayload {
  return {
    name: plan.name,
    code: plan.code,
    description: plan.description ?? '',
    priceArs: plan.priceArs,
    courtsLimit: plan.courtsLimit ?? undefined,
    staffLimit: plan.staffLimit ?? undefined,
    featureKeys: plan.featureKeys,
    isPubliclyVisible: plan.isPubliclyVisible,
    sortOrder: plan.sortOrder,
  }
}

export function PlanFormPanel({ plan, onClose, onSave, saving }: PlanFormPanelProps) {
  const isNew = !plan
  const isPriceLocked = !!plan?.mpPreapprovalPlanId
  const [form, setForm] = useState<PlanFormPayload>(plan ? toFormValues(plan) : EMPTY_FORM)
  const upd = <K extends keyof PlanFormPayload>(k: K, v: PlanFormPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const toggleFeature = (key: string, checked: boolean) => {
    upd('featureKeys', checked ? [...form.featureKeys, key] : form.featureKeys.filter((k) => k !== key))
  }

  return (
    <div className="w-[380px] flex-none h-full flex flex-col bg-white border-l border-ink-100">
      <div className="flex-none px-[18px] pt-4 pb-3 border-b border-ink-100 flex items-center justify-between">
        <h3 className="font-display font-bold text-h4 text-ink-900">
          {isNew ? 'Nuevo plan' : `Editar · ${plan.name}`}
        </h3>
        <button type="button" onClick={onClose} aria-label="Cerrar panel" className="border-none bg-transparent cursor-pointer text-ink-400 flex">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-3.5">
        <Input
          label="Nombre"
          required
          placeholder="Ej: Pro"
          value={form.name}
          onChange={(e) => upd('name', e.target.value)}
        />
        <Input
          label="Código"
          required
          placeholder="Ej: pro"
          helperText="Solo minúsculas, números y guiones. No se puede cambiar luego."
          value={form.code}
          disabled={!isNew}
          onChange={(e) => upd('code', e.target.value.toLowerCase())}
        />
        <Input
          label="Descripción"
          placeholder="Para complejos grandes, canchas ilimitadas"
          value={form.description}
          onChange={(e) => upd('description', e.target.value)}
        />
        <Input
          label="Precio mensual (ARS)"
          type="number"
          min={0}
          step={500}
          disabled={isPriceLocked}
          helperText={isPriceLocked ? 'Ya sincronizado con Mercado Pago — archivá y creá uno nuevo para cambiar el precio' : undefined}
          value={form.priceArs}
          onChange={(e) => upd('priceArs', Number(e.target.value))}
        />

        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Límite de canchas"
            type="number"
            min={1}
            placeholder="Ilimitado"
            value={form.courtsLimit ?? ''}
            onChange={(e) => upd('courtsLimit', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            label="Límite de staff"
            type="number"
            min={1}
            placeholder="Ilimitado"
            value={form.staffLimit ?? ''}
            onChange={(e) => upd('staffLimit', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="border-t border-ink-100 pt-3.5 flex flex-col gap-2">
          <span className="text-caption font-bold text-ink-700">Features incluidas</span>
          {ALL_FEATURE_KEYS.map((key) => (
            <Checkbox
              key={key}
              label={featureLabel(key)}
              checked={form.featureKeys.includes(key)}
              onChange={(e) => toggleFeature(key, e.target.checked)}
            />
          ))}
        </div>

        <div className="border-t border-ink-100 pt-3.5">
          <Switch
            label="Visible públicamente"
            description="Aparece en /plans y en la página de precios"
            checked={!!form.isPubliclyVisible}
            onChange={(e) => upd('isPubliclyVisible', e.target.checked)}
          />
        </div>
      </div>

      <div className="flex-none px-[18px] py-3.5 border-t border-ink-100 flex gap-2">
        <Button variant="outline" full onClick={onClose}>Cancelar</Button>
        <Button
          full
          disabled={!form.name.trim() || !form.code.trim() || saving}
          onClick={() => onSave(form, plan?.id)}
        >
          {saving ? 'Guardando…' : isNew ? 'Crear plan' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  )
}
