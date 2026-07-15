import { ScrollText } from 'lucide-react'
import { MasterShell } from '@/features/master/components/MasterShell'
import { EmptyState } from '@/shared/components/EmptyState'

export default function MasterLogsPage() {
  return (
    <MasterShell title="Audit logs" subtitle="Historial de acciones">
      <EmptyState
        icon={ScrollText}
        variant="dashed"
        title="Todavía no disponible"
        description="El backend no registra un historial de auditoría (quién hizo qué y cuándo). Ver MISSING_BACKEND_ENDPOINTS.md en la raíz del proyecto para el detalle."
      />
    </MasterShell>
  )
}
