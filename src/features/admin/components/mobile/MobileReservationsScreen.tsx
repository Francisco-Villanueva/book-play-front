import { useMemo, useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useBookingsPage, useCancelBooking } from '@/features/bookings/hooks/useBookings'
import { useCourts } from '@/features/courts/hooks/useCourts'
import type { Booking } from '@/shared/types/domain'
import type { BookingFilters } from '@/features/bookings/api/bookingsApi'
import { addDaysISO, formatMoneyARS, relativeDayLabel, timeToHours, todayISO } from '@/shared/utils/date'
import { courtColor } from '../courtTypes'
import { hFmt, initials, PAYMENT_META } from '../reservationTypes'
import { MobileBookingDetail } from './MobileBookingDetail'
import { MobilePaymentSheet } from './MobilePaymentSheet'
import { ConfirmDialog, type ConfirmRequest } from './ConfirmDialog'
import { flashToast } from '@/shared/store/toastStore'
import type { MobileBooking } from './mobileTypes'

type FilterKey = 'proximas' | 'hoy' | 'sinpagar' | 'canceladas'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'proximas', label: 'Próximas' },
  { key: 'hoy', label: 'Hoy' },
  { key: 'sinpagar', label: 'Sin pagar' },
  { key: 'canceladas', label: 'Canceladas' },
]

const PAST_WINDOW_DAYS = 30
const PAGE_SIZE = 60

function filterParams(key: FilterKey, today: string): Omit<BookingFilters, 'q' | 'page' | 'limit'> {
  switch (key) {
    case 'hoy':
      return { date: today, status: 'ACTIVE', sort: 'asc' }
    case 'sinpagar':
      return {
        dateFrom: addDaysISO(today, -PAST_WINDOW_DAYS),
        status: 'ACTIVE',
        paymentStatus: ['UNPAID', 'PARTIAL'],
        sort: 'asc',
      }
    case 'canceladas':
      return { dateFrom: addDaysISO(today, -PAST_WINDOW_DAYS), status: 'CANCELLED', sort: 'desc' }
    default:
      return { dateFrom: today, status: 'ACTIVE', sort: 'asc' }
  }
}

interface MobileReservationsScreenProps {
  businessId: string
}

