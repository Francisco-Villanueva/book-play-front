import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { exceptionRulesApi } from '../api/exceptionRulesApi'
import { exceptionRulesKeys } from '../api/exceptionRulesKeys'

export function useExceptionRules(businessId: string | undefined) {
  return useQuery({
    queryKey: exceptionRulesKeys.all(businessId ?? ''),
    queryFn: () => exceptionRulesApi.listByBusiness(businessId!).then((res) => res.data),
    enabled: !!businessId,
  })
}

interface ExceptionRuleInput {
  date: string
  startTime?: string
  endTime?: string
  isAvailable: boolean
  reason?: string
  courtIds?: string[]
}

export function useCreateExceptionRule(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ExceptionRuleInput) => exceptionRulesApi.create(businessId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exceptionRulesKeys.all(businessId) }),
  })
}

export function useDeleteExceptionRule(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ruleId: string) => exceptionRulesApi.remove(businessId, ruleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exceptionRulesKeys.all(businessId) }),
  })
}
