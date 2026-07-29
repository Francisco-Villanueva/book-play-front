import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search, X, SearchX, ChevronLeft, ChevronRight } from 'lucide-react'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { ReservationDetailPanel } from '@/features/admin/components/ReservationDetailPanel'
import { cn } from '@/shared/utils/cn'
import {
  type Reservation, type ReservationStatus,
  STATUS_META, PAYMENT_META, paymentDetail, hFmt, durationLabel, priceLabel, initials,
} from '@/features/admin/components/reservationTypes'
import { PaymentModal } from '@/features/admin/components/PaymentModal'
import { MobileReservationsScreen } from '@/features/admin/components/mobile/MobileReservationsScreen'
import { useIsMobile } from '@/shared/hooks/useMediaQuery'
import { useBookings, useBookingsPage, useCancelBooking } from '@/features/bookings/hooks/useBookings'
import { courtColor } from '@/features/admin/components/courtTypes'
import { addDaysISO, relativeDayLabel, timeToHours, todayISO } from '@/shared/utils/date'
import type { Booking, BookingPaymentStatus, BookingStatus } from '@/shared/types/domain'

function toReservation(b: Booking): Reservation {
  const d = new Date(b.date + 'T12:00:00')
  return {
    id: b.id,
    courtId: b.courtId,
    court: b.court?.name ?? 'Cancha',
    sport: b.court?.sportType ?? '',
    playerName: b.guestName ?? b.user?.name ?? 'Jugador',
    phone: b.guestPhone ?? '—',
    date: b.date,
    dateGroup: relativeDayLabel(b.date),
    dayOfWeek: d.toLocaleDateString('es-AR', { weekday: 'short' }),
    dateLabel: d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
    start: timeToHours(b.startTime),
    end: timeToHours(b.endTime),
    status: b.status === 'CANCELLED' ? 'cancelled' : 'booked',
    price: b.totalPrice ?? 0,
    paymentStatus: b.paymentStatus ?? 'UNPAID',
    amountPaid: b.amountPaid ?? null,
    totalPlayers: b.totalPlayers ?? null,
    playersPaid: b.playersPaid ?? null,
    paymentNotes: b.paymentNotes ?? null,
    isRecurring: b.recurringBookingId != null,
  }
}

const DATE_OPTS = ['all', 'Hoy', 'Mañana', 'Ayer'] as const
const STATUS_OPTS: { key: ReservationStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'booked', label: 'Confirmadas' },
  { key: 'cancelled', label: 'Canceladas' },
]

const COLS = '1.7fr 1fr 85px 75px 70px 80px 100px 125px'

const PAGE_SIZE = 50

// Ventana de los KPIs y de los contadores por estado. La tabla pagina contra
// todo el historial; estos agregados se calculan en el cliente, así que se
// acotan a un rango fijo y la UI aclara cuál es.
const SUMMARY_DAYS = 30

const STATUS_PARAM: Record<ReservationStatus, BookingStatus> = {
  booked: 'ACTIVE',
  cancelled: 'CANCELLED',
}

function dateParam(filter: (typeof DATE_OPTS)[number]): string | undefined {
  const today = todayISO()
  if (filter === 'Hoy') return today
  if (filter === 'Mañana') return addDaysISO(today, 1)
  if (filter === 'Ayer') return addDaysISO(today, -1)
  return undefined
}