export function MobileReservationsScreen({ businessId }: MobileReservationsScreenProps) {
  const today = todayISO()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('proximas')
  const [detail, setDetail] = useState<MobileBooking | null>(null)
  const [collect, setCollect] = useState<MobileBooking | null>(null)
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null)

  const cancelBooking = useCancelBooking(businessId)
  const { data: courts } = useCourts(businessId)
  const { data, isLoading, isError } = useBookingsPage(businessId, {
    ...filterParams(filter, today),
    ...(query.trim() ? { q: query.trim() } : {}),
    limit: PAGE_SIZE,
  })

  const groups = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const b of data?.data ?? []) {
      const label = relativeDayLabel(b.date)
      const list = map.get(label)
      if (list) list.push(b)
      else map.set(label, [b])
    }
    return [...map.entries()]
  }, [data])

  const courtOf = (courtId: string) => {
    const c = courts?.find((x) => x.id === courtId)
    return c ? { id: c.id, name: c.name, sport: c.sportType ?? '—', color: courtColor(c.sportType) } : undefined
  }

  const askCancel = (booking: MobileBooking) =>
    setConfirm({
      title: 'Cancelar reserva',
      body: `Se cancelará el turno de ${booking.name} (${hFmt(booking.s)}–${hFmt(booking.e)}). No se puede deshacer.`,
      confirmLabel: 'Cancelar turno',
      onConfirm: () =>
        cancelBooking.mutate(booking.id, {
          onSuccess: () => {
            setConfirm(null)
            setDetail(null)
            flashToast('Reserva cancelada')
          },
          onError: () => {
            setConfirm(null)
            flashToast('No pudimos cancelar la reserva', { kind: 'error' })
          },
        }),
    })

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-ink-25">
      <div className="flex-none px-4 pt-2.5 pb-2 bg-white border-b border-ink-100">
        <div className="relative mb-2.5">
          <Search size={18} className="absolute left-3 top-3.5 text-ink-400 pointer-events-none" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono"
            aria-label="Buscar reservas"
            className="w-full h-11 pl-10 pr-3.5 rounded-md border-[1.5px] border-ink-200 bg-white font-body text-[16px] text-ink-900 outline-none focus:border-green-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-0.5">
          {FILTERS.map((f) => {
            const on = filter === f.key
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'flex-none px-3.5 py-2 rounded-full border-[1.5px] cursor-pointer font-body font-bold text-[13px] min-h-[36px]',
                  on ? 'border-green-500 bg-green-500 text-white' : 'border-ink-200 bg-white text-ink-700',
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {isError ? (
          <p className="py-14 text-center text-body-sm text-red-600">No pudimos cargar las reservas.</p>
        ) : isLoading ? (
          <p className="py-14 text-center text-body-sm text-ink-400">Cargando reservas…</p>
        ) : groups.length === 0 ? (
          <div className="py-14 text-center">
            <span className="w-14 h-14 rounded-full bg-ink-50 flex items-center justify-center mx-auto mb-3.5">
              <SearchX size={26} className="text-ink-400" aria-hidden />
            </span>
            <p className="font-bold text-[16px] text-ink-900">Sin resultados</p>
            <p className="text-body-sm text-ink-500 mt-1">Probá con otro filtro o búsqueda.</p>
          </div>
        ) : (
          groups.map(([label, items]) => (
            <section key={label}>
              <h2 className="sticky top-0 z-[1] bg-ink-25 pt-3.5 pb-2 text-[11.5px] font-bold uppercase tracking-wider text-ink-400">
                {label}
              </h2>
              <div className="flex flex-col gap-2.5">
                {items.map((b) => (
                  <ReservationCard
                    key={b.id}
                    booking={b}
                    color={courtOf(b.courtId)?.color ?? 'var(--ink-300)'}
                    onOpen={() => setDetail(toMobileBooking(b))}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {detail && (
        <MobileBookingDetail
          booking={detail}
          court={courtOf(detail.cid)}
          onClose={() => setDetail(null)}
          onCancel={() => askCancel(detail)}
          onUnblock={() => setDetail(null)}
          onCollect={() => {
            setCollect(detail)
            setDetail(null)
          }}
        />
      )}
      {collect && (
        <MobilePaymentSheet
          businessId={businessId}
          booking={collect}
          court={courtOf(collect.cid)}
          onClose={() => setCollect(null)}
          onSaved={(amount) => {
            setCollect(null)
            flashToast(`Cobro registrado · ${formatMoneyARS(amount)}`)
          }}
        />
      )}

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} pending={cancelBooking.isPending} />
    </div>
  )
}

function toMobileBooking(b: Booking): MobileBooking {
  return {
    id: b.id,
    cid: b.courtId,
    s: timeToHours(b.startTime),
    e: timeToHours(b.endTime),
    name: b.guestName ?? b.user?.name ?? 'Jugador',
    ...(b.guestPhone ? { ph: b.guestPhone } : {}),
    ...(b.notes ? { note: b.notes } : {}),
    st: 'booked',
    price: b.totalPrice ?? null,
    paymentStatus: b.paymentStatus ?? null,
    totalPlayers: b.totalPlayers ?? null,
    playersPaid: b.playersPaid ?? null,
    paymentNotes: b.paymentNotes ?? null,
  }
}

interface ReservationCardProps {
  booking: Booking
  color: string
  onOpen: () => void
}

function ReservationCard({ booking, color, onOpen }: ReservationCardProps) {
  const cancelled = booking.status === 'CANCELLED'
  const name = booking.guestName ?? booking.user?.name ?? 'Jugador'
  const payment = booking.paymentStatus ? PAYMENT_META[booking.paymentStatus] : null

  const content = (
    <>
      <span
        className={cn(
          'w-11 h-11 flex-none rounded-md text-white flex items-center justify-center font-display font-bold text-[15px]',
          cancelled && 'opacity-50',
        )}
        style={{ background: color }}
      >
        {initials(name)}
      </span>
      <span className="flex-1 min-w-0">
        <span className="tnum font-mono text-[12.5px] font-bold text-ink-500 flex items-center gap-1.5">
          {booking.startTime}–{booking.endTime}
          <span className="text-ink-300">·</span>
          {booking.court?.name ?? 'Cancha'}
        </span>
        <span
          className={cn(
            'block font-bold text-body-sm text-ink-900 mt-0.5 truncate',
            cancelled && 'line-through',
          )}
        >
          {name}
        </span>
      </span>
      <span className="flex-none flex flex-col items-end gap-1">
        {cancelled ? (
          <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-[11px] font-bold text-red-700">
            Cancelada
          </span>
        ) : (
          payment && (
            <span
              className="px-2 py-0.5 rounded-full border text-[11px] font-bold"
              style={{ background: payment.bg, borderColor: payment.bd, color: payment.fg }}
            >
              {payment.short}
            </span>
          )
        )}
        {booking.totalPrice != null && !cancelled && (
          <span className="tnum font-mono text-[11px] font-bold text-ink-500">
            {formatMoneyARS(booking.totalPrice)}
          </span>
        )}
      </span>
    </>
  )

  const className =
    'w-full flex items-center gap-3 px-3.5 py-3 rounded-lg border border-ink-100 bg-white shadow-xs text-left min-h-[68px]'

  if (cancelled) {
    return <div className={className}>{content}</div>
  }
  return (
    <button type="button" onClick={onOpen} className={`${className} cursor-pointer`}>
      {content}
    </button>
  )
}
