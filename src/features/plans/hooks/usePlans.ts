import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { plansApi, type PlanFormPayload } from '../api/plansApi'
import { planKeys } from '../api/planKeys'

export function usePublicPlans() {
  return useQuery({
    queryKey: planKeys.public,
    queryFn: () => plansApi.listPublicPlans().then((res) => res.data),
  })
}

export function useMasterPlans() {
  return useQuery({
    queryKey: planKeys.master,
    queryFn: () => plansApi.listMasterPlans().then((res) => res.data),
  })
}

function useInvalidatePlans() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: planKeys.master })
    queryClient.invalidateQueries({ queryKey: planKeys.public })
  }
}

export function useCreatePlan() {
  const invalidate = useInvalidatePlans()
  return useMutation({
    mutationFn: (data: PlanFormPayload) => plansApi.createPlan(data),
    onSuccess: invalidate,
  })
}

export function useUpdatePlan() {
  const invalidate = useInvalidatePlans()
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: Partial<PlanFormPayload> }) =>
      plansApi.updatePlan(planId, data),
    onSuccess: invalidate,
  })
}

export function useArchivePlan() {
  const invalidate = useInvalidatePlans()
  return useMutation({
    mutationFn: (planId: string) => plansApi.archivePlan(planId),
    onSuccess: invalidate,
  })
}

export function useRestorePlan() {
  const invalidate = useInvalidatePlans()
  return useMutation({
    mutationFn: (planId: string) => plansApi.restorePlan(planId),
    onSuccess: invalidate,
  })
}

export function useSyncPlanMercadoPago() {
  const invalidate = useInvalidatePlans()
  return useMutation({
    mutationFn: (planId: string) => plansApi.syncPlanWithMercadoPago(planId),
    onSuccess: invalidate,
  })
}

export function useDeletePlan() {
  const invalidate = useInvalidatePlans()
  return useMutation({
    mutationFn: (planId: string) => plansApi.deletePlan(planId),
    onSuccess: invalidate,
  })
}
