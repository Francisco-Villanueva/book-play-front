export const recurringBookingsKeys = {
  // Prefijo de todo lo del negocio: invalidarlo alcanza listas y detalles.
  all: (businessId: string) => ['recurring-bookings', businessId] as const,
  list: (businessId: string) => ['recurring-bookings', businessId, 'list'] as const,
  detail: (businessId: string, seriesId: string) =>
    ['recurring-bookings', businessId, seriesId] as const,
  instances: (businessId: string, seriesId: string) =>
    ['recurring-bookings', businessId, seriesId, 'instances'] as const,
  guest: (businessId: string, seriesId: string, token: string) =>
    ['recurring-bookings', businessId, seriesId, 'guest', token] as const,
}
