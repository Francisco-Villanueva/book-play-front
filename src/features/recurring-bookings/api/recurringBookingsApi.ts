import { apiClient } from '@/shared/lib/apiClient'
import type {
  Booking,
  BookingStatus,
  RecurringBooking,
  RecurringBookingStatus,
  RecurringGenerationReport,
  RecurringPreview,
} from '@/shared/types/domain'

export interface GuestSeriesView {
  id: string
  status: RecurringBookingStatus
  businessName: string
  courtName: string
  dayOfWeek: number
  startTime: string
  instances: { id: string; date: string; status: BookingStatus }[]
}

export interface RecurringPreviewInput {
  courtId: string
  startDate: string
  startTime: string
  endDate?: string
}

export interface CreateRecurringInput extends RecurringPreviewInput {
  guestName: string
  guestPhone?: string
  guestEmail?: string
  notes?: string
}

const base = (businessId: string) => `/businesses/${businessId}/recurring-bookings`

export const recurringBookingsApi = {
  // Dry-run: devuelve las fechas de la serie con su disponibilidad, sin escribir.
  preview: (businessId: string, data: RecurringPreviewInput) =>
    apiClient.post<RecurringPreview>(`${base(businessId)}/preview`, data),

  create: (businessId: string, data: CreateRecurringInput) =>
    apiClient.post<{ series: RecurringBooking; report: RecurringGenerationReport }>(
      base(businessId),
      data,
    ),

  listByBusiness: (businessId: string) =>
    apiClient.get<RecurringBooking[]>(base(businessId)),

  getSeries: (businessId: string, seriesId: string) =>
    apiClient.get<RecurringBooking>(`${base(businessId)}/${seriesId}`),

  getInstances: (businessId: string, seriesId: string) =>
    apiClient.get<Booking[]>(`${base(businessId)}/${seriesId}/instances`),

  // Público, validado por el token del correo (sin sesión).
  getForGuest: (businessId: string, seriesId: string, token: string) =>
    apiClient.get<GuestSeriesView>(`${base(businessId)}/${seriesId}/guest`, {
      params: { token },
    }),

  // Da de baja UNA fecha, nunca la serie: el link del correo no puede costarle
  // al complejo un cliente fijo de un click.
  cancelGuestInstance: (
    businessId: string,
    seriesId: string,
    token: string,
    bookingId: string,
  ) =>
    apiClient.patch<Booking>(`${base(businessId)}/${seriesId}/guest/cancel-instance`, {
      token,
      bookingId,
    }),

  end: (businessId: string, seriesId: string, from?: string) =>
    apiClient.patch<{ series: RecurringBooking; cancelled: number }>(
      `${base(businessId)}/${seriesId}/end`,
      from ? { from } : {},
    ),
}
