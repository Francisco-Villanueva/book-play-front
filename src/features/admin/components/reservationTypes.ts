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
}

export const STATUS_META: Record<ReservationStatus, { label: string; bg: string; fg: string; bd: string }> = {
  booked: { label: 'Confirmada', bg: 'var(--state-booked-bg)', fg: 'var(--state-booked-fg)', bd: 'var(--state-booked-bd)' },
  cancelled: { label: 'Cancelada', bg: 'rgba(220,38,38,.07)', fg: '#B91C1C', bd: 'rgba(220,38,38,.2)' },
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
