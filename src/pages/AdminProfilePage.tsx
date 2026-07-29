import { Navigate, useParams } from 'react-router-dom'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { MobileProfileScreen } from '@/features/admin/components/mobile/MobileProfileScreen'
import { useIsMobile } from '@/shared/hooks/useMediaQuery'

// El perfil del administrador vive dentro del shell del complejo: entrar acá no
// puede expulsar a la app del jugador, que tiene otra navegación y no vuelve.
export default function AdminProfilePage() {
  const { businessId } = useParams<{ businessId: string }>()
  const isMobile = useIsMobile()

  if (!isMobile) return <Navigate to={`/admin/${businessId}`} replace />

  return (
    <AdminShell title="Mi perfil">
      <MobileProfileScreen />
    </AdminShell>
  )
}
