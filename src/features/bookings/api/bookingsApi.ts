import { apiClient } from '@/shared/lib/apiClient'
import type { AvailableSlots, Booking } from '@/shared/types/domain'

export const bookingsApi = {
  listByBusiness: (businessId: string) =>
    apiClient.get<Booking[]>(`/businesses/${businessId}/bookings`),

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
}
