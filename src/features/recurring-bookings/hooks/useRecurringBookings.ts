import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsKeys } from '@/features/bookings/api/bookingsKeys'
import {
  recurringBookingsApi,
  type CreateRecurringInput,
  type RecurringPreviewInput,
} from '../api/recurringBookingsApi'
import { recurringBookingsKeys } from '../api/recurringBookingsKeys'

export function useRecurringBookings(businessId: string | undefined) {
  return useQuery({
    queryKey: recurringBookingsKeys.list(businessId ?? ''),
    queryFn: () => recurringBookingsApi.listByBusiness(businessId!).then((r) => r.data),
    enabled: !!businessId,
  })
}

export function useRecurringBooking(
  businessId: string | undefined,
  seriesId: string | undefined,
) {
  return useQuery({
    queryKey: recurringBookingsKeys.detail(businessId ?? '', seriesId ?? ''),
    queryFn: () => recurringBookingsApi.getSeries(businessId!, seriesId!).then((r) => r.data),
    enabled: !!businessId && !!seriesId,
  })
}

export function useRecurringInstances(
  businessId: string | undefined,
  seriesId: string | undefined,
) {
  return useQuery({
    queryKey: recurringBookingsKeys.instances(businessId ?? '', seriesId ?? ''),
    queryFn: () => recurringBookingsApi.getInstances(businessId!, seriesId!).then((r) => r.data),
    enabled: !!businessId && !!seriesId,
  })
}

export function useResendGuestLink(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { inlineError: true },
    mutationFn: ({ seriesId, email }: { seriesId: string; email?: string }) =>
      recurringBookingsApi.resendLink(businessId, seriesId, email).then((r) => r.data),
    // Puede haber cargado un correo que antes no estaba.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: recurringBookingsKeys.all(businessId) }),
  })
}

// --- Acceso del cliente sin cuenta, desde el link del correo ---

export function useGuestSeries(
  businessId: string | undefined,
  seriesId: string | undefined,
  token: string | undefined,
) {
  return useQuery({
    queryKey: recurringBookingsKeys.guest(businessId ?? '', seriesId ?? '', token ?? ''),
    queryFn: () =>
      recurringBookingsApi.getForGuest(businessId!, seriesId!, token!).then((r) => r.data),
    enabled: !!businessId && !!seriesId && !!token,
    retry: false,
  })
}

export function useCancelGuestInstance(
  businessId: string | undefined,
  seriesId: string | undefined,
  token: string | undefined,
) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { inlineError: true },
    mutationFn: (bookingId: string) =>
      recurringBookingsApi.cancelGuestInstance(businessId!, seriesId!, token!, bookingId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: recurringBookingsKeys.guest(businessId!, seriesId!, token!),
      }),
  })
}

// Es una mutation y no una query porque el dry-run se dispara al confirmar el
// paso, no al tipear: evaluar 12 fechas son 12 chequeos de disponibilidad.
export function usePreviewRecurring(businessId: string) {
  return useMutation({
    meta: { inlineError: true },
    mutationFn: (data: RecurringPreviewInput) =>
      recurringBookingsApi.preview(businessId, data).then((r) => r.data),
  })
}

export function useCreateRecurring(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { inlineError: true },
    mutationFn: (data: CreateRecurringInput) =>
      recurringBookingsApi.create(businessId, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringBookingsKeys.all(businessId) })
      // La serie materializa reservas: la agenda y los listados quedan viejos.
      queryClient.invalidateQueries({ queryKey: bookingsKeys.all(businessId) })
    },
  })
}

export function useEndRecurring(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { inlineError: true },
    mutationFn: ({ seriesId, from }: { seriesId: string; from?: string }) =>
      recurringBookingsApi.end(businessId, seriesId, from).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringBookingsKeys.all(businessId) })
      queryClient.invalidateQueries({ queryKey: bookingsKeys.all(businessId) })
    },
  })
}
