import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../api/notificationsApi'
import { notificationsKeys } from '../api/notificationsKeys'

// El complejo tiene el panel abierto todo el día: sin refetch periódico, una
// cancelación de la mañana no aparece hasta que recargan. 60s es suficiente para
// algo que se resuelve por teléfono, y no castiga al servidor.
const POLL_MS = 60_000

export function useNotifications(businessId: string | undefined) {
  return useQuery({
    queryKey: notificationsKeys.all(businessId ?? ''),
    queryFn: () => notificationsApi.list(businessId!).then((r) => r.data),
    enabled: !!businessId,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })
}

export function useMarkNotificationRead(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { inlineError: true },
    mutationFn: (notificationId: string) =>
      notificationsApi.markRead(businessId, notificationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all(businessId) }),
  })
}

export function useMarkAllNotificationsRead(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { inlineError: true },
    mutationFn: () => notificationsApi.markAllRead(businessId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all(businessId) }),
  })
}
