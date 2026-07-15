import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { PlanCard } from '@/shared/components/PlanCard'
import { usePublicPlans } from '@/features/plans/hooks/usePlans'
import type { Plan } from '@/shared/types/domain'

export default function ConversionWallPage() {
  const navigate = useNavigate()
  const { businessId } = useParams<{ businessId: string }>()
  const { data: plans } = usePublicPlans()
  const [selected, setSelected] = useState<Plan | null>(null)
  const paidPlans = (plans ?? []).filter((p) => p.priceArs > 0)

  const handleSelect = (plan: Plan) => {
    setSelected(plan)
    const dest = businessId ? `/admin/${businessId}/upgrade` : '/pricing'
    navigate(dest)
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink-25">
      {/* Warning bar */}
      <div className="w-full bg-[#DC2626] text-white text-center px-5 py-2.5 text-body-sm font-bold flex-none">
        Tu período de prueba venció. Elegí un plan para retomar la operación.
      </div>

      <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto pb-10">
        {/* Lock illustration */}
        <div className="px-6 pt-11 pb-7 text-center">
          <div className="w-[72px] h-[72px] rounded-full bg-[rgba(220,38,38,.08)] border-2 border-[rgba(220,38,38,.2)] flex items-center justify-center mx-auto mb-5">
            <Lock size={34} className="text-[#DC2626]" aria-hidden />
          </div>
          <h1 className="font-display text-[28px] font-extrabold tracking-tight m-0 mb-2 text-ink-900">
            Acceso suspendido
          </h1>
          <p className="text-body-sm text-ink-500 m-0 max-w-[440px] mx-auto leading-relaxed">
            Tus datos están seguros. Elegí un plan para retomar la operación sin pérdida de información.
          </p>
        </div>

        {/* Plan cards (paid only) */}
        <div
          className="grid gap-[18px] w-full max-w-[680px] px-6"
          style={{ gridTemplateColumns: `repeat(${Math.max(paidPlans.length, 1)}, 1fr)` }}
        >
          {paidPlans.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              recommended={i === paidPlans.length - 1}
              selected={selected?.id === plan.id}
              onSelect={() => handleSelect(plan)}
            />
          ))}
        </div>

        <p className="text-[12px] text-ink-400 mt-5">
          Procesado de forma segura con <strong>Mercado Pago</strong> · Podés cancelar en cualquier momento
        </p>
      </div>
    </div>
  )
}
