import { useQuery } from '@tanstack/react-query'
import { businessesApi } from '@/features/businesses/api/businessesApi'
import { businessesKeys } from '@/features/businesses/api/businessesKeys'
import { bookingsApi } from '@/features/bookings/api/bookingsApi'
import { bookingsKeys } from '@/features/bookings/api/bookingsKeys'
import type { Court } from '@/shared/types/domain'

export function usePublicBusiness(businessId: string | undefined) {
  return useQuery({
    queryKey: businessesKeys.publicDetail(businessId ?? ''),
    queryFn: () => businessesApi.getPublicById(businessId!).then((res) => res.data),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export interface CourtAvailability {
  isLoading: boolean
  slots: string[]
  nextFree: string | null
  isFull: boolean
}

// One aggregated request returns availability for every active court on the
// date, so the court list can show "next free" / "full" without fanning out a
// request per court.
export function useCourtsAvailability(
  businessId: string | undefined,
  courts: Court[],
  date: string,
): Record<string, CourtAvailability> {
  const { data, isLoading } = useQuery({
    queryKey: bookingsKeys.businessAvailability(businessId ?? '', date),
    queryFn: () => bookingsApi.getBusinessAvailability(businessId!, date).then((res) => res.data),
    enabled: !!businessId && !!date,
    staleTime: 0,
  })

  const byId = new Map((data?.courts ?? []).map((c) => [c.courtId, c]))
  const map: Record<string, CourtAvailability> = {}
  courts.forEach((court) => {
    const summary = byId.get(court.id)
    map[court.id] = {
      isLoading,
      slots: summary?.availableSlots.map((s) => s.startTime) ?? [],
      nextFree: summary?.nextAvailable ?? null,
      isFull: !isLoading && (summary?.isFull ?? true),
    }
  })
  return map
}
