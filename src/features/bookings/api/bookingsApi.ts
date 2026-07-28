import { apiClient } from '@/shared/lib/apiClient'
import type {
  AvailableSlots,
  Booking,
  BookingStatus,
  BookingPaymentStatus,
  BusinessAvailability,
  GuestCancellationInfo,
  Paginated,
} from '@/shared/types/domain'

// El backend deriva `paymentStatus` de estos dos números (BR-025).
export interface UpdateBookingPaymentInput {
  totalPlayers: number
  playersPaid: number
  amountPaid?: number
  paymentNotes?: string
}

export interface BookingFilters {
  date?: string
  dateFrom?: string
  dateTo?: string
  courtId?: string
  status?: BookingStatus
  paymentStatus?: BookingPaymentStatus[]
  q?: string
  page?: number
  limit?: number
  sort?: 'asc' | 'desc'
}

// Espeja BOOKINGS_PAGE_SIZE_MAX del backend: pedir más que esto no trae más filas.
export const BOOKINGS_MAX_PAGE_SIZE = 200

// Tope de seguridad para listAllByBusiness: 10.000 reservas es más de lo que
// cualquier vista agregada necesita. Si se alcanza, el filtro está mal acotado.
const MAX_PAGES_FETCHED = 50

// El backend espera paymentStatus como lista separada por comas; el serializador
// por defecto de axios mandaría `paymentStatus[]=UNPAID`, que no matchea.
function toParams({ paymentStatus, ...rest }: BookingFilters): Record<string, unknown> {
  return paymentStatus?.length
    ? { ...rest, paymentStatus: paymentStatus.join(',') }
    : rest
}

export const bookingsApi = {
  listByBusiness: (businessId: string, filters: BookingFilters = {}) =>
    apiClient.get<Paginated<Booking>>(`/businesses/${businessId}/bookings`, {
      params: toParams(filters),
    }),

  // Para las vistas que agregan sobre un rango entero (agenda, semana, dashboard,
  // clientes) y no pueden trabajar con una página suelta. Recorre las páginas del
  // rango pedido: el endpoint sigue acotado y el server nunca hace un scan sin límite.
  listAllByBusiness: async (
    businessId: string,
    filters: Omit<BookingFilters, 'page' | 'limit'> = {},
  ): Promise<Booking[]> => {
    const base = toParams(filters)
    const all: Booking[] = []
    let page = 1
    let totalPages = 1

    do {
      const { data } = await apiClient.get<Paginated<Booking>>(
        `/businesses/${businessId}/bookings`,
        { params: { ...base, page, limit: BOOKINGS_MAX_PAGE_SIZE } },
      )
      all.push(...data.data)
      totalPages = data.meta.totalPages
      page += 1
    } while (page <= totalPages && page <= MAX_PAGES_FETCHED)

    return all
  },

  listMine: () => apiClient.get<Booking[]>('/users/me/bookings'),

  getBooking: (businessId: string, bookingId: string) =>
    apiClient.get<Booking>(`/businesses/${businessId}/bookings/${bookingId}`),

  getMine: (bookingId: string) => apiClient.get<Booking>(`/users/me/bookings/${bookingId}`),

  cancelMine: (bookingId: string) =>
    apiClient.patch<Booking>(`/users/me/bookings/${bookingId}/cancel`),

  getAvailability: (businessId: string, courtId: string, date: string) =>
    apiClient.get<AvailableSlots>(`/businesses/${businessId}/bookings/availability`, {
      params: { courtId, date },
    }),

  getBusinessAvailability: (businessId: string, date: string) =>
    apiClient.get<BusinessAvailability>(`/businesses/${businessId}/bookings/availability/all`, {
      params: { date },
    }),

  createBooking: (
    businessId: string,
    data: {
      courtId: string
      date: string
      startTime: string
      guestName?: string
      guestPhone?: string
      guestEmail?: string
      notes?: string
    },
  ) => apiClient.post<Booking>(`/businesses/${businessId}/bookings`, data),

  cancelBooking: (businessId: string, bookingId: string) =>
    apiClient.patch<Booking>(`/businesses/${businessId}/bookings/${bookingId}/cancel`),

  updatePayment: (businessId: string, bookingId: string, data: UpdateBookingPaymentInput) =>
    apiClient.patch<Booking>(`/businesses/${businessId}/bookings/${bookingId}/payment`, data),

  getGuestCancellation: (businessId: string, bookingId: string, token: string) =>
    apiClient.get<GuestCancellationInfo>(
      `/businesses/${businessId}/bookings/${bookingId}/guest-cancellation`,
      { params: { token } },
    ),

  cancelGuestBooking: (businessId: string, bookingId: string, token: string) =>
    apiClient.patch<Booking>(
      `/businesses/${businessId}/bookings/${bookingId}/guest-cancellation`,
      { token },
    ),
}
