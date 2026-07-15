import { useState } from 'react'
import { Zap } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { TrialBanner } from '@/shared/components/TrialBanner'
import { InvoiceHistoryTable } from './InvoiceHistoryTable'
import { useCancelSubscription, usePayments, useReactivateSubscription, useSubscription } from '../hooks/useBilling'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import type { SubscriptionStatus } from '@/shared/types/domain'

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  TRIALING: 'Trial',
  ACTIVE: 'Activa',
  PAST_DUE: 'Pago pendiente',
  SUSPENDED: 'Suspendida',
  CANCELLED: 'Cancelada',
}

const STATUS_BADGE_CLASS: Record<SubscriptionStatus, string> = {
  TRIALING: 'bg-ink-50 text-ink-400 border-ink-200',
  ACTIVE: 'bg-green-50 text-green-600 border-green-200',
  PAST_DUE: 'bg-amber-50 text-amber-600 border-amber-200',
  SUSPENDED: 'bg-red-50 text-red-600 border-red-200',
  CANCELLED: 'bg-ink-50 text-ink-400 border-ink-200',
}

interface BillingSettingsPanelProps {
  businessId: string
  onUpgrade: () => void
}

export function BillingSettingsPanel({ businessId, onUpgrade }: BillingSettingsPanelProps) {
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const { data: subscription, isLoading, isError } = useSubscription(businessId)
  const isTrial = subscription?.status === 'TRIALING'
  const { data: payments } = usePayments(businessId, !isTrial)
  const cancelSubscription = useCancelSubscription(businessId)
  const reactivateSubscription = useReactivateSubscription(businessId)

  if (isLoading) {
    return <p className="text-body-sm text-ink-400">Cargando información de facturación…</p>
  }

  if (isError || !subscription) {
    return (
      <div className="max-w-[520px] bg-ink-50 border border-ink-100 rounded-lg p-5">
        <p className="text-body-sm font-bold text-ink-700 mb-1">Facturación no disponible todavía</p>
        <p className="text-caption text-ink-500">
          No pudimos cargar la suscripción de este complejo. Probá de nuevo en unos minutos.
        </p>
      </div>
    )
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86_400_000))
  const nextBillingDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    : null
  const planName = subscription.plan?.name ?? 'Gratis (Trial)'
  const isCancelling = !isTrial && !!subscription.cancelledAt

  return (
    <div className="max-w-[680px]">
      {isTrial && (
        <div className="mb-5 rounded-md overflow-hidden">
          <TrialBanner daysLeft={daysLeft} onUpgrade={onUpgrade} />
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-white rounded-xl border border-ink-100 px-[22px] py-5 mb-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-overline text-ink-400 m-0 mb-1.5">Plan actual</p>
            <div className="flex items-center gap-2.5">
              <span className="font-display text-h3 font-extrabold text-ink-900">{planName}</span>
              <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_BADGE_CLASS[subscription.status]}`}>
                {isTrial ? `${daysLeft} días restantes` : STATUS_LABEL[subscription.status]}
              </span>
            </div>
          </div>
          {!isTrial && nextBillingDate && (
            <div className="text-right">
              <p className="text-overline text-ink-400 m-0 mb-1">Próximo cobro</p>
              <span className="font-mono font-bold text-body-sm text-ink-900">{nextBillingDate}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2.5">
          <Button size="sm" leftIcon={<Zap size={14} aria-hidden />} onClick={onUpgrade}>
            {isTrial ? 'Elegir plan' : 'Cambiar plan'}
          </Button>
        </div>
      </div>

      {!isTrial && (
        <div className="mb-5">
          <InvoiceHistoryTable payments={payments ?? []} />
        </div>
      )}

      {/* Cancellation pending: access kept until period end, offer to undo it */}
      {isCancelling && (
        <div className="p-[18px] bg-amber-50 rounded-lg border-[1.5px] border-amber-200">
          <p className="font-bold text-body-sm text-amber-700 m-0 mb-1.5">Cancelación programada</p>
          <p className="text-caption text-ink-500 m-0 mb-3.5 leading-relaxed">
            {nextBillingDate
              ? `Tu suscripción se cancela el ${nextBillingDate}. Hasta esa fecha mantenés el acceso completo. Podés reactivarla antes de que venza.`
              : 'Tu suscripción está marcada para cancelarse. Podés reactivarla antes de que venza el período.'}
          </p>
          {reactivateSubscription.isError && (
            <p className="text-caption text-red-600 m-0 mb-2.5">{getApiErrorMessage(reactivateSubscription.error)}</p>
          )}
          <Button
            size="sm"
            disabled={reactivateSubscription.isPending}
            onClick={() => reactivateSubscription.mutate()}
          >
            {reactivateSubscription.isPending ? 'Reactivando…' : 'Reactivar suscripción'}
          </Button>
        </div>
      )}

      {/* Cancel subscription */}
      {!isTrial && !isCancelling && !cancelConfirm && (
        <button
          type="button"
          onClick={() => setCancelConfirm(true)}
          className="text-caption text-ink-400 bg-transparent border-none cursor-pointer underline"
        >
          Cancelar suscripción
        </button>
      )}
      {!isCancelling && cancelConfirm && (
        <div className="p-[18px] bg-[rgba(220,38,38,.05)] rounded-lg border-[1.5px] border-[rgba(220,38,38,.2)]">
          <p className="font-bold text-body-sm text-[#B91C1C] m-0 mb-1.5">¿Cancelar suscripción?</p>
          <p className="text-caption text-ink-500 m-0 mb-3.5 leading-relaxed">
            {nextBillingDate
              ? `Mantenés el acceso hasta el ${nextBillingDate}. Después la cuenta pasa a estado Suspendida y no se cobran más cargos.`
              : 'La cuenta pasa a estado Suspendida y no se cobran más cargos.'}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCancelConfirm(false)}>
              Mantener suscripción
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={cancelSubscription.isPending}
              onClick={() => {
                cancelSubscription.mutate(undefined, { onSuccess: () => setCancelConfirm(false) })
              }}
            >
              {cancelSubscription.isPending ? 'Cancelando…' : 'Confirmar cancelación'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
