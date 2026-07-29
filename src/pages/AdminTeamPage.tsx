import { Navigate, useParams } from 'react-router-dom'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { MobileTeamScreen } from '@/features/admin/components/mobile/MobileTeamScreen'
import { useIsMobile } from '@/shared/hooks/useMediaQuery'

// En escritorio el equipo es una pestaña de Configuración; en mobile necesita
// ruta propia para ser alcanzable desde el menú Más.
export default function AdminTeamPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const isMobile = useIsMobile()

  if (!isMobile) return <Navigate to={`/admin/${businessId}/settings`} replace />

  return (
    <AdminShell title="Equipo y usuarios">
      <MobileTeamScreen />
    </AdminShell>
  )
}
