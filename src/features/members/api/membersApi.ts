import { apiClient } from '@/shared/lib/apiClient'
import type { BusinessMember, BusinessRole, InvitationPreview } from '@/shared/types/domain'

export interface InviteByEmailPayload {
  email: string
  role: BusinessRole
}

export const membersApi = {
  listByBusiness: (businessId: string) =>
    apiClient.get<BusinessMember[]>(`/businesses/${businessId}/members`),

  // El backend no permite invitar por userId desde el panel: el alta siempre pasa
  // por un mail con token, así el invitado acepta desde su propia cuenta.
  inviteByEmail: (businessId: string, data: InviteByEmailPayload) =>
    apiClient.post<{ email: string; role: BusinessRole; expiresAt: string }>(
      `/businesses/${businessId}/members/invitations`,
      data,
    ),

  updateRole: (businessId: string, userId: string, role: BusinessRole) =>
    apiClient.patch<BusinessMember>(`/businesses/${businessId}/members/${userId}`, { role }),

  remove: (businessId: string, userId: string) =>
    apiClient.delete(`/businesses/${businessId}/members/${userId}`),

  getInvitation: (token: string) =>
    apiClient.get<InvitationPreview>(`/invitations/${token}`),

  acceptInvitation: (token: string) =>
    apiClient.post<BusinessMember>(`/invitations/${token}/accept`),
}
