import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, Sun, Zap } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { SegmentedControl } from '@/shared/components/SegmentedControl'
import { useCancelBooking } from '@/features/bookings/hooks/useBookings'
import { useDeleteExceptionRule } from '@/features/exception-rules/hooks/useExceptionRules'
import { addDaysISO, formatMoneyARS, relativeDayLabel, shortDateLabel, timeToHours, todayISO } from '@/shared/utils/date'
import { useAgendaDay } from '../../hooks/useAgendaDay'
import { HOUR_END, HOUR_START, hFmt } from '../agendaTypes'
import { AgendaHourRow } from './AgendaHourRow'
import { AgendaByCourt } from './AgendaByCourt'
import { DatePickerSheet } from './DatePickerSheet'
import { HayLugarSheet } from './HayLugarSheet'
import { MobileNewBookingSheet, type NewBookingPrefill } from './MobileNewBookingSheet'
import { MobileBookingDetail } from './MobileBookingDetail'
import { MobilePaymentSheet } from './MobilePaymentSheet'
import { MobileBlockSheet } from './MobileBlockSheet'
import { MobileResumenScreen } from './MobileResumenScreen'
import { ConfirmDialog, type ConfirmRequest } from './ConfirmDialog'
import { Toast } from './Toast'
import { useToast } from './useToast'
import { freeCountAt, type MobileBooking } from './mobileTypes'

type AgendaView = 'horarios' | 'cancha'
type Row = { kind: 'hour'; hour: number } | { kind: 'band'; from: number; to: number }

// Con muchas canchas la fila por franja deja de ser legible: ahí la vista por
// cancha es la que entra en la pantalla.
const MAX_COURTS_BY_HOUR = 8
const CELL_COLUMNS = 4

interface MobileAgendaScreenProps {
  businessId: string
}

