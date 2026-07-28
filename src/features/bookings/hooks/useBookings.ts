import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, type BookingFilters, type UpdateBookingPaymentInput } from '../api/bookingsApi'
import { bookingsKeys } from '../api/bookingsKeys'

type BookingRangeFilters = Omit<BookingFilters, 'page' | 'limit'>

// Devuelve el rango completo ya aplanado, para las vistas que agregan sobre él.
// El rango es obligatorio en la práctica: sin filtros de fecha esto recorre todo
// el historial del complejo, que es justamente lo que queremos evitar.
export function useBookings(
  businessId: string | undefined,
  filters: BookingRangeFilters = {},
) {
  return useQuery({
    queryKey: bookingsKeys.list(businessId ?? '', filters),
    queryFn: () => bookingsApi.listAllByBusiness(businessId!, filters),
    enabled: !!businessId,
  })
}

// Una página suelta, para las tablas que paginan del lado del servidor.
export function useBookingsPage(
  businessId: string | undefined,
  filters: BookingFilters = {},
) {
  return useQuery({
    queryKey: bookingsKeys.page(businessId ?? '', filters),
    queryFn: () => bookingsApi.listByBusiness(businessId!, filters).then((res) => res.data),
    enabled: !!businessId,
    // Evita el parpadeo a "cargando" al cambiar de página o de filtro.
    placeholderData: keepPreviousData,
  })
}

export function useMyBookings() {
  return useQuery({
    queryKey: bookingsKeys.mine,
    queryFn: () => bookingsApi.listMine().then((res) => res.data),
  })
}

export function useMyBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: bookingsKeys.mineDetail(bookingId ?? ''),
    queryFn: () => bookingsApi.getMine(bookingId!).then((res) => res.data),
    enabled: !!bookingId,
  })
}

export function useCancelMyBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.cancelMine(bookingId),
    onSuccess: (_res, bookingId) => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.mine })
      queryClient.invalidateQueries({ queryKey: bookingsKeys.mineDetail(bookingId) })
    },
  })
}

export function useAvailability(businessId: string | undefined, courtId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: bookingsKeys.availability(businessId ?? '', courtId ?? '', date ?? ''),
    queryFn: () => bookingsApi.getAvailability(businessId!, courtId!, date!).then((res) => res.data),
    enabled: !!businessId && !!courtId && !!date,
    staleTime: 0,
  })
}

interface CreateBookingInput {
  courtId: string
  date: string
  startTime: string
  guestName?: string
  guestPhone?: string
  guestEmail?: string
  notes?: string
}

export function useCreateBooking(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBookingInput) => bookingsApi.createBooking(businessId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingsKeys.all(businessId) }),
  })
}

export function useCancelBooking(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.cancelBooking(businessId, bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingsKeys.all(businessId) }),
  })
}

export function useUpdateBookingPayment(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, ...data }: UpdateBookingPaymentInput & { bookingId: string }) =>
      bookingsApi.updatePayment(businessId, bookingId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingsKeys.all(businessId) }),
  })
}

export function useGuestCancellation(
  businessId: string | undefined,
  bookingId: string | undefined,
  token: string | undefined,
) {
  return useQuery({
    queryKey: bookingsKeys.guestCancellation(businessId ?? '', bookingId ?? '', token ?? ''),
    queryFn: () => bookingsApi.getGuestCancellation(businessId!, bookingId!, token!).then((res) => res.data),
    enabled: !!businessId && !!bookingId && !!token,
    retry: false,
  })
}

export function useCancelGuestBooking(businessId: string | undefined, bookingId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => bookingsApi.cancelGuestBooking(businessId!, bookingId!, token),
    onSuccess: (_res, token) => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.guestCancellation(businessId!, bookingId!, token) })
    },
  })
}
