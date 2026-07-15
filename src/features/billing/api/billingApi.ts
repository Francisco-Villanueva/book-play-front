import { apiClient } from '@/shared/lib/apiClient'
import type { Plan, SubscriptionStatus } from '@/shared/types/domain'

export interface Subscription {
  businessId: string
  planId: string | null
  plan: Plan | null
  status: SubscriptionStatus
  trialStartedAt: string
  trialEndsAt: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  suspendedAt: string | null
  cancelledAt: string | null
}

export interface Payment {
  id: string
  planId: string | null
  amount: number
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REFUNDED'
  paidAt: string | null
  createdAt: string
}

export interface CreateCheckoutSessionPayload {
  planId: string
}

export interface CreateCheckoutSessionResponse {
  checkoutUrl: string
}

/**
 * Cada período se cobra como un pago único vía Checkout Pro: `checkout` devuelve
 * una URL de redirección (init_point) donde Mercado Pago aloja el formulario de
 * pago. `reactivate` solo deshace una cancelación pendiente antes de fin de
 * período — no cobra nada y devuelve la suscripción actualizada, sin checkoutUrl.
 */
export const billingApi = {
  getSubscription: (businessId: string) =>
    apiClient.get<Subscription>(`/businesses/${businessId}/subscription`),

  listPayments: (businessId: string) =>
    apiClient.get<Payment[]>(`/businesses/${businessId}/subscription/payments`),

  createCheckoutSession: (businessId: string, data: CreateCheckoutSessionPayload) =>
    apiClient.post<CreateCheckoutSessionResponse>(`/businesses/${businessId}/subscription/checkout`, data),

  cancelSubscription: (businessId: string) =>
    apiClient.post<Subscription>(`/businesses/${businessId}/subscription/cancel`),

  reactivateSubscription: (businessId: string) =>
    apiClient.post<Subscription>(`/businesses/${businessId}/subscription/reactivate`),
}
