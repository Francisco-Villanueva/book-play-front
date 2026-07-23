export const bookingsKeys = {
  all: (businessId: string) => ['bookings', businessId] as const,
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
