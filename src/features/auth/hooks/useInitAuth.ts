import { useEffect, useState } from 'react'
import { authApi } from '../api/authApi'
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

    authApi
      .me()
      .then(({ data }) => setAuth(data, token))
      .catch(() => logout())
      .finally(() => setIsRestoring(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps — intentional one-shot on mount

  return { isRestoring }
}
