import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useCourts } from '@/features/courts/hooks/useCourts'
import { useBookings } from '@/features/bookings/hooks/useBookings'
import { addDaysISO, formatShortDay, timeToHours, todayISO } from '@/shared/utils/date'
import { HOUR_END, HOUR_START } from '../agendaTypes'
import { MobileSubScreen } from './MobileSubScreen'

const SLOTS_PER_DAY = HOUR_END - HOUR_START

function mondayOf(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  const dow = d.getDay()
  return addDaysISO(iso, dow === 0 ? -6 : 1 - dow)
}

function occupancyColor(pct: number): string {
  if (pct > 72) return 'var(--red-500)'
  if (pct > 50) return 'var(--amber-500)'
  return 'var(--green-500)'
}

// La matriz 7 × canchas del escritorio no entra en un celular sin scroll en dos
// ejes. En mobile se reemplaza por la ocupación de cada día, que es la lectura
// que el dueño hace de esa pantalla; el detalle se ve entrando al día.
export function MobileWeekScreen() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const [weekOffset, setWeekOffset] = useState(0)

  const today = todayISO()
  const weekStart = useMemo(() => addDaysISO(mondayOf(today), weekOffset * 7), [today, weekOffset])
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i)),
    [weekStart],
  )

  const { data: rawCourts, isLoading: courtsLoading } = useCourts(businessId)
  const { data: rawBookings, isLoading: bookingsLoading } = useBookings(businessId, {
    dateFrom: weekStart,
    dateTo: weekDays[6]!,
    status: 'ACTIVE',
  })

  const courts = useMemo(() => (rawCourts ?? []).filter((c) => c.isActive), [rawCourts])
  const bookings = useMemo(() => rawBookings ?? [], [rawBookings])

  const days = useMemo(
    () =>
      weekDays.map((iso) => {
        let booked = 0
        for (const court of courts) {
          const dayBookings = bookings.filter((b) => b.courtId === court.id && b.date === iso)
          for (let i = 0; i < SLOTS_PER_DAY; i++) {
            const h = HOUR_START + i
            if (dayBookings.some((b) => timeToHours(b.startTime) <= h && timeToHours(b.endTime) > h)) {
              booked++
            }
          }
        }
        const total = SLOTS_PER_DAY * courts.length
        const reservations = bookings.filter((b) => b.date === iso).length
        return {
          iso,
          booked,
          free: total - booked,
          reservations,
          pct: total > 0 ? Math.round((booked / total) * 100) : 0,
        }
      }),
    [weekDays, courts, bookings],
  )

  const weekLabel = `${formatShortDay(weekStart).day} – ${formatShortDay(weekDays[6]!).day}`
  const isLoading = courtsLoading || bookingsLoading

  return (
    <MobileSubScreen
      title="Vista semanal"
      subtitle={weekOffset === 0 ? 'Esta semana' : weekLabel}
      toolbar={
        <div className="flex items-center gap-1 px-3 py-2">
          <button
            type="button"
            aria-label="Semana anterior"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="w-11 h-11 flex-none rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-ink-700" aria-hidden />
          </button>
          <div className="flex-1 text-center">
            <p className="font-display font-bold text-[15px] text-ink-900">{weekLabel}</p>
            {weekOffset === 0 && <p className="text-[11px] font-bold text-green-600">● Esta semana</p>}
          </div>
          <button
            type="button"
            aria-label="Semana siguiente"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="w-11 h-11 flex-none rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center"
          >
            <ChevronRight size={20} className="text-ink-700" aria-hidden />
          </button>
        </div>
      }
    >
      {isLoading ? (
        <p className="py-12 text-center text-body-sm text-ink-400">Cargando…</p>
      ) : courts.length === 0 ? (
        <p className="py-12 text-center text-body-sm text-ink-500">Todavía no hay canchas cargadas.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {days.map((day) => {
            const { weekday, day: dayNum } = formatShortDay(day.iso)
            const isToday = day.iso === today
            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => navigate(`/admin/${businessId}/agenda?fecha=${day.iso}`)}
                aria-label={`${weekday} ${dayNum}, ${day.pct}% ocupado, ${day.free} turnos libres`}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-3 rounded-lg border bg-white cursor-pointer text-left min-h-[68px]',
                  isToday ? 'border-green-200 bg-green-50' : 'border-ink-100',
                )}
              >
                <div className="w-12 flex-none text-center">
                  <p
                    className={cn(
                      'text-[11px] font-bold uppercase tracking-wide',
                      isToday ? 'text-green-700' : 'text-ink-400',
                    )}
                  >
                    {weekday}
                  </p>
                  <p
                    className={cn(
                      'tnum font-display font-extrabold text-[22px] leading-tight',
                      isToday ? 'text-green-700' : 'text-ink-900',
                    )}
                  >
                    {dayNum}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-caption font-semibold text-ink-700">
                      {day.reservations === 1 ? '1 reserva' : `${day.reservations} reservas`}
                    </span>
                    <span className="tnum font-mono text-[12.5px] font-bold text-ink-900">{day.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${day.pct}%`, background: occupancyColor(day.pct) }}
                    />
                  </div>
                  <p className="text-[11px] text-ink-500 mt-1">
                    {day.free === 0 ? 'Completo' : `${day.free} turnos libres`}
                  </p>
                </div>

                <ChevronRight size={18} className="text-ink-400 flex-none" aria-hidden />
              </button>
            )
          })}
        </div>
      )}
    </MobileSubScreen>
  )
}
