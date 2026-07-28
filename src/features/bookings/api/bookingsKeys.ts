import type { BookingFilters } from './bookingsApi'

export const bookingsKeys = {
  // Prefijo de todas las listas del negocio: invalidarlo alcanza cualquier
  // combinación de filtros, así que las mutaciones no necesitan conocerlos.
  all: (businessId: string) => ['bookings', businessId] as const,
  list: (businessId: string, filters: Omit<BookingFilters, 'page' | 'limit'>) =>
    ['bookings', businessId, 'list', filters] as const,
  page: (businessId: string, filters: BookingFilters) =>
    ['bookings', businessId, 'page', filters] as const,
  mine: ['bookings', 'mine'] as const,
  mineDetail: (bookingId: string) => ['bookings', 'mine', bookingId] as const,
  detail: (businessId: string, bookingId: string) => ['bookings', businessId, bookingId] as const,
  availability: (businessId: string, courtId: string, date: string) =>
    ['bookings', businessId, 'availability', courtId, date] as const,
  businessAvailability: (businessId: string, date: string) =>
    ['bookings', businessId, 'availability', 'all', date] as const,
  guestCancellation: (businessId: string, bookingId: string, token: string) =>
    ['bookings', businessId, bookingId, 'guest-cancellation', token] as const,
}
