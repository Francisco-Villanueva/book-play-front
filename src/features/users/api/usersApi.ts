import { apiClient } from '@/shared/lib/apiClient'
import type { User } from '@/shared/types/domain'

export interface UpdateProfilePayload {
  name?: string
  phone?: string
}

export interface UserPreferences {
  /** Correos de confirmación y cancelación de reserva. */
  notifyBookings: boolean
}

export const usersApi = {
  // /users/me (not /auth/me) is the endpoint that also resolves the user's business
  // memberships — required to know whether a PLAYER also administers a business.
  me: () =>
    apiClient
      .get<{ user: User }>('/users/me')
      .then((response) => ({ ...response, data: response.data.user })),

  // The response omits `businesses` — merge it over the stored user, never replace it.
  updateMe: (data: UpdateProfilePayload) =>
    apiClient
      .patch<{ user: User }>('/users/me', data)
      .then((response) => ({ ...response, data: response.data.user })),

  preferences: () =>
    apiClient
      .get<{ preferences: UserPreferences }>('/users/me/preferences')
      .then((response) => ({ ...response, data: response.data.preferences })),

  updatePreferences: (data: Partial<UserPreferences>) =>
    apiClient
      .patch<{ preferences: UserPreferences }>('/users/me/preferences', data)
      .then((response) => ({ ...response, data: response.data.preferences })),
}
