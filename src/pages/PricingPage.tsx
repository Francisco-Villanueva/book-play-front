import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { PlanCard } from '@/shared/components/PlanCard'
import { PaymentFormPanel } from '@/features/billing/components/PaymentFormPanel'
import { PlanComparisonTable } from '@/features/billing/components/PlanComparisonTable'
import { FaqAccordion } from '@/features/billing/components/FaqAccordion'
import { usePublicPlans } from '@/features/plans/hooks/usePlans'
import type { Plan } from '@/shared/types/domain'

type Screen = 'pricing' | 'payment'

export default function PricingPage() {
  const navigate = useNavigate()
  const { businessId } = useParams<{ businessId: string }>()
  const { data: plans, isLoading } = usePublicPlans()
  const [screen, setScreen] = useState<Screen>('pricing')
  const [selected, setSelected] = useState<Plan | null>(null)

  const handleContinue = () => {
    navigate(businessId ? `/admin/${businessId}` : '/dashboard')
  }

  if (screen === 'payment' && selected && businessId) {
    return (
      <div className="min-h-screen flex flex-col bg-ink-25">
        <PaymentFormPanel businessId={businessId} plan={selected} onBack={() => setScreen('pricing')} />
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-ink-25">
      {/* Hero */}
      <div className="text-center px-6 pt-12 pb-8 bg-[linear-gradient(160deg,var(--green-50)_0%,var(--surface-page)_60%)]">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-green-50 border border-green-200 mb-4">
          <Zap size={13} className="text-green-700" aria-hidden />
          <span className="text-[12px] font-bold text-green-700">Planes de suscripción</span>
        </div>
        <h1 className="font-display text-h1 font-extrabold tracking-tight m-0 mb-2.5 text-ink-900">
          Elegí el plan para tu complejo
        </h1>
        <p className="text-body text-ink-500 m-0 max-w-[480px] mx-auto leading-relaxed">
          Empezá gratis 30 días. Sin tarjeta. Cambiá de plan cuando quieras.
        </p>
      </div>

      {isLoading && <p className="text-center text-body-sm text-ink-400 py-10">Cargando planes…</p>}

      {plans && plans.length > 0 && (
        <>
          {/* Plan cards */}
          <div
            className="max-w-[920px] mx-auto px-6 pb-10 grid gap-[18px]"
            style={{ gridTemplateColumns: `repeat(${plans.length}, 1fr)` }}
          >
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                recommended={plan.priceArs > 0 && plan === plans[plans.length - 1]}
                selected={selected?.id === plan.id}
                onSelect={() => {
                  setSelected(plan)
                  if (plan.priceArs > 0) setScreen('payment')
                  else handleContinue()
                }}
              />
            ))}
          </div>

          {/* Feature comparison */}
          <div className="max-w-[920px] mx-auto px-6 mb-10">
            <PlanComparisonTable plans={plans} />
          </div>
        </>
      )}

      {/* FAQ */}
      <div className="max-w-[640px] mx-auto px-6 mb-14">
        <h2 className="font-display text-h2 font-bold tracking-tight m-0 mb-5 text-ink-900 text-center">
          Preguntas frecuentes
        </h2>
        <FaqAccordion />
      </div>
    </div>
  )
}
