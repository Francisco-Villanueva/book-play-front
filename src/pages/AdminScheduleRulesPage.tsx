import { Navigate, useParams } from 'react-router-dom'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { MobileScheduleRulesScreen } from '@/features/admin/components/mobile/MobileScheduleRulesScreen'
import { useIsMobile } from '@/shared/hooks/useMediaQuery'

// En escritorio los horarios y las excepciones son pestañas de Configuración;
// en mobile necesitan pantalla propia para ser alcanzables desde el menú Más.
export default function AdminScheduleRulesPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const isMobile = useIsMobile()

  if (!isMobile) return <Navigate to={`/admin/${businessId}/settings`} replace />

  return (
    <AdminShell title="Horarios y excepciones">
      <MobileScheduleRulesScreen />
    </AdminShell>
  )
}
