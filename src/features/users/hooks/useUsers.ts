import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  usersApi,
  type UpdateProfilePayload,
  type UserPreferences,
} from '../api/usersApi'
import { usersKeys } from '../api/usersKeys'
import { useAuthStore } from '@/features/auth/store/authStore'
import { flashToast } from '@/shared/store/toastStore'

export function useUpdateProfile() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    meta: { inlineError: true },
    mutationFn: (data: UpdateProfilePayload) => usersApi.updateMe(data),
    onSuccess: ({ data }) => {
      if (user && token) setAuth({ ...user, ...data }, token)
    },
  })
}

export function usePreferences() {
  return useQuery({
    queryKey: usersKeys.preferences,
    queryFn: () => usersApi.preferences().then((res) => res.data),
  })
}

// Optimista: un switch que espera al servidor para moverse se siente roto. Si el
// PATCH falla se revierte, y el handler global de `queryClient` muestra el error.
export function useUpdatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<UserPreferences>) => usersApi.updatePreferences(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: usersKeys.preferences })
      const previous = queryClient.getQueryData<UserPreferences>(usersKeys.preferences)
      if (previous) {
        queryClient.setQueryData<UserPreferences>(usersKeys.preferences, {
          ...previous,
          ...data,
        })
      }
      return { previous }
    },
    onError: (_error, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData<UserPreferences>(usersKeys.preferences, context.previous)
      }
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData<UserPreferences>(usersKeys.preferences, data)
      flashToast('Preferencia guardada')
    },
  })
}
