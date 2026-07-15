import { useMemo, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { AgendaToolbar } from '@/features/admin/components/AgendaToolbar'
import { AgendaGrid } from '@/features/admin/components/AgendaGrid'
import { AgendaDetailPanel } from '@/features/admin/components/AgendaDetailPanel'
import { NewBookingModal } from '@/features/admin/components/NewBookingModal'
import { HOUR_START, HOUR_END, type AgendaBooking, type BookingPrefill } from '@/features/admin/components/agendaTypes'
import { courtColor } from '@/features/admin/components/courtTypes'
import { useCourts } from '@/features/courts/hooks/useCourts'
import { useBookings, useCancelBooking } from '@/features/bookings/hooks/useBookings'
import { useExceptionRules } from '@/features/exception-rules/hooks/useExceptionRules'
import { addDaysISO, formatLongDateEs, timeToHours, todayISO } from '@/shared/utils/date'

export default function AdminAgendaPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const gridRef = useRef<HTMLDivElement>(null)
  const [date, setDate] = useState(todayISO())
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState('Todas')
  const [modalPrefill, setModalPrefill] = useState<BookingPrefill | null>(null)

  const { data: rawCourts, isLoading: courtsLoading } = useCourts(businessId)
  const { data: rawBookings, isLoading: bookingsLoading } = useBookings(businessId)
  const { data: rawExceptions } = useExceptionRules(businessId)
  const cancelBooking = useCancelBooking(businessId ?? '')

  const courts = useMemo(
    () => (rawCourts ?? []).filter((c) => c.isActive).map((c) => ({
      id: c.id,
      name: c.name,
      sport: c.sportType ?? '—',
      color: courtColor(c.sportType),
    })),
    [rawCourts],
  )
  const courtPrices = useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of rawCourts ?? []) map[c.id] = c.pricePerHour ?? 0
    return map
  }, [rawCourts])

  const sports = useMemo(() => ['Todas', ...new Set(courts.map((c) => c.sport))], [courts])
  const filteredCourts = filter === 'Todas' ? courts : courts.filter((c) => c.sport === filter)

  const blockedBlocks: AgendaBooking[] = useMemo(() => {
    const blocks: AgendaBooking[] = []
    for (const ex of (rawExceptions ?? []).filter((e) => e.date === date && !e.isAvailable)) {
      const affectedCourtIds = ex.courts && ex.courts.length > 0 ? ex.courts.map((c) => c.id) : courts.map((c) => c.id)
      const s = ex.startTime ? timeToHours(ex.startTime) : HOUR_START
      const e = ex.endTime ? timeToHours(ex.endTime) : HOUR_END
      for (const courtId of affectedCourtIds) {
        blocks.push({ id: `ex-${ex.id}-${courtId}`, cid: courtId, s, e, name: ex.reason ?? 'Bloqueado', st: 'blocked' })
      }
    }
    return blocks
  }, [rawExceptions, date, courts])

  const data: AgendaBooking[] = useMemo(
    () => [
      ...(rawBookings ?? [])
        .filter((b) => b.date === date && b.status === 'ACTIVE')
        .map((b) => ({
          id: b.id,
          cid: b.courtId,
          s: timeToHours(b.startTime),
          e: timeToHours(b.endTime),
          name: b.guestName ?? b.user?.name ?? 'Jugador',
          ...(b.guestPhone ? { ph: b.guestPhone } : {}),
          st: 'booked' as const,
          ...(b.totalPrice != null ? { p: `$${b.totalPrice.toLocaleString('es-AR')}` } : {}),
        })),
      ...blockedBlocks,
    ],
    [rawBookings, date, blockedBlocks],
  )

  const handleSelect = useCallback((b: AgendaBooking) => {
    setSelected((s) => (s === b.id ? null : b.id))
  }, [])

  const handleNewBooking = useCallback((prefill: BookingPrefill = {}) => {
    setModalPrefill(prefill)
  }, [])

  const handleCancel = () => {
    if (!selected) return
    cancelBooking.mutate(selected, { onSuccess: () => setSelected(null) })
  }

  const selectedBooking = selected != null ? data.find((b) => b.id === selected) : undefined
  const selectedCourt = selectedBooking ? courts.find((c) => c.id === selectedBooking.cid) : undefined

  const isToday = date === todayISO()

  return (
    <AdminShell title="Agenda" subtitle={formatLongDateEs(date)}>
      <div className="h-full flex flex-col overflow-hidden">
        <AgendaToolbar
          dateLabel={formatLongDateEs(date)}
          isToday={isToday}
          onPrevDay={() => setDate((d) => addDaysISO(d, -1))}
          onNextDay={() => setDate((d) => addDaysISO(d, 1))}
          sports={sports}
          filter={filter}
          onFilterChange={setFilter}
        />

        <div className="flex-1 flex overflow-hidden">
          {courtsLoading || bookingsLoading ? (
            <div className="flex-1 flex items-center justify-center text-body-sm text-ink-400">Cargando agenda…</div>
          ) : filteredCourts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-body-sm text-ink-400">
              Todavía no hay canchas cargadas para este complejo.
            </div>
          ) : (
            <AgendaGrid
              ref={gridRef}
              courts={filteredCourts}
              bookings={data}
              selectedId={selected}
              onSelect={handleSelect}
              onNewBooking={handleNewBooking}
              isToday={isToday}
            />
          )}

          {selectedBooking && selectedCourt && (
            <AgendaDetailPanel
              booking={selectedBooking}
              court={selectedCourt}
              onClose={() => setSelected(null)}
              onConfirm={() => setSelected(null)}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>

      {modalPrefill && businessId && (
        <NewBookingModal
          businessId={businessId}
          date={date}
          dateLabel={formatLongDateEs(date)}
          courts={courts}
          courtPrices={courtPrices}
          prefill={modalPrefill}
          onClose={() => setModalPrefill(null)}
          onSaved={() => setModalPrefill(null)}
        />
      )}
    </AdminShell>
  )
}
