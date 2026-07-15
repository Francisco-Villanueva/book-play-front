import { useNavigate } from 'react-router-dom'
import { ChevronLeft, SearchX } from 'lucide-react'
import { PlayerAppShell } from '@/features/bookings/components/PlayerAppShell'
import { AppHeader } from '@/features/bookings/components/AppHeader'
import { IconButton } from '@/shared/components/IconButton'
import { EmptyState } from '@/shared/components/EmptyState'

export default function BookCourtPage() {
  const navigate = useNavigate()

  return (
    <PlayerAppShell>
      <AppHeader
        title="Reservar"
        left={
          <IconButton variant="outline" onClick={() => navigate(-1)} aria-label="Volver">
            <ChevronLeft size={20} />
          </IconButton>
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <EmptyState
          icon={SearchX}
          variant="dashed"
          title="No pudimos identificar el complejo"
          description="Reservar una cancha por ID directo requiere un endpoint que resuelva a qué complejo pertenece. Usá el link de reservas que te compartió tu complejo (formato /businesses/:id/book) para completar la reserva."
          primaryAction={{ label: 'Volver', onClick: () => navigate('/dashboard') }}
        />
      </div>
    </PlayerAppShell>
  )
}