export function MobileAgendaScreen({ businessId }: MobileAgendaScreenProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [date, setDate] = useState(todayISO())
  const [view, setView] = useState<AgendaView>('horarios')
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [hayLugarOpen, setHayLugarOpen] = useState(false)
  const [resumenOpen, setResumenOpen] = useState(false)
  const [newBooking, setNewBooking] = useState<NewBookingPrefill | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [collectId, setCollectId] = useState<string | null>(null)
  const [blockTarget, setBlockTarget] = useState<{ courtId: string; hour: number } | null>(null)
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const nowRef = useRef<HTMLDivElement>(null)
  const { toast, flash, dismiss } = useToast()

  const { courts, courtPrices, courtDurations, bookings, isLoading, isError } = useAgendaDay(businessId, date)
  const cancelBooking = useCancelBooking(businessId)
  const deleteException = useDeleteExceptionRule(businessId)

  const isToday = date === todayISO()
  const nowHour = isToday ? timeToHours(new Date().toTimeString().slice(0, 5)) : null

  // El FAB del shell abre el alta desde cualquier pestaña, y la vista semanal
  // entra a un día puntual. Los dos llegan por query string.
  useEffect(() => {
    const wantsNew = searchParams.get('nueva') != null
    const wantedDate = searchParams.get('fecha')
    if (!wantsNew && !wantedDate) return

    if (wantedDate) setDate(wantedDate)
    if (wantsNew) setNewBooking({})

    const next = new URLSearchParams(searchParams)
    next.delete('nueva')
    next.delete('fecha')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    setExpanded({})
  }, [date])

  const byHourView = view === 'horarios' && courts.length <= MAX_COURTS_BY_HOUR

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = []
    let h = HOUR_START
    while (h < HOUR_END) {
      const allFree = courts.length > 0 && freeCountAt(bookings, courts, h) === courts.length
      if (allFree && !expanded[h]) {
        let j = h
        while (j < HOUR_END && freeCountAt(bookings, courts, j) === courts.length && !expanded[j]) j++
        // Comprimir una sola hora no ahorra nada y rompe el ritmo de la lista.
        if (j - h >= 2) {
          out.push({ kind: 'band', from: h, to: j })
          h = j
          continue
        }
      }
      out.push({ kind: 'hour', hour: h })
      h++
    }
    return out
  }, [bookings, courts, expanded])

  useEffect(() => {
    if (!byHourView || !nowRef.current || !scrollRef.current) return
    scrollRef.current.scrollTop = Math.max(0, nowRef.current.offsetTop - 150)
  }, [byHourView, date, isLoading])

  const stats = useMemo(() => {
    const real = bookings.filter((b) => b.st !== 'blocked')
    const capacity = (HOUR_END - HOUR_START) * Math.max(courts.length, 1)
    const busy = bookings.reduce((n, b) => n + (b.e - b.s), 0)
    return {
      count: real.length,
      occupancy: Math.round((busy / capacity) * 100),
      income: real.reduce((n, b) => n + (b.price ?? 0), 0),
      unpaid: real.filter((b) => b.paymentStatus !== 'PAID').length,
    }
  }, [bookings, courts])

  const detail = detailId != null ? bookings.find((b) => b.id === detailId) ?? null : null
  const collect = collectId != null ? bookings.find((b) => b.id === collectId) ?? null : null
  const blockCourt = blockTarget ? courts.find((c) => c.id === blockTarget.courtId) : undefined
  const courtOf = (b: MobileBooking) => courts.find((c) => c.id === b.cid)

  const askCancel = (booking: MobileBooking) =>
    setConfirm({
      title: 'Cancelar reserva',
      body: `Se cancelará el turno de ${booking.name} (${hFmt(booking.s)}–${hFmt(booking.e)}). No se puede deshacer.`,
      confirmLabel: 'Cancelar turno',
      cancelLabel: 'Volver',
      onConfirm: () =>
        cancelBooking.mutate(booking.id, {
          onSuccess: () => {
            setConfirm(null)
            setDetailId(null)
            flash('Reserva cancelada')
          },
          onError: () => {
            setConfirm(null)
            flash('No pudimos cancelar la reserva', { kind: 'error' })
          },
        }),
    })

  const askUnblock = (booking: MobileBooking) => {
    const ruleId = booking.exceptionRuleId
    if (!ruleId) return
    setConfirm({
      title: 'Quitar bloqueo',
      body: 'La franja vuelve a quedar disponible para reservar.',
      confirmLabel: 'Quitar bloqueo',
      onConfirm: () =>
        deleteException.mutate(ruleId, {
          onSuccess: () => {
            setConfirm(null)
            setDetailId(null)
            flash('Bloqueo quitado')
          },
          onError: () => {
            setConfirm(null)
            flash('No pudimos quitar el bloqueo', { kind: 'error' })
          },
        }),
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-ink-25">
      <div className="flex-none flex items-center gap-1 px-3 py-2 bg-white border-b border-ink-100">
        <button
          type="button"
          aria-label="Día anterior"
          onClick={() => setDate((d) => addDaysISO(d, -1))}
          className="w-11 h-11 flex-none rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-ink-700" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setDatePickerOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 border-none bg-transparent cursor-pointer min-h-[44px]"
        >
          <span className="font-display font-bold text-[16px] text-ink-900">{shortDateLabel(date)}</span>
          {isToday ? (
            <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Hoy</span>
          ) : (
            <span className="text-[11px] font-bold text-ink-500 bg-ink-50 px-2 py-0.5 rounded-full">
              {relativeDayLabel(date)}
            </span>
          )}
          <ChevronDown size={15} className="text-ink-400" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Día siguiente"
          onClick={() => setDate((d) => addDaysISO(d, 1))}
          className="w-11 h-11 flex-none rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center"
        >
          <ChevronRight size={20} className="text-ink-700" aria-hidden />
        </button>
      </div>

      <div className="flex-none flex gap-2 px-4 pt-2.5 pb-2 bg-white">
        {courts.length <= MAX_COURTS_BY_HOUR && (
          <div className="flex-1 min-w-0">
            <SegmentedControl
              full
              value={view === 'horarios' ? 'Horarios' : 'Por cancha'}
              onChange={(v) => setView(v === 'Horarios' ? 'horarios' : 'cancha')}
              options={['Horarios', 'Por cancha']}
            />
          </div>
        )}
        <button
          type="button"
          onClick={() => setHayLugarOpen(true)}
          data-testid="mobile-hay-lugar"
          className="flex-none flex items-center gap-1.5 px-3.5 h-[38px] rounded-md border-[1.5px] border-green-500 bg-green-50 text-green-700 font-body font-bold text-caption cursor-pointer whitespace-nowrap"
        >
          <Zap size={15} aria-hidden />
          ¿Hay lugar?
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-32">
        <button
          type="button"
          onClick={() => setResumenOpen(true)}
          className="w-full flex items-center my-2.5 px-2 py-2.5 rounded-md border border-ink-100 bg-white shadow-xs cursor-pointer"
        >
          <Metric value={String(stats.count)} label="reservas" />
          <span className="w-px h-6 bg-ink-100 flex-none" />
          <Metric value={`${stats.occupancy}%`} label="ocupación" color="var(--green-600)" />
          <span className="w-px h-6 bg-ink-100 flex-none" />
          <Metric value={formatMoneyARS(stats.income)} label="ingresos" />
          <ChevronRight size={16} className="text-ink-400 flex-none" aria-hidden />
        </button>

        {stats.unpaid > 0 && (
          <div className="flex items-center gap-2.5 w-full mb-3 px-3 py-2.5 rounded-md border border-amber-100 bg-amber-50">
            <AlertCircle size={16} className="text-amber-700 flex-none" aria-hidden />
            <span className="flex-1 text-caption font-semibold text-amber-700">
              {stats.unpaid === 1 ? '1 turno sin cobrar' : `${stats.unpaid} turnos sin cobrar`}
            </span>
          </div>
        )}

        {isError ? (
          <p className="py-10 text-center text-body-sm text-red-600">No pudimos cargar la agenda.</p>
        ) : isLoading ? (
          <AgendaSkeleton />
        ) : courts.length === 0 ? (
          <p className="py-10 text-center text-body-sm text-ink-500">
            Todavía no hay canchas cargadas en este complejo.
          </p>
        ) : byHourView ? (
          rows.map((row) =>
            row.kind === 'band' ? (
              <FreeBand
                key={`band-${row.from}`}
                from={row.from}
                to={row.to}
                onExpand={() =>
                  setExpanded((prev) => {
                    const next = { ...prev }
                    for (let k = row.from; k < row.to; k++) next[k] = true
                    return next
                  })
                }
              />
            ) : (
              <Fragment key={`hour-${row.hour}`}>
                {nowHour != null && Math.floor(nowHour) === row.hour && (
                  <div ref={nowRef}>
                    <NowMarker nowHour={nowHour} />
                  </div>
                )}
                <AgendaHourRow
                  hour={row.hour}
                  courts={courts}
                  bookings={bookings}
                  columns={Math.min(courts.length, CELL_COLUMNS)}
                  isNow={nowHour != null && Math.floor(nowHour) === row.hour}
                  onFree={(courtId, hour) => setNewBooking({ courtId, startTime: hFmt(hour) })}
                  onBooked={(b) => setDetailId(b.id)}
                  onBlock={(courtId, hour) => setBlockTarget({ courtId, hour })}
                />
              </Fragment>
            ),
          )
        ) : (
          <div className="pt-2.5">
            <AgendaByCourt
              courts={courts}
              bookings={bookings}
              nowHour={nowHour}
              onFree={(courtId, hour) => setNewBooking({ courtId, startTime: hFmt(hour) })}
              onBooked={(b) => setDetailId(b.id)}
            />
          </div>
        )}
      </div>

      {datePickerOpen && (
        <DatePickerSheet date={date} onPick={setDate} onClose={() => setDatePickerOpen(false)} />
      )}
      {hayLugarOpen && (
        <HayLugarSheet
          businessId={businessId}
          date={date}
          onClose={() => setHayLugarOpen(false)}
          onPick={(courtId, startTime) => {
            setHayLugarOpen(false)
            setNewBooking({ courtId, startTime })
          }}
        />
      )}
      {newBooking && (
        <MobileNewBookingSheet
          businessId={businessId}
          date={date}
          courts={courts}
          courtPrices={courtPrices}
          courtDurations={courtDurations}
          prefill={newBooking}
          onDateChange={setDate}
          onClose={() => setNewBooking(null)}
          onSaved={(guestName) => {
            setNewBooking(null)
            flash(`Reserva confirmada · ${guestName}`)
          }}
        />
      )}
      {detail && (
        <MobileBookingDetail
          booking={detail}
          court={courtOf(detail)}
          onClose={() => setDetailId(null)}
          onCancel={() => askCancel(detail)}
          onUnblock={() => askUnblock(detail)}
          onCollect={() => {
            setDetailId(null)
            setCollectId(detail.id)
          }}
        />
      )}
      {collect && (
        <MobilePaymentSheet
          businessId={businessId}
          booking={collect}
          court={courtOf(collect)}
          onClose={() => setCollectId(null)}
          onSaved={(amount) => {
            setCollectId(null)
            flash(`Cobro registrado · ${formatMoneyARS(amount)}`)
          }}
        />
      )}
      {blockTarget && blockCourt && (
        <MobileBlockSheet
          businessId={businessId}
          date={date}
          court={blockCourt}
          hour={blockTarget.hour}
          onClose={() => setBlockTarget(null)}
          onSaved={() => {
            setBlockTarget(null)
            flash('Turno bloqueado')
          }}
        />
      )}
      {resumenOpen && (
        <MobileResumenScreen businessId={businessId} date={date} onBack={() => setResumenOpen(false)} />
      )}

      <ConfirmDialog
        request={confirm}
        onClose={() => setConfirm(null)}
        pending={cancelBooking.isPending || deleteException.isPending}
      />
      <Toast toast={toast} onUndo={dismiss} />
    </div>
  )
}

function Metric({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <span className="flex-1 min-w-0 text-center">
      <span
        className="tnum font-mono font-bold text-[16px] block truncate"
        style={{ color: color ?? 'var(--ink-900)' }}
      >
        {value}
      </span>
      <span className="text-[10.5px] text-ink-500 block mt-px">{label}</span>
    </span>
  )
}

function FreeBand({ from, to, onExpand }: { from: number; to: number; onExpand: () => void }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className="w-full flex items-center gap-2.5 mb-2 px-3.5 py-2.5 rounded-md border border-dashed border-ink-200 bg-ink-50 cursor-pointer text-left min-h-[44px]"
    >
      <Sun size={16} className="text-ink-400 flex-none" aria-hidden />
      <span className="tnum font-mono font-bold text-caption text-ink-700">
        {hFmt(from)} – {hFmt(to)}
      </span>
      <span className="flex-1 text-caption text-ink-500">· todo libre</span>
      <ChevronDown size={16} className="text-ink-400 flex-none" aria-hidden />
    </button>
  )
}

function NowMarker({ nowHour }: { nowHour: number }) {
  return (
    <div className="flex items-center gap-2 mb-2 pointer-events-none">
      <div className="w-[50px] flex-none text-right pr-1">
        <span className="tnum bg-green-500 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-[4px]">
          {hFmt(nowHour)}
        </span>
      </div>
      <div className="flex-1 h-0.5 bg-green-500 rounded-sm relative">
        <span className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-green-500" />
      </div>
    </div>
  )
}

function AgendaSkeleton() {
  return (
    <div aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex gap-2 pb-2">
          <div className="w-[50px] flex-none">
            <div className="h-3.5 w-9 rounded bg-ink-100" />
          </div>
          <div className={cn('flex-1 grid gap-1.5', 'grid-cols-3')}>
            {Array.from({ length: 3 }, (_, j) => (
              <div key={j} className="h-16 rounded-sm bg-ink-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
