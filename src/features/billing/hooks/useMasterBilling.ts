import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { masterBillingApi } from '../api/masterBillingApi'

export function useMrr(months = 6) {
  return useQuery({
    queryKey: ['master', 'billing', 'mrr', months],
    queryFn: () => masterBillingApi.getMrr(months).then((res) => res.data),
  })
}

export function useMasterTransactions(params: { status?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ['master', 'billing', 'transactions', params],
    queryFn: () => masterBillingApi.listTransactions(params).then((res) => res.data),
  })
}

export function useReactivateAccountSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ businessId, extendTrialDays }: { businessId: string; extendTrialDays?: number }) =>
      masterBillingApi.reactivateAccountSubscription(businessId, extendTrialDays),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['master', 'businesses'] }),
  })
}
