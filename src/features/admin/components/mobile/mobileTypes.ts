import type { BookingPaymentStatus } from '@/shared/types/domain'
import type { AgendaBooking, AgendaCourt } from '../agendaTypes'

export interface MobileBooking extends AgendaBooking {
  price: number | null
  paymentStatus: BookingPaymentStatus | null
  totalPlayers: number | null
  playersPaid: number | null
  paymentNotes: string | null
  // Sólo en los bloqueos: la regla de excepción que los genera, para poder quitarla.
  exceptionRuleId?: string | undefined
}

export interface CellState {
  bg: string
  bd: string
  fg: string
  dot: string
  label: string
}

// El color nunca es el único portador de significado: cada celda lleva también
// su texto, porque en mobile no hay lugar para una leyenda.
export const CELL_STATE: Record<'free' | 'booked' | 'blocked', CellState> = {
  free: {
    bg: 'var(--surface-card)',
    bd: 'var(--border-subtle)',
    fg: 'var(--text-subtle)',
    dot: 'var(--ink-300)',
    label: 'Libre',
  },
  booked: {
    bg: 'var(--state-booked-bg)',
    bd: 'var(--state-booked-bd)',
    fg: 'var(--state-booked-fg)',
    dot: 'var(--green-500)',
    label: 'Ocupado',
  },
  blocked: {
    bg: 'var(--state-blocked-bg)',
    bd: 'var(--state-blocked-bd)',
    fg: 'var(--state-blocked-fg)',
    dot: 'var(--ink-400)',
    label: 'Bloqueado',
  },
}

export function cellStateOf(booking: MobileBooking | null): CellState {
  if (!booking) return CELL_STATE.free
  return booking.st === 'blocked' ? CELL_STATE.blocked : CELL_STATE.booked
}

// La reserva que ocupa la franja [h, h+1) de una cancha. Las reservas reales no
// caen siempre en horas enteras (slotDuration es por cancha), así que se busca
// por solapamiento y una de 90' aparece en las dos franjas que toca.
export function bookingAt(bookings: MobileBooking[], courtId: string, h: number): MobileBooking | null {
  return bookings.find((b) => b.cid === courtId && b.s < h + 1 && b.e > h) ?? null
}

export function freeCountAt(bookings: MobileBooking[], courts: AgendaCourt[], h: number): number {
  return courts.filter((c) => !bookingAt(bookings, c.id, h)).length
}

export function firstName(name: string): string {
  return name.split(' ')[0] ?? name
}

// Etiqueta corta para la celda: "Cancha 1" → "C1", "Pádel A" → "PA".
export function shortCourtName(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return (words[0] ?? '').slice(0, 3).toUpperCase()
  return words
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

export function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/549${digits}`
}

export function telHref(phone: string): string {
  return `tel:+549${phone.replace(/\D/g, '')}`
}
