import { Navigate, useParams } from 'react-router-dom'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { MobileBillingScreen } from '@/features/admin/components/mobile/MobileBillingScreen'
import { useIsMobile } from '@/shared/hooks/useMediaQuery'

// En escritorio la facturación es una pestaña de Configuración; en mobile
// necesita ruta propia para ser alcanzable desde el menú Más.
export default function AdminBillingPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const isMobile = useIsMobile()

  if (!isMobile) return <Navigate to={`/admin/${businessId}/settings`} replace />

  return (
    <AdminShell title="Plan y facturación">
      <MobileBillingScreen />
    </AdminShell>
  )
}
