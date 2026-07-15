import { FlaskConical } from 'lucide-react'
import { MasterShell } from '@/features/master/components/MasterShell'
import { EmptyState } from '@/shared/components/EmptyState'

export default function MasterFeaturesPage() {
  return (
    <MasterShell title="Feature flags" subtitle="Configuración global">
      <EmptyState
        icon={FlaskConical}
        variant="dashed"
        title="Todavía no disponible"
        description="El backend no expone un módulo de feature flags por negocio (BusinessFeature). Ver MISSING_BACKEND_ENDPOINTS.md en la raíz del proyecto para el detalle."
      />
    </MasterShell>
  )
}
