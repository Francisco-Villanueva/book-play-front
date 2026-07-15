import { useQuery } from '@tanstack/react-query'
import { masterApi } from '../api/masterApi'

export function useMasterBusinesses() {
  return useQuery({
    queryKey: ['master', 'businesses'],
    queryFn: () => masterApi.listBusinesses().then((res) => res.data),
  })
}

export function useMasterBusiness(businessId: string | undefined) {
  return useQuery({
    queryKey: ['master', 'businesses', businessId ?? ''],
    queryFn: () => masterApi.getBusiness(businessId!).then((res) => res.data),
    enabled: !!businessId,
  })
}

export function useMasterUsers() {
  return useQuery({
    queryKey: ['master', 'users'],
    queryFn: () => masterApi.listUsers().then((res) => res.data),
  })
}
