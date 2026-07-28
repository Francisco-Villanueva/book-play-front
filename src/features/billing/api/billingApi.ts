import { apiClient } from '@/shared/lib/apiClient'
import type { Plan, SubscriptionStatus } from '@/shared/types/domain'

export type AccessLevel = 'FULL' | 'READ_ONLY'

/**
 * El motivo del bloqueo (trial vencido, falta de pago, baja voluntaria) no le
 * importa a la UI: sólo el nivel de acceso y cuánto falta para el vencimiento.
 * El backend los deriva para que el cliente no reinterprete el enum de estado.
 */
export interface SubscriptionAccess {
  accessLevel: AccessLevel
  expiresAt: string | null
  daysUntilExpiry: number | null
}

export interface Subscription extends SubscriptionAccess {
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

  // Disponible para OWNER, ADMIN y STAFF — el detalle de facturación sigue
  // siendo sólo del OWNER, pero el aviso de vencimiento lo necesitan todos.
  getAccess: (businessId: string) =>
    apiClient.get<SubscriptionAccess>(`/businesses/${businessId}/subscription/access`),

  listPayments: (businessId: string) =>
    apiClient.get<Payment[]>(`/businesses/${businessId}/subscription/payments`),

  createCheckoutSession: (businessId: string, data: CreateCheckoutSessionPayload) =>
    apiClient.post<CreateCheckoutSessionResponse>(`/businesses/${businessId}/subscription/checkout`, data),

  cancelSubscription: (businessId: string) =>
    apiClient.post<Subscription>(`/businesses/${businessId}/subscription/cancel`),

  reactivateSubscription: (businessId: string) =>
    apiClient.post<Subscription>(`/businesses/${businessId}/subscription/reactivate`),
}
