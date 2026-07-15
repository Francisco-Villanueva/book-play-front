import { useEffect, useState } from 'react'
import { Calendar, Check, CheckCircle, Clock, Loader2, Receipt } from 'lucide-react'
import { useSubscription } from '../hooks/useBilling'

interface PaymentConfirmationPanelProps {
  businessId: string
  onContinue: () => void
}

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 30_000

export function PaymentConfirmationPanel({ businessId, onContinue }: PaymentConfirmationPanelProps) {
  // La activación real ocurre de forma asíncrona vía webhook de Mercado Pago, que
  // puede tardar unos segundos tras el redirect. Sondeamos la suscripción hasta
  // verla ACTIVE (o hasta el timeout) para no afirmar "activa" sobre datos de trial.
  const [timedOut, setTimedOut] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const { data: subscription } = useSubscription(businessId, {
    refetchOnMount: 'always',
    refetchInterval: timedOut || confirmed ? false : POLL_INTERVAL_MS,
  })

  const isActive = subscription?.status === 'ACTIVE'

  useEffect(() => {
    if (isActive) setConfirmed(true)
  }, [isActive])

  useEffect(() => {
    if (confirmed) return
    const timer = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [confirmed])

  if (!isActive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center bg-[linear-gradient(160deg,var(--green-50)_0%,var(--surface-page)_60%)] overflow-y-auto">
        <div className="w-20 h-20 rounded-full bg-ink-100 mb-6 flex items-center justify-center">
          {timedOut ? (
            <Clock size={40} className="text-ink-400" aria-hidden />
          ) : (
            <Loader2 size={40} className="text-green-500 animate-spin" aria-hidden />
          )}
        </div>
        <h1 className="font-display text-[30px] font-extrabold tracking-tight m-0 mb-2 text-ink-900">
          {timedOut ? 'Estamos confirmando tu pago' : 'Confirmando tu pago…'}
        </h1>
        <p className="text-body-sm text-ink-500 m-0 mb-8 max-w-[400px] leading-relaxed">
          {timedOut
            ? 'Mercado Pago todavía está procesando la operación. La suscripción se activa automáticamente en cuanto se acredite; podés seguir usando el panel mientras tanto.'
            : 'Estamos esperando la confirmación de Mercado Pago. Esto puede tardar unos segundos.'}
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="px-8 py-[13px] rounded-md border-none cursor-pointer bg-ink-100 hover:bg-ink-200 text-ink-700 text-body-sm font-bold transition-colors"
        >
          Ir al panel →
        </button>
      </div>
    )
  }

  const planName = subscription.plan?.name ?? 'tu plan'
  const nextBillingDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Pendiente de confirmación'

  const rows = [
    { Icon: CheckCircle, label: 'Plan', value: `Book & Play ${planName}`, color: 'text-green-600' },
    { Icon: Calendar, label: 'Próximo cobro', value: nextBillingDate, color: 'text-ink-400' },
    { Icon: Receipt, label: 'Pago', value: 'Gestionado por Mercado Pago', color: 'text-ink-400' },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center bg-[linear-gradient(160deg,var(--green-50)_0%,var(--surface-page)_60%)] overflow-y-auto">
      <div className="w-20 h-20 rounded-full bg-green-500 mb-6 flex items-center justify-center shadow-[0_0_0_14px_var(--green-100)]">
        <Check size={42} strokeWidth={3} className="text-white" aria-hidden />
      </div>
      <h1 className="font-display text-[30px] font-extrabold tracking-tight m-0 mb-2 text-ink-900">¡Suscripción activa!</h1>
      <p className="text-body-sm text-ink-500 m-0 mb-8 max-w-[380px] leading-relaxed">
        Tu plan <strong>{planName}</strong> está activo. Todas las features incluidas ya están disponibles para tu complejo.
      </p>
      <div className="bg-white rounded-xl border border-ink-100 shadow-md px-7 py-5 w-full max-w-[420px] mb-6 text-left">
        {rows.map((row, i) => (
          <div key={row.label} className={`flex items-center gap-3 py-2.5 ${i ? 'border-t border-ink-100' : ''}`}>
            <row.Icon size={16} className={row.color} aria-hidden />
            <span className="text-caption text-ink-500 w-[100px] flex-none">{row.label}</span>
            <span className="text-caption font-semibold text-ink-900">{row.value}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="px-8 py-[13px] rounded-md border-none cursor-pointer bg-green-500 hover:bg-green-600 text-white text-body-sm font-bold transition-colors"
      >
        Ir al panel →
      </button>
    </div>
  )
}
