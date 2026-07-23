import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../api/bookingsApi'
import { bookingsKeys } from '../api/bookingsKeys'

export function useBookings(businessId: string | undefined) {
  return useQuery({
    queryKey: bookingsKeys.all(businessId ?? ''),
    queryFn: () => bookingsApi.listByBusiness(businessId!).then((res) => res.data),
    enabled: !!businessId,
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
