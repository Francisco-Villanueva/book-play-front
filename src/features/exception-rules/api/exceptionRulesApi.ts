import { apiClient } from '@/shared/lib/apiClient'
import type { AffectedBooking, ExceptionRule } from '@/shared/types/domain'

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

  // Qué reservas se caen si se aplica el bloqueo. Se consulta ANTES de crearlo:
  // crear la excepción las cancela y les manda un correo (BR-029).
  previewImpact: (businessId: string, data: ExceptionRulePayload) =>
    apiClient.post<{ total: number; bookings: AffectedBooking[] }>(
      `/businesses/${businessId}/exception-rules/preview-impact`,
      data,
    ),

  create: (businessId: string, data: ExceptionRulePayload) =>
    apiClient.post<ExceptionRule>(`/businesses/${businessId}/exception-rules`, data),

  update: (businessId: string, ruleId: string, data: Partial<ExceptionRulePayload>) =>
    apiClient.put<ExceptionRule>(`/businesses/${businessId}/exception-rules/${ruleId}`, data),

  remove: (businessId: string, ruleId: string) =>
    apiClient.delete(`/businesses/${businessId}/exception-rules/${ruleId}`),
}
