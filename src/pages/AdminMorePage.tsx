import { Navigate, useParams } from 'react-router-dom'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { MobileMoreScreen } from '@/features/admin/components/mobile/MobileMoreScreen'
import { useIsMobile } from '@/shared/hooks/useMediaQuery'

// El menú "Más" sólo existe en el shell mobile: en escritorio esas secciones
// viven en el sidebar, así que la ruta vuelve al resumen.
export default function AdminMorePage() {
  const { businessId } = useParams<{ businessId: string }>()
  const isMobile = useIsMobile()

  if (!isMobile) return <Navigate to={`/admin/${businessId}`} replace />

  return (
    <AdminShell title="Más">
      <MobileMoreScreen />
    </AdminShell>
  )
}
