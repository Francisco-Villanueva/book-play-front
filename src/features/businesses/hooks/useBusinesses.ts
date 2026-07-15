import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { businessesApi } from '../api/businessesApi'
import { businessesKeys } from '../api/businessesKeys'
import type { Business } from '@/shared/types/domain'

export function useBusiness(businessId: string | undefined) {
  return useQuery({
    queryKey: businessesKeys.detail(businessId ?? ''),
    queryFn: () => businessesApi.getById(businessId!).then((res) => res.data),
    enabled: !!businessId,
  })
}

export function useBusinessSearch(q: string) {
  return useQuery({
    queryKey: businessesKeys.search(q),
    queryFn: () => businessesApi.search(q || undefined).then((res) => res.data),
    staleTime: 30_000,
  })
}

export function useUpdateBusiness(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Pick<Business, 'name' | 'description' | 'address' | 'phone' | 'email' | 'timezone' | 'slotDuration'>>) =>
      businessesApi.update(businessId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessesKeys.detail(businessId) }),
  })
}
