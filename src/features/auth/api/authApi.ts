import { apiClient } from '@/shared/lib/apiClient'
import type { User } from '@/shared/types/domain'

interface AuthResponse {
  accessToken: string
  user: User
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { username: email, password }),

  register: (name: string, userName: string, email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/register', { name, userName, email, password }),

  // /users/me (not /auth/me) is the endpoint that also resolves the user's business
  // memberships — required to know whether a PLAYER also administers a business.
  me: () =>
    apiClient
      .get<{ user: User }>('/users/me')
      .then((response) => ({ ...response, data: response.data.user })),

  // Always resolves 200 with a generic message, exista o no la cuenta.
  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword }),
}
