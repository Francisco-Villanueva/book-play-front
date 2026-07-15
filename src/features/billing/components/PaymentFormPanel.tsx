import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react'
import { useCreateCheckoutSession } from '../hooks/useBilling'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import type { Plan } from '@/shared/types/domain'

interface PaymentFormPanelProps {
  businessId: string
  plan: Plan
  onBack: () => void
}

export function PaymentFormPanel({ businessId, plan, onBack }: PaymentFormPanelProps) {
  const createCheckoutSession = useCreateCheckoutSession(businessId)

  const handleContinue = () => {
    createCheckoutSession.mutate(
      { planId: plan.id },
      { onSuccess: (res) => { window.location.href = res.data.checkoutUrl } },
    )
  }
  const submitting = createCheckoutSession.isPending

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 bg-ink-25 overflow-y-auto">
      <div className="w-full max-w-[480px]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 border-none bg-transparent cursor-pointer text-caption text-ink-500 mb-5 p-0"
        >
          <ArrowLeft size={15} aria-hidden /> Cambiar plan
        </button>

        <div className="bg-green-50 rounded-lg border border-green-200 px-[18px] py-3.5 mb-5 flex justify-between items-center">
          <div>
            <div className="font-bold text-body-sm text-green-800">Plan {plan.name}</div>
            <div className="text-[12px] text-green-700 mt-0.5">Facturación mensual · Cancelá cuando quieras</div>
          </div>
          <div className="font-mono font-extrabold text-h3 text-green-800">
            ${plan.priceArs.toLocaleString('es-AR')}/mes
          </div>
        </div>

        <div className="bg-white rounded-xl border border-ink-100 p-[22px] shadow-md flex flex-col gap-3.5">
          <h2 className="font-display text-h4 font-bold m-0 text-ink-900">Confirmar suscripción</h2>
          <p className="text-body-sm text-ink-500 m-0 leading-relaxed">
            Te vamos a redirigir a Mercado Pago para pagar el primer mes de forma segura.
            Cada período se cobra por separado; nosotros nunca vemos los datos de tu tarjeta.
          </p>

          {createCheckoutSession.isError && (
            <p className="text-caption text-red-600 text-center m-0">{getApiErrorMessage(createCheckoutSession.error)}</p>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={submitting}
            className="w-full py-[13px] rounded-md border-none cursor-pointer disabled:cursor-not-allowed bg-green-500 hover:bg-green-600 disabled:bg-ink-200 text-white text-body-sm font-extrabold flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ExternalLink size={16} aria-hidden />}
            {submitting ? 'Redirigiendo…' : 'Continuar con Mercado Pago'}
          </button>

          <p className="text-[11px] text-ink-400 text-center m-0 leading-relaxed">
            Al confirmar aceptás los Términos y Condiciones. Podés cancelar desde Configuración en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  )
}
