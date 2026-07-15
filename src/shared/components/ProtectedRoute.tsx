import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { GlobalRole } from '@/shared/types/domain'

interface Props {
  allowedRoles?: GlobalRole[]
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.globalRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
