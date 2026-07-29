import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PaymentModal } from '@/features/admin/components/PaymentModal'
import type { Reservation } from '@/features/admin/components/reservationTypes'
import './index.css'

const reservation: Reservation = {
  id: 'preview',
  courtId: 'c1',
  court: 'Cancha 1',
  sport: 'futbol5',
  playerName: 'Juan Pérez',
  phone: '+54 9 291 555-1234',
  date: '2026-07-25',
  dateGroup: 'Hoy',
  dayOfWeek: 'vie',
  dateLabel: '25 jul',
  start: 20,
  end: 21,
  status: 'booked',
  price: 20000,
  paymentStatus: 'PARTIAL',
  amountPaid: 8000,
  totalPlayers: 10,
  playersPaid: 4,
  paymentNotes: null,
  isRecurring: false,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <PaymentModal businessId="preview" reservation={reservation} onClose={() => {}} />
    </QueryClientProvider>
  </StrictMode>,
)
