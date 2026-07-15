import { Outlet } from 'react-router-dom'
import { useInitAuth } from '@/features/auth/hooks/useInitAuth'

export function AppInitializer() {
  const { isRestoring } = useInitAuth()

  if (isRestoring) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-page)',
        }}
      >
        <img src="/logo-wordmark.svg" height="32" alt="Book & Play" />
      </div>
    )
  }

  return <Outlet />
}
