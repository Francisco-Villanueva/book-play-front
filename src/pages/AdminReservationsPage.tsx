import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search, X, SearchX } from 'lucide-react'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { ReservationDetailPanel } from '@/features/admin/components/ReservationDetailPanel'
import { cn } from '@/shared/utils/cn'
import {
  type Reservation, type ReservationStatus,
  STATUS_META, hFmt, durationLabel, priceLabel, initials,
} from '@/features/admin/components/reservationTypes'
import { useBookings, useCancelBooking } from '@/features/bookings/hooks/useBookings'
import { courtColor } from '@/features/admin/components/courtTypes'
import { relativeDayLabel, timeToHours } from '@/shared/utils/date'
import type { Booking } from '@/shared/types/domain'

function toReservation(b: Booking): Reservation {
  const d = new Date(b.date + 'T12:00:00')
  return {
    id: b.id,
    courtId: b.courtId,
    court: b.court?.name ?? 'Cancha',
    sport: b.court?.sportType ?? '',
    playerName: b.guestName ?? b.user?.name ?? 'Jugador',
    phone: b.guestPhone ?? '—',
    dateGroup: relativeDayLabel(b.date),
    dayOfWeek: d.toLocaleDateString('es-AR', { weekday: 'short' }),
    dateLabel: d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
    start: timeToHours(b.startTime),
    end: timeToHours(b.endTime),
    status: b.status === 'CANCELLED' ? 'cancelled' : 'booked',
    price: b.totalPrice ?? 0,
  }
}

const DATE_OPTS = ['all', 'Hoy', 'Mañana', 'Ayer'] as const
const STATUS_OPTS: { key: ReservationStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'booked', label: 'Confirmadas' },
  { key: 'cancelled', label: 'Canceladas' },
]

const COLS = '2fr 1.2fr 100px 90px 80px 80px 100px'

export default function AdminReservationsPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { data: bookings, isLoading, isError } = useBookings(businessId)
  const cancelBooking = useCancelBooking(businessId ?? '')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')
  const [dateFilter, setDateFilter] = useState<(typeof DATE_OPTS)[number]>('all')
  const [selected, setSelected] = useState<string | null>(null)

  const data = useMemo(() => (bookings ?? []).map(toReservation), [bookings])

  const filtered = data.filter((r) => {
    const q = search.toLowerCase()
    const matchQ = !q || r.playerName.toLowerCase().includes(q) || r.court.toLowerCase().includes(q) || r.phone.includes(q)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const matchDate = dateFilter === 'all' || r.dateGroup === dateFilter
    return matchQ && matchStatus && matchDate
  })

  const counts = {
    all: data.length,
    booked: data.filter((r) => r.status === 'booked').length,
    cancelled: data.filter((r) => r.status === 'cancelled').length,
  }
  const todayCount = data.filter((r) => r.dateGroup === 'Hoy' && r.status !== 'cancelled').length
  const todayRevenue = data.filter((r) => r.dateGroup === 'Hoy' && r.status === 'booked').reduce((acc, r) => acc + r.price, 0)

  const selectedReservation = selected !== null ? data.find((r) => r.id === selected) : undefined

  const handleCancel = () => {
    if (!selected) return
    cancelBooking.mutate(selected, { onSuccess: () => setSelected(null) })
  }

  return (
    <AdminShell
      title="Reservas"
      subtitle={`${counts.booked} confirmadas · ${counts.cancelled} canceladas`}
    >
      <div className="h-full flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* KPI strip */}
          <div className="flex-none flex bg-white border-b border-ink-100">
            {[
              { label: 'Hoy', value: String(todayCount), unit: 'reservas', color: 'var(--text-strong)' },
              { label: 'Canceladas', value: String(counts.cancelled), unit: 'total', color: '#B91C1C' },
              { label: 'Ingresos hoy', value: priceLabel(todayRevenue), unit: 'confirmados', color: 'var(--green-700)', mono: true },
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
                    {o.label} {o.key !== 'all' && `(${counts[o.key]})`}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Table header */}
          <div className="flex-none grid gap-3 px-5 py-2 bg-ink-50 border-b-2 border-ink-200" style={{ gridTemplateColumns: COLS }}>
            {['Jugador', 'Cancha', 'Fecha', 'Horario', 'Duración', 'Precio', 'Estado'].map((h) => (
              <span key={h} className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-body-sm text-ink-400 py-12">Cargando reservas…</p>
            ) : isError ? (
              <p className="text-center text-body-sm text-red-600 py-12">No pudimos cargar las reservas.</p>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-ink-400">
                <SearchX size={28} className="mx-auto text-ink-300" />
                <p className="mt-2 text-[14px]">Sin resultados</p>
              </div>
            ) : (
              filtered.map((r) => {
                const on = selected === r.id
                const color = courtColor(r.sport)
                const status = STATUS_META[r.status]
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
                  </div>
                )
              })
            )}
          </div>
        </div>

        {selectedReservation && (
          <ReservationDetailPanel
            reservation={selectedReservation}
            courtColor={courtColor(selectedReservation.sport)}
            onClose={() => setSelected(null)}
            onCancel={handleCancel}
          />
        )}
      </div>
    </AdminShell>
  )
}
