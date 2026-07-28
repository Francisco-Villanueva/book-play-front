import { useMutation } from '@tanstack/react-query'
import { usersApi, type UpdateProfilePayload } from '../api/usersApi'
import { useAuthStore } from '@/features/auth/store/authStore'

export function useUpdateProfile() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => usersApi.updateMe(data),
    onSuccess: ({ data }) => {
      if (user && token) setAuth({ ...user, ...data }, token)
    },
  })
}
