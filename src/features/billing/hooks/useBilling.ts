import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { billingApi, type CreateCheckoutSessionPayload } from '../api/billingApi'

const billingKeys = {
  subscription: (businessId: string) => ['billing', businessId, 'subscription'] as const,
  payments: (businessId: string) => ['billing', businessId, 'payments'] as const,
}

interface UseSubscriptionOptions {
  refetchInterval?: number | false
  refetchOnMount?: boolean | 'always'
}

export function useSubscription(businessId: string | undefined, options?: UseSubscriptionOptions) {
  return useQuery({
    queryKey: billingKeys.subscription(businessId ?? ''),
    queryFn: () => billingApi.getSubscription(businessId!).then((res) => res.data),
    enabled: !!businessId,
    retry: false,
    ...(options?.refetchInterval !== undefined ? { refetchInterval: options.refetchInterval } : {}),
    ...(options?.refetchOnMount !== undefined ? { refetchOnMount: options.refetchOnMount } : {}),
  })
}

export function usePayments(businessId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: billingKeys.payments(businessId ?? ''),
    queryFn: () => billingApi.listPayments(businessId!).then((res) => res.data),
    enabled: !!businessId && enabled,
    retry: false,
  })
}

export function useCreateCheckoutSession(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCheckoutSessionPayload) => billingApi.createCheckoutSession(businessId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: billingKeys.subscription(businessId) }),
  })
}

export function useCancelSubscription(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => billingApi.cancelSubscription(businessId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: billingKeys.subscription(businessId) }),
  })
}

export function useReactivateSubscription(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => billingApi.reactivateSubscription(businessId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: billingKeys.subscription(businessId) }),
  })
}
