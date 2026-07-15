import { apiClient } from '@/shared/lib/apiClient'

export interface MrrPoint {
  month: string
  mrr: number
}

export interface Transaction {
  id: string
  amount: number
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REFUNDED'
  paidAt: string | null
  business: { id: string; name: string } | null
  plan: { id: string; name: string } | null
}

export const masterBillingApi = {
  getMrr: (months = 6) => apiClient.get<MrrPoint[]>('/master/metrics/mrr', { params: { months } }),

  listTransactions: (params: { status?: string; limit?: number } = {}) =>
    apiClient.get<Transaction[]>('/master/transactions', { params }),

  reactivateAccountSubscription: (businessId: string, extendTrialDays?: number) =>
    apiClient.post(`/master/businesses/${businessId}/subscription/reactivate`, { extendTrialDays }),
}
