import { apiClient } from '@/shared/lib/apiClient'
import type { Notification } from '@/shared/types/domain'

const base = (businessId: string) => `/businesses/${businessId}/notifications`

export const notificationsApi = {
  list: (businessId: string) =>
    apiClient.get<{ data: Notification[]; unreadCount: number }>(base(businessId)),

  markRead: (businessId: string, notificationId: string) =>
    apiClient.patch<Notification>(`${base(businessId)}/${notificationId}/read`),

  markAllRead: (businessId: string) =>
    apiClient.patch<{ updated: number }>(`${base(businessId)}/read-all`),
}
