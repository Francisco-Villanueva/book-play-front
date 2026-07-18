import { apiClient } from '@/shared/lib/apiClient'
import type { AvailabilityRule } from '@/shared/types/domain'

interface AvailabilityRulePayload {
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
  courtIds?: string[]
}

interface AvailabilityRulesBatchPayload {
  name?: string
  daysOfWeek: number[]
  startTime: string
  endTime: string
  courtIds?: string[]
}

export const availabilityRulesApi = {
  listByBusiness: (businessId: string) =>
    apiClient.get<AvailabilityRule[]>(`/businesses/${businessId}/availability-rules`),

  create: (businessId: string, data: AvailabilityRulePayload) =>
    apiClient.post<AvailabilityRule>(`/businesses/${businessId}/availability-rules`, data),

  createBatch: (businessId: string, data: AvailabilityRulesBatchPayload) =>
    apiClient.post<AvailabilityRule[]>(`/businesses/${businessId}/availability-rules/batch`, data),

  update: (businessId: string, ruleId: string, data: Partial<AvailabilityRulePayload>) =>
    apiClient.put<AvailabilityRule>(`/businesses/${businessId}/availability-rules/${ruleId}`, data),

  remove: (businessId: string, ruleId: string) =>
    apiClient.delete(`/businesses/${businessId}/availability-rules/${ruleId}`),
}
