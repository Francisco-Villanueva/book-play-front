import { useMemo } from 'react'
import { useCourts } from '@/features/courts/hooks/useCourts'
import { useBookings } from '@/features/bookings/hooks/useBookings'
import { useExceptionRules } from '@/features/exception-rules/hooks/useExceptionRules'
import { timeToHours } from '@/shared/utils/date'
import { courtColor } from '../components/courtTypes'
import { HOUR_END, HOUR_START, type AgendaCourt } from '../components/agendaTypes'
import type { MobileBooking } from '../components/mobile/mobileTypes'

export interface AgendaDay {
  courts: AgendaCourt[]
  courtPrices: Record<string, number>
  courtDurations: Record<string, number>
  bookings: MobileBooking[]
  isLoading: boolean
  isError: boolean
}

// El día de la agenda lo consumen la grilla de escritorio y la vista mobile.
// Vive acá para que las dos lean exactamente la misma derivación.
export function useAgendaDay(businessId: string | undefined, date: string): AgendaDay {
  const { data: rawCourts, isLoading: courtsLoading, isError: courtsError } = useCourts(businessId)
  const {
    data: rawBookings,
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useBookings(businessId, { date, status: 'ACTIVE' })
  const { data: rawExceptions } = useExceptionRules(businessId)

  const courts = useMemo<AgendaCourt[]>(
    () =>
      (rawCourts ?? [])
        .filter((c) => c.isActive)
        .map((c) => ({
          id: c.id,
          name: c.name,
          sport: c.sportType ?? '—',
          color: courtColor(c.sportType),
        })),
    [rawCourts],
  )

  const courtPrices = useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of rawCourts ?? []) map[c.id] = c.pricePerSlot ?? 0
    return map
  }, [rawCourts])

  const courtDurations = useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of rawCourts ?? []) map[c.id] = c.slotDuration
    return map
  }, [rawCourts])

  const bookings = useMemo<MobileBooking[]>(() => {
    const active: MobileBooking[] = (rawBookings ?? []).map((b) => ({
      id: b.id,
      cid: b.courtId,
      s: timeToHours(b.startTime),
      e: timeToHours(b.endTime),
      name: b.guestName ?? b.user?.name ?? 'Jugador',
      ...(b.guestPhone ? { ph: b.guestPhone } : {}),
      ...(b.notes ? { note: b.notes } : {}),
      st: 'booked' as const,
      isRecurring: b.recurringBookingId != null,
      price: b.totalPrice ?? null,
      paymentStatus: b.paymentStatus ?? null,
      totalPlayers: b.totalPlayers ?? null,
      playersPaid: b.playersPaid ?? null,
      paymentNotes: b.paymentNotes ?? null,
    }))

    const blocked: MobileBooking[] = []
    for (const ex of (rawExceptions ?? []).filter((e) => e.date === date && !e.isAvailable)) {
      const affected = ex.courts && ex.courts.length > 0 ? ex.courts.map((c) => c.id) : courts.map((c) => c.id)
      const s = ex.startTime ? timeToHours(ex.startTime) : HOUR_START
      const e = ex.endTime ? timeToHours(ex.endTime) : HOUR_END
      for (const courtId of affected) {
        blocked.push({
          id: `ex-${ex.id}-${courtId}`,
          cid: courtId,
          s,
          e,
          name: ex.reason ?? 'Bloqueado',
          st: 'blocked' as const,
          price: null,
          paymentStatus: null,
          totalPlayers: null,
          playersPaid: null,
          paymentNotes: null,
          exceptionRuleId: ex.id,
        })
      }
    }

    return [...active, ...blocked]
  }, [rawBookings, rawExceptions, date, courts])

  return {
    courts,
    courtPrices,
    courtDurations,
    bookings,
    isLoading: courtsLoading || bookingsLoading,
    isError: courtsError || bookingsError,
  }
}
