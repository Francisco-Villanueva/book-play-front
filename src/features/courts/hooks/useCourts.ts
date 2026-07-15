import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courtsApi, type CourtPayload } from '../api/courtsApi'
import { courtsKeys } from '../api/courtsKeys'

export function useCourts(businessId: string | undefined) {
  return useQuery({
    queryKey: courtsKeys.all(businessId ?? ''),
    queryFn: () => courtsApi.listByBusiness(businessId!).then((res) => res.data),
    enabled: !!businessId,
  })
}

export function useCreateCourt(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CourtPayload) => courtsApi.createCourt(businessId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courtsKeys.all(businessId) }),
  })
}

export function useUpdateCourt(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ courtId, data }: { courtId: string; data: Partial<CourtPayload> }) =>
      courtsApi.updateCourt(businessId, courtId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courtsKeys.all(businessId) }),
  })
}

export function useDeleteCourt(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (courtId: string) => courtsApi.deleteCourt(businessId, courtId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courtsKeys.all(businessId) }),
  })
}
