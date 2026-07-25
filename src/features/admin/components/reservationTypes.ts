import type { BookingPaymentStatus } from '@/shared/types/domain'

export type ReservationStatus = 'booked' | 'cancelled'

export interface Reservation {
  id: string
  courtId: string
  court: string
  sport: string
  playerName: string
  phone: string
  dateGroup: 'Hoy' | 'Mañana' | 'Ayer' | string
  dayOfWeek: string
  dateLabel: string
  start: number
  end: number
  status: ReservationStatus
  price: number
  paymentStatus: BookingPaymentStatus
  amountPaid: number | null
  totalPlayers: number | null
  playersPaid: number | null
  paymentNotes: string | null
}

export const STATUS_META: Record<ReservationStatus, { label: string; bg: string; fg: string; bd: string }> = {
  booked: { label: 'Confirmada', bg: 'var(--state-booked-bg)', fg: 'var(--state-booked-fg)', bd: 'var(--state-booked-bd)' },
  cancelled: { label: 'Cancelada', bg: 'rgba(220,38,38,.07)', fg: '#B91C1C', bd: 'rgba(220,38,38,.2)' },
}

export const PAYMENT_META: Record<BookingPaymentStatus, { label: string; short: string; bg: string; fg: string; bd: string }> = {
  UNPAID: { label: 'Sin cobrar', short: 'Sin cobrar', bg: 'var(--red-50)', fg: 'var(--red-700)', bd: 'var(--red-100)' },
  PARTIAL: { label: 'Cobro parcial', short: 'Parcial', bg: 'var(--state-pending-bg)', fg: 'var(--state-pending-fg)', bd: 'var(--state-pending-bd)' },
  PAID: { label: 'Cobrado', short: 'Cobrado', bg: 'var(--state-available-bg)', fg: 'var(--state-available-fg)', bd: 'var(--state-available-bd)' },
}

// Espejo de la derivación del backend (BR-025), para que el modal muestre el
// estado en vivo mientras el staff marca jugadores, sin ida y vuelta al servidor.
export function derivePaymentStatus(playersPaid: number, totalPlayers: number): BookingPaymentStatus {
  if (playersPaid === 0) return 'UNPAID'
  if (playersPaid >= totalPlayers) return 'PAID'
  return 'PARTIAL'
}

// Arranca la grilla en la cantidad típica del deporte para que el staff no tenga
// que ajustarla en el caso normal.
const PLAYERS_BY_SPORT: Record<string, number> = {
  futbol5: 10,
  futbol7: 14,
  futbol11: 22,
  padel: 4,
  tenis: 2,
  basquet: 10,
  voley: 12,
}

export function defaultPlayerCount(sportType?: string): number {
  const key = (sportType ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  return PLAYERS_BY_SPORT[key] ?? 4
}

// Detalle corto bajo el badge: lo que el encargado necesita para saber cuánto falta.
export function paymentDetail(r: Reservation): string | null {
  if (r.playersPaid == null || r.totalPlayers == null) return null
  return `${r.playersPaid} de ${r.totalPlayers} jugadores`
}

export function hFmt(h: number) {
  const hr = Math.floor(h)
  const mn = Math.round((h % 1) * 60)
  return `${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}`
}

export function priceLabel(n: number) {
  return `$${n.toLocaleString('es-AR')}`
}

export function durationLabel(start: number, end: number) {
  const d = end - start
  if (d === 1) return '1h'
  if (d % 1 !== 0) return `${Math.floor(d)}h ${Math.round((d % 1) * 60)}min`
  return `${d}h`
}

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
}

export const COURT_COLORS: Record<string, string> = {
  'Cancha 1': 'var(--green-500)',
  'Cancha 2': 'var(--green-500)',
  'Pádel A': 'var(--blue-500)',
  'Pádel B': 'var(--blue-500)',
  'Tenis': 'var(--amber-500)',
  'Básquet': '#e05e3d',
}
