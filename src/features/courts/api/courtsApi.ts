import { apiClient } from '@/shared/lib/apiClient'
import type { Court } from '@/shared/types/domain'

export interface CourtPayload {
  name: string
  sportType?: string | undefined
  surface?: string | undefined
  capacity?: number | undefined
  isIndoor?: boolean | undefined
  hasLighting?: boolean | undefined
  pricePerHour?: number | undefined
  description?: string | undefined
  isActive?: boolean | undefined
}

export const courtsApi = {
  listByBusiness: (businessId: string) =>
    apiClient.get<Court[]>(`/businesses/${businessId}/courts`),

  getCourt: (businessId: string, courtId: string) =>
    apiClient.get<Court>(`/businesses/${businessId}/courts/${courtId}`),

  createCourt: (businessId: string, data: CourtPayload) =>
    apiClient.post<Court>(`/businesses/${businessId}/courts`, data),

  updateCourt: (businessId: string, courtId: string, data: Partial<CourtPayload>) =>
    apiClient.patch<Court>(`/businesses/${businessId}/courts/${courtId}`, data),

  deleteCourt: (businessId: string, courtId: string) =>
    apiClient.delete(`/businesses/${businessId}/courts/${courtId}`),
}
