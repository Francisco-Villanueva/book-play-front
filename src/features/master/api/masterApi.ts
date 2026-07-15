import { apiClient } from '@/shared/lib/apiClient'
import type { BusinessRole } from '@/shared/types/domain'

export interface MasterBusinessSummary {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  timezone: string
  slotDuration: number
  courtsCount: number
  membersCount: number
  createdAt: string
}

export interface MasterBusinessDetail {
  id: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  timezone: string
  slotDuration: number
  createdAt: string
  updatedAt: string
  courts: {
    id: string
    name: string
    sportType: string | null
    surface: string | null
    isIndoor: boolean
    hasLighting: boolean
    pricePerHour: number | null
  }[]
  members: { id: string; name: string; email: string; role: BusinessRole }[]
}

export interface MasterUser {
  id: string
  name: string
  email: string
  phone: string | null
  globalRole: 'MASTER' | 'PLAYER'
  createdAt: string
  businessesCount: number
  businesses: { id: string; name: string; role: BusinessRole }[]
}

export const masterApi = {
  listBusinesses: () => apiClient.get<MasterBusinessSummary[]>('/master/businesses'),
  getBusiness: (businessId: string) => apiClient.get<MasterBusinessDetail>(`/master/businesses/${businessId}`),
  listUsers: () => apiClient.get<MasterUser[]>('/master/users'),
}
