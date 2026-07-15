import { apiClient } from '@/shared/lib/apiClient'
import type { ExceptionRule } from '@/shared/types/domain'

interface ExceptionRulePayload {
  date: string
  startTime?: string
  endTime?: string
  isAvailable: boolean
  reason?: string
  courtIds?: string[]
}

export const exceptionRulesApi = {
  listByBusiness: (businessId: string) =>
    apiClient.get<ExceptionRule[]>(`/businesses/${businessId}/exception-rules`),

  create: (businessId: string, data: ExceptionRulePayload) =>
    apiClient.post<ExceptionRule>(`/businesses/${businessId}/exception-rules`, data),

  update: (businessId: string, ruleId: string, data: Partial<ExceptionRulePayload>) =>
    apiClient.put<ExceptionRule>(`/businesses/${businessId}/exception-rules/${ruleId}`, data),

  remove: (businessId: string, ruleId: string) =>
    apiClient.delete(`/businesses/${businessId}/exception-rules/${ruleId}`),
}