export default function AdminReservationsPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const isMobile = useIsMobile()
  const cancelBooking = useCancelBooking(businessId ?? '')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')
  const [dateFilter, setDateFilter] = useState<(typeof DATE_OPTS)[number]>('all')
  const [onlyUnpaid, setOnlyUnpaid] = useState(false)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const [paying, setPaying] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  // Cambiar un filtro con la página 5 abierta dejaría la tabla vacía.
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, dateFilter, onlyUnpaid])

  const { data: pageResult, isLoading, isError } = useBookingsPage(businessId, {
    page,
    limit: PAGE_SIZE,
    sort: 'desc',
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
    ...(statusFilter !== 'all' ? { status: STATUS_PARAM[statusFilter] } : {}),
    ...(dateParam(dateFilter) ? { date: dateParam(dateFilter)! } : {}),
    ...(onlyUnpaid ? { paymentStatus: ['UNPAID', 'PARTIAL'] as BookingPaymentStatus[] } : {}),
  })

  const { data: summaryBookings } = useBookings(businessId, {
    dateFrom: addDaysISO(todayISO(), -SUMMARY_DAYS),
  })

  const rows = useMemo(
    () => (pageResult?.data ?? []).map(toReservation),
    [pageResult],
  )
  const summary = useMemo(
    () => (summaryBookings ?? []).map(toReservation),
    [summaryBookings],
  )

  const total = pageResult?.meta.total ?? 0
  const totalPages = pageResult?.meta.totalPages ?? 0

  const counts = {
    booked: summary.filter((r) => r.status === 'booked').length,
    cancelled: summary.filter((r) => r.status === 'cancelled').length,
  }
  const todayCount = summary.filter((r) => r.dateGroup === 'Hoy' && r.status !== 'cancelled').length
  const todayRevenue = summary.filter((r) => r.dateGroup === 'Hoy' && r.status === 'booked').reduce((acc, r) => acc + r.price, 0)

  // Sólo reservas no canceladas: lo cancelado no es plata que el complejo espera cobrar.
  // Y sólo turnos ya jugados: un turno fijo materializa 12 semanas hacia adelante,
  // y contarlas como deuda dejaría el indicador inservible.
  const pending = summary.filter(
    (r) => r.status === 'booked' && r.paymentStatus !== 'PAID' && r.date <= todayISO(),
  )
  const pendingAmount = pending.reduce((acc, r) => acc + (r.price - (r.amountPaid ?? 0)), 0)

  // El panel de detalle y el modal de cobro sólo pueden abrirse desde una fila visible.
  const selectedReservation = selected !== null ? rows.find((r) => r.id === selected) : undefined
  const payingReservation = paying !== null ? rows.find((r) => r.id === paying) : undefined

  const handleCancel = () => {
    if (!selected) return
    cancelBooking.mutate(selected, { onSuccess: () => setSelected(null) })
  }

  if (isMobile) {
    return (
      <AdminShell title="Reservas">
        <MobileReservationsScreen businessId={businessId ?? ''} />
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title="Reservas"
      subtitle={total === 1 ? '1 reserva' : `${total.toLocaleString('es-AR')} reservas`}
    >
      <div className="h-full flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* KPI strip */}
          <div className="flex-none flex bg-white border-b border-ink-100">
            {[
              { label: 'Hoy', value: String(todayCount), unit: 'reservas', color: 'var(--text-strong)' },
              { label: 'Canceladas', value: String(counts.cancelled), unit: `últimos ${SUMMARY_DAYS} días`, color: '#B91C1C' },
              { label: 'Ingresos hoy', value: priceLabel(todayRevenue), unit: 'confirmados', color: 'var(--green-700)', mono: true },
              { label: 'Sin cobrar', value: priceLabel(pendingAmount), unit: `${pending.length} reservas · últimos ${SUMMARY_DAYS} días`, color: 'var(--red-700)', mono: true },
            ].map((k, i) => (
              <div key={k.label} className="flex-1 px-5 py-3" style={{ borderLeft: i ? '1px solid var(--border-subtle)' : 'none' }}>
                <p className="text-[11px] font-semibold text-ink-500 mb-0.5">{k.label}</p>
                <p
                  className="font-extrabold text-[22px] tracking-tight leading-none"
                  style={{ fontFamily: k.mono ? 'var(--font-mono)' : 'var(--font-display)', color: k.color }}
                >
                  {k.value}
                </p>
                <p className="text-[11px] text-ink-400 mt-0.5">{k.unit}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex-none px-5 py-2.5 bg-white border-b border-ink-100 flex items-center gap-2.5">
            <div className="flex items-center gap-2 h-[36px] px-3 bg-ink-50 border border-ink-200 rounded-md max-w-[300px] flex-1">
              <Search size={14} className="text-ink-400 flex-none" aria-hidden />
              <input
                type="search"
                placeholder="Buscar jugador, cancha o teléfono…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-ink-900 placeholder:text-ink-400 outline-none font-body"
                aria-label="Buscar reservas"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Limpiar búsqueda">
                  <X size={13} className="text-ink-400" />
                </button>
              )}
            </div>

            <div className="flex gap-1">
              {DATE_OPTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDateFilter(d)}
                  className="px-2.5 py-1 rounded-full text-[12px] font-semibold cursor-pointer"
                  style={{
                    border: `1.5px solid ${dateFilter === d ? 'var(--action-primary)' : 'var(--border-default)'}`,
                    background: dateFilter === d ? 'var(--surface-brand-soft)' : 'transparent',
                    color: dateFilter === d ? 'var(--green-700)' : 'var(--text-muted)',
                  }}
                >
                  {d === 'all' ? 'Todas las fechas' : d}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOnlyUnpaid((v) => !v)}
              aria-pressed={onlyUnpaid}
              className="px-2.5 py-1 rounded-full text-[12px] font-semibold cursor-pointer flex-none"
              style={{
                border: `1.5px solid ${onlyUnpaid ? 'var(--red-500)' : 'var(--border-default)'}`,
                background: onlyUnpaid ? 'var(--red-50)' : 'transparent',
                color: onlyUnpaid ? 'var(--red-700)' : 'var(--text-muted)',
              }}
            >
              Sin cobrar
            </button>

            <div className="w-px h-6 bg-ink-100 flex-none" />

            <div className="flex bg-ink-50 border border-ink-200 rounded-md overflow-hidden">
              {STATUS_OPTS.map((o) => {
                const on = statusFilter === o.key
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setStatusFilter(o.key)}
                    className={cn('px-3 py-1.5 border-r border-ink-100 text-[12px] cursor-pointer', on ? 'bg-white font-bold text-ink-900 shadow-xs' : 'font-medium text-ink-500')}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Table header */}
          <div className="flex-none grid gap-3 px-5 py-2 bg-ink-50 border-b-2 border-ink-200" style={{ gridTemplateColumns: COLS }}>
            {['Jugador', 'Cancha', 'Fecha', 'Horario', 'Duración', 'Precio', 'Estado', 'Cobro'].map((h) => (
              <span key={h} className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-body-sm text-ink-400 py-12">Cargando reservas…</p>
            ) : isError ? (
              <p className="text-center text-body-sm text-red-600 py-12">No pudimos cargar las reservas.</p>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center text-ink-400">
                <SearchX size={28} className="mx-auto text-ink-300" />
                <p className="mt-2 text-[14px]">Sin resultados</p>
              </div>
            ) : (
              rows.map((r) => {
                const on = selected === r.id
                const color = courtColor(r.sport)
                const status = STATUS_META[r.status]
                const payment = PAYMENT_META[r.paymentStatus]
                const detail = paymentDetail(r)
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelected((s) => (s === r.id ? null : r.id))}
                    className="grid gap-3 px-5 py-3 items-center border-b border-ink-100 cursor-pointer"
                    style={{
                      gridTemplateColumns: COLS,
                      background: on ? 'var(--green-50)' : r.status === 'cancelled' ? 'rgba(220,38,38,.02)' : 'white',
                    }}
                    data-testid={`reservation-row-${r.id}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full flex-none flex items-center justify-center text-[11px] font-bold text-white" style={{ background: color }}>
                        {initials(r.playerName)}
                      </div>
                      <div className="min-w-0">
                        <p className={cn('text-[13px] font-bold text-ink-900 truncate', r.status === 'cancelled' && 'line-through')}>{r.playerName}</p>
                        <p className="text-[11px] text-ink-400 font-mono">{r.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: color }} />
                      <span className="text-[13px] text-ink-700">{r.court}</span>
                    </div>
                    <span className="text-[12px] text-ink-500">{r.dateGroup}</span>
                    <span className="font-mono font-semibold text-[13px] text-ink-700">{hFmt(r.start)}</span>
                    <span className="text-[12px] text-ink-500">{durationLabel(r.start, r.end)}</span>
                    <span className="font-mono font-bold text-[13px] text-ink-900">{priceLabel(r.price)}</span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border w-fit"
                      style={{ background: status.bg, borderColor: status.bd, color: status.fg }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: status.fg }} />
                      {status.label}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPaying(r.id) }}
                      aria-label={`Registrar cobro de ${r.playerName}`}
                      data-testid={`reservation-payment-${r.id}`}
                      className="text-left px-2 py-1 rounded-md border cursor-pointer w-full"
                      style={{ background: payment.bg, borderColor: payment.bd, color: payment.fg }}
                    >
                      <span className="block text-[11px] font-bold leading-tight">{payment.short}</span>
                      {detail && <span className="block text-[10px] font-medium opacity-80 leading-tight">{detail}</span>}
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex-none flex items-center justify-between px-5 py-2.5 bg-white border-t border-ink-100">
              <p className="text-[12px] text-ink-500">
                Página <span className="font-mono font-semibold text-ink-900">{page}</span> de{' '}
                <span className="font-mono font-semibold text-ink-900">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Página anterior"
                  data-testid="reservations-prev-page"
                  className="p-1.5 border border-ink-100 rounded-md bg-ink-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="Página siguiente"
                  data-testid="reservations-next-page"
                  className="p-1.5 border border-ink-100 rounded-md bg-ink-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} aria-hidden />
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedReservation && (
          <ReservationDetailPanel
            reservation={selectedReservation}
            courtColor={courtColor(selectedReservation.sport)}
            onClose={() => setSelected(null)}
            onCancel={handleCancel}
            onRegisterPayment={() => setPaying(selectedReservation.id)}
          />
        )}

        {payingReservation && businessId && (
          <PaymentModal
            businessId={businessId}
            reservation={payingReservation}
            onClose={() => setPaying(null)}
          />
        )}
      </div>
    </AdminShell>
  )
}
