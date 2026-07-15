import { apiClient } from '@/shared/lib/apiClient'
import type { Plan } from '@/shared/types/domain'

export interface PlanFormPayload {
  name: string
  code: string
  description?: string | undefined
  priceArs: number
  courtsLimit?: number | undefined
  staffLimit?: number | undefined
  featureKeys: string[]
  isPubliclyVisible?: boolean | undefined
  sortOrder?: number | undefined
}

export const plansApi = {
  listPublicPlans: () => apiClient.get<Plan[]>('/plans'),

  listMasterPlans: () => apiClient.get<Plan[]>('/master/plans'),

  getMasterPlan: (planId: string) => apiClient.get<Plan>(`/master/plans/${planId}`),

  createPlan: (data: PlanFormPayload) => apiClient.post<Plan>('/master/plans', data),

  updatePlan: (planId: string, data: Partial<PlanFormPayload>) =>
    apiClient.patch<Plan>(`/master/plans/${planId}`, data),

  archivePlan: (planId: string) => apiClient.post<Plan>(`/master/plans/${planId}/archive`),

  restorePlan: (planId: string) => apiClient.post<Plan>(`/master/plans/${planId}/restore`),

  syncPlanWithMercadoPago: (planId: string) =>
    apiClient.post<Plan>(`/master/plans/${planId}/sync-mercadopago`),

  deletePlan: (planId: string) => apiClient.delete<void>(`/master/plans/${planId}`),
}
