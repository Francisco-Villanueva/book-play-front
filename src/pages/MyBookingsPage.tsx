import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarX } from 'lucide-react'
import { PlayerAppShell } from '@/features/bookings/components/PlayerAppShell'
import { AppHeader } from '@/features/bookings/components/AppHeader'
import { BookingCard } from '@/features/bookings/components/BookingCard'
import { EmptyState } from '@/shared/components/EmptyState'
import { Tabs } from '@/shared/components/Tabs'
import { useMyBookings } from '@/features/bookings/hooks/useBookings'
import { formatMoneyARS, formatShortDay, todayISO } from '@/shared/utils/date'
import type { Booking } from '@/shared/types/domain'

const MONTHS_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

function toCardProps(booking: Booking) {
  const { day } = formatShortDay(booking.date)
  const month = MONTHS_SHORT[new Date(booking.date + 'T12:00:00').getMonth()]
  return {
    court: booking.court?.name ?? 'Cancha',
    ...(booking.business?.name ? { sport: booking.business.name } : {}),
    day,
    ...(month ? { month } : {}),
    time: `${booking.startTime.slice(0, 5)} – ${booking.endTime.slice(0, 5)}`,
    status: (booking.status === 'CANCELLED' ? 'cancelled' : 'confirmed') as 'cancelled' | 'confirmed',
    ...(booking.totalPrice != null ? { price: formatMoneyARS(booking.totalPrice) } : {}),
  }
}

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('proximas')
  const { data: bookings, isLoading, isError } = useMyBookings()

  const today = todayISO()
  const upcoming = (bookings ?? []).filter((b) => b.status === 'ACTIVE' && b.date >= today)

  const tabs = [
    { key: 'proximas', label: 'Próximas', count: upcoming.length },
    { key: 'historial', label: 'Historial' },
  ]

  const filtered = tab === 'proximas' ? upcoming : (bookings ?? [])

  return (
    <PlayerAppShell>
      <AppHeader title="Mis turnos" left={<img src="/logo-mark.svg" width="34" height="34" alt="Book & Play" />} />
      <div className="flex-none px-4 bg-white border-b border-ink-100">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-3.5 md:content-start">
        {isLoading ? (
          <p className="col-span-full text-center text-body-sm text-ink-400 py-12">Cargando turnos…</p>
        ) : isError ? (
          <p className="col-span-full text-center text-body-sm text-red-600 py-12">
            No pudimos cargar tus turnos. Intentá de nuevo más tarde.
          </p>
        ) : filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={CalendarX}
              title="Sin turnos"
              description="Reservá una cancha para verla acá."
              variant="dashed"
            />
          </div>
        ) : (
          filtered.map((b) => (
            <BookingCard
              key={b.id}
              {...toCardProps(b)}
              onClick={() => navigate(`/my-bookings/${b.id}`)}
              data-testid={`booking-card-${b.id}`}
            />
          ))
        )}
      </div>
    </PlayerAppShell>
  )
}
