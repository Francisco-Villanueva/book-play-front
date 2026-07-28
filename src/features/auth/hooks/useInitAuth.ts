import { useEffect, useState } from 'react'
import { usersApi } from '@/features/users/api/usersApi'
import { useAuthStore } from '../store/authStore'

export function useInitAuth() {
  // Synchronous initial state: restoring only when a token exists but user hasn't loaded yet
  const [isRestoring, setIsRestoring] = useState(() => {
    const { token, user } = useAuthStore.getState()
    return !!token && !user
  })

  useEffect(() => {
    const { token, user, setAuth, logout } = useAuthStore.getState()

    if (!token || user) {
      setIsRestoring(false)
      return
    }

    usersApi
      .me()
      .then(({ data }) => setAuth(data, token))
      .catch(() => logout())
      .finally(() => setIsRestoring(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps — intentional one-shot on mount

  return { isRestoring }
}
