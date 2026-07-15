import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { availabilityRulesApi } from '../api/availabilityRulesApi'
import { availabilityRulesKeys } from '../api/availabilityRulesKeys'

export function useAvailabilityRules(businessId: string | undefined) {
  return useQuery({
    queryKey: availabilityRulesKeys.all(businessId ?? ''),
    queryFn: () => availabilityRulesApi.listByBusiness(businessId!).then((res) => res.data),
    enabled: !!businessId,
  })
}

interface AvailabilityRuleInput {
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
  courtIds?: string[]
}

export function useCreateAvailabilityRule(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AvailabilityRuleInput) => availabilityRulesApi.create(businessId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: availabilityRulesKeys.all(businessId) }),
  })
}

export function useDeleteAvailabilityRule(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ruleId: string) => availabilityRulesApi.remove(businessId, ruleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: availabilityRulesKeys.all(businessId) }),
  })
}
