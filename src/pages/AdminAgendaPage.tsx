import { useMemo, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { AgendaToolbar } from '@/features/admin/components/AgendaToolbar'
import { AgendaGrid } from '@/features/admin/components/AgendaGrid'
import { AgendaDetailPanel } from '@/features/admin/components/AgendaDetailPanel'
import { NewBookingModal } from '@/features/admin/components/NewBookingModal'
import { MobileAgendaScreen } from '@/features/admin/components/mobile/MobileAgendaScreen'
import { type BookingPrefill } from '@/features/admin/components/agendaTypes'
import { useAgendaDay } from '@/features/admin/hooks/useAgendaDay'
import { useCancelBooking } from '@/features/bookings/hooks/useBookings'
import { useIsMobile } from '@/shared/hooks/useMediaQuery'
import { addDaysISO, formatLongDateEs, todayISO } from '@/shared/utils/date'

export default function AdminAgendaPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const isMobile = useIsMobile()
  const gridRef = useRef<HTMLDivElement>(null)
  const [date, setDate] = useState(todayISO())
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState('Todas')
  const [modalPrefill, setModalPrefill] = useState<BookingPrefill | null>(null)

  const { courts, courtPrices, courtDurations, bookings, isLoading } = useAgendaDay(businessId, date)
  const cancelBooking = useCancelBooking(businessId ?? '')

  const sports = useMemo(() => ['Todas', ...new Set(courts.map((c) => c.sport))], [courts])
  const filteredCourts = filter === 'Todas' ? courts : courts.filter((c) => c.sport === filter)

  const handleSelect = useCallback((b: { id: string }) => {
    setSelected((s) => (s === b.id ? null : b.id))
  }, [])

  const handleNewBooking = useCallback((prefill: BookingPrefill = {}) => {
    setModalPrefill(prefill)
  }, [])

  const handleCancel = () => {
    if (!selected) return
    cancelBooking.mutate(selected, { onSuccess: () => setSelected(null) })
  }

  const selectedBooking = selected != null ? bookings.find((b) => b.id === selected) : undefined
  const selectedCourt = selectedBooking ? courts.find((c) => c.id === selectedBooking.cid) : undefined

  const isToday = date === todayISO()

  if (isMobile) {
    return (
      <AdminShell title="Agenda" subtitle={formatLongDateEs(date)}>
        <MobileAgendaScreen businessId={businessId ?? ''} />
      </AdminShell>
    )
  }

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
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-body-sm text-ink-400">Cargando agenda…</div>
          ) : filteredCourts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-body-sm text-ink-400">
              Todavía no hay canchas cargadas para este complejo.
            </div>
          ) : (
            <AgendaGrid
              ref={gridRef}
              courts={filteredCourts}
              bookings={bookings}
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
          courts={courts}
          courtPrices={courtPrices}
          courtDurations={courtDurations}
          prefill={modalPrefill}
          onClose={() => setModalPrefill(null)}
          onSaved={() => setModalPrefill(null)}
        />
      )}
    </AdminShell>
  )
}
