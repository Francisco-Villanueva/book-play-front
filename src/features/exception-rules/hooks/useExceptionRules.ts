import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { exceptionRulesApi } from '../api/exceptionRulesApi'
import { exceptionRulesKeys } from '../api/exceptionRulesKeys'
import { bookingsKeys } from '@/features/bookings/api/bookingsKeys'

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

// Dry-run del bloqueo. Mutation y no query porque se dispara al confirmar el
// paso, no mientras el encargado todavía está eligiendo la franja.
export function usePreviewExceptionImpact(businessId: string) {
  return useMutation({
    meta: { inlineError: true },
    mutationFn: (data: ExceptionRuleInput) =>
      exceptionRulesApi.previewImpact(businessId, data).then((res) => res.data),
  })
}

export function useCreateExceptionRule(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { inlineError: true },
    mutationFn: (data: ExceptionRuleInput) => exceptionRulesApi.create(businessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exceptionRulesKeys.all(businessId) })
      // El bloqueo cancela las reservas de esa franja: la agenda queda vieja.
      queryClient.invalidateQueries({ queryKey: bookingsKeys.all(businessId) })
    },
  })
}

export function useDeleteExceptionRule(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { inlineError: true },
    mutationFn: (ruleId: string) => exceptionRulesApi.remove(businessId, ruleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exceptionRulesKeys.all(businessId) }),
  })
}
