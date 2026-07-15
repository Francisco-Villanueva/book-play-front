import { apiClient } from '@/shared/lib/apiClient'
import type { Business, BusinessSearchResult } from '@/shared/types/domain'

interface CreateBusinessPayload {
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  timezone: string
  slotDuration: number
}

interface CreateBusinessResponse {
  business: Pick<Business, 'id' | 'name' | 'createdAt'>
}

interface UpdateBusinessPayload {
  name?: string
  description?: string
  address?: string
  phone?: string
  email?: string
  timezone?: string
  slotDuration?: number
}

interface UpdateBusinessResponse {
  business: Pick<Business, 'id' | 'name'> & { updatedAt: string }
}

export const businessesApi = {
  list: () => apiClient.get<Business[]>('/businesses'),

  search: (q?: string) =>
    apiClient.get<BusinessSearchResult[]>('/businesses/search', { params: q ? { q } : {} }),

  getById: (businessId: string) => apiClient.get<Business>(`/businesses/${businessId}`),

  create: (data: CreateBusinessPayload) =>
    apiClient.post<CreateBusinessResponse>('/businesses', data),

  update: (businessId: string, data: UpdateBusinessPayload) =>
    apiClient.patch<UpdateBusinessResponse>(`/businesses/${businessId}`, data),
}
