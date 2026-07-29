import { useParams } from 'react-router-dom'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { RecurringSeriesScreen } from '@/features/recurring-bookings/components/RecurringSeriesScreen'
import { useRecurringBookings } from '@/features/recurring-bookings/hooks/useRecurringBookings'

export default function AdminRecurringPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { data } = useRecurringBookings(businessId)
  const active = (data ?? []).filter((s) => s.status === 'ACTIVE').length

  return (
    <AdminShell
      title="Turnos fijos"
      subtitle={`${active} ${active === 1 ? 'turno fijo activo' : 'turnos fijos activos'}`}
    >
      <RecurringSeriesScreen businessId={businessId ?? ''} />
    </AdminShell>
  )
}
