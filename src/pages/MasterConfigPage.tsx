import { Settings2 } from 'lucide-react'
import { MasterShell } from '@/features/master/components/MasterShell'
import { EmptyState } from '@/shared/components/EmptyState'

export default function MasterConfigPage() {
  return (
    <MasterShell title="Configuración" subtitle="Ajustes globales del SaaS">
      <EmptyState
        icon={Settings2}
        variant="dashed"
        title="Todavía no disponible"
        description="No hay backend para configuración de plataforma, planes editables, equipo interno MASTER ni integraciones. Ver MISSING_BACKEND_ENDPOINTS.md en la raíz del proyecto para el detalle."
      />
    </MasterShell>
  )
}
