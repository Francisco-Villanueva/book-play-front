import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { cn } from '@/shared/utils/cn'
import { useCourts } from '@/features/courts/hooks/useCourts'
import { useBookings } from '@/features/bookings/hooks/useBookings'
import { courtColor } from '@/features/admin/components/courtTypes'
import { addDaysISO, formatShortDay, timeToHours, todayISO } from '@/shared/utils/date'
import type { Booking } from '@/shared/types/domain'

const WH_S = 8
const WH_E = 23
const TOTAL_SLOTS = WH_E - WH_S

function mondayOf(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  const dow = d.getDay() // 0=Sun..6=Sat
  const diff = dow === 0 ? -6 : 1 - dow
  return addDaysISO(iso, diff)
}

function hourSlots(bookings: Booking[], courtId: string, date: string): boolean[] {
  const dayBookings = bookings.filter((b) => b.courtId === courtId && b.date === date && b.status === 'ACTIVE')
  return Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const h = WH_S + i
    return dayBookings.some((b) => timeToHours(b.startTime) <= h && timeToHours(b.endTime) > h)
  })
}

function WeekCell({ slots, onDayClick }: { slots: boolean[]; onDayClick: () => void }) {
  const booked = slots.filter(Boolean).length
  const pct = slots.length > 0 ? Math.round((booked / slots.length) * 100) : 0
  const barColor = pct > 72 ? '#dc2626' : pct > 50 ? 'var(--amber-500)' : 'var(--action-primary)'
  const cellBg = pct > 72 ? 'rgba(220,38,38,.05)' : pct > 50 ? 'var(--amber-50)' : 'var(--green-50)'

  return (
    <button
      type="button"
      onClick={onDayClick}
      className="text-left w-full cursor-pointer transition-opacity hover:opacity-80 rounded-md"
      style={{ background: cellBg, border: '1px solid var(--border-subtle)', padding: '8px 7px' }}
    >
      <div className="flex gap-[2px] mb-1.5">
        {slots.map((booked_, i) => (
          <div key={i} className="flex-1 rounded-[1.5px]" style={{ height: 7, background: booked_ ? 'var(--state-booked-bd)' : 'var(--green-100)' }} />
        ))}
      </div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono font-bold text-[12px] text-ink-900">{booked}</span>
        <span className="text-[10px] text-ink-400">/{slots.length}</span>
      </div>
      <div className="h-[3px] rounded-full bg-ink-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </button>
  )
}

export default function AdminSchedulePage() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Todas')
  const [weekOffset, setWeekOffset] = useState(0)

  const { data: rawCourts, isLoading: courtsLoading } = useCourts(businessId)
  const { data: rawBookings, isLoading: bookingsLoading } = useBookings(businessId)

  const weekStart = useMemo(() => addDaysISO(mondayOf(todayISO()), weekOffset * 7), [weekOffset])
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i)), [weekStart])
  const today = todayISO()

  const courts = (rawCourts ?? []).filter((c) => c.isActive)
  const sports = ['Todas', ...new Set(courts.map((c) => c.sportType ?? '—'))]
  const filteredCourts = filter === 'Todas' ? courts : courts.filter((c) => (c.sportType ?? '—') === filter)
  const bookings = rawBookings ?? []

  function dayOcc(iso: string) {
    let booked = 0, total = 0
    for (const c of courts) {
      const slots = hourSlots(bookings, c.id, iso)
      booked += slots.filter(Boolean).length
      total += slots.length
    }
    return total > 0 ? Math.round((booked / total) * 100) : 0
  }

  const weekLabel = `${formatShortDay(weekStart).day} – ${formatShortDay(weekDays[6]!).day}`

  return (
    <AdminShell title="Vista semanal" subtitle={weekLabel}>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex-none px-5 py-2.5 bg-white border-b border-ink-100 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setWeekOffset((w) => w - 1)} className="p-1.5 border border-ink-100 rounded-md bg-ink-50 cursor-pointer" aria-label="Semana anterior"><ChevronLeft size={14} aria-hidden /></button>
            <div className="text-center min-w-[168px]">
              <p className="font-display font-bold text-[14px] text-ink-900">{weekLabel}</p>
              {weekOffset === 0 && <p className="text-[11px] text-green-600 font-bold mt-0.5">● Esta semana</p>}
            </div>
            <button type="button" onClick={() => setWeekOffset((w) => w + 1)} className="p-1.5 border border-ink-100 rounded-md bg-ink-50 cursor-pointer" aria-label="Semana siguiente"><ChevronRight size={14} aria-hidden /></button>
          </div>

          <div className="w-px h-6 bg-ink-100 flex-none" />

          <div className="flex gap-1.5">
            {sports.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={cn(
                  'px-2.5 py-1 rounded-full border-[1.5px] text-[12px] font-semibold cursor-pointer transition-colors',
                  filter === s
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-ink-200 bg-transparent text-ink-500',
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2.5">
            {[
              { color: 'var(--green-100)', label: 'Libre' },
              { color: 'var(--state-booked-bd)', label: 'Ocupado' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1">
                <span className="w-2.5 h-1.5 rounded-[2px] flex-none" style={{ background: l.color }} />
                <span className="text-[11px] text-ink-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto p-5">
          {courtsLoading || bookingsLoading ? (
            <p className="text-center text-body-sm text-ink-400 py-12">Cargando…</p>
          ) : filteredCourts.length === 0 ? (
            <p className="text-center text-body-sm text-ink-400 py-12">Todavía no hay canchas cargadas.</p>
          ) : (
            <div style={{ minWidth: 820 }}>
              {/* Day headers */}
              <div className="grid gap-1.5 mb-2" style={{ gridTemplateColumns: '152px repeat(7, 1fr)' }}>
                <div />
                {weekDays.map((iso) => {
                  const occ = dayOcc(iso)
                  const barC = occ > 72 ? '#dc2626' : occ > 50 ? 'var(--amber-500)' : 'var(--action-primary)'
                  const isToday = iso === today
                  const { weekday, day } = formatShortDay(iso)
                  return (
                    <div
                      key={iso}
                      className="text-center px-1 pt-2 pb-1.5 rounded-md"
                      style={{
                        background: isToday ? 'var(--green-50)' : 'transparent',
                        border: isToday ? '1px solid var(--green-200)' : '1px solid transparent',
                      }}
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: isToday ? 'var(--green-700)' : 'var(--text-subtle)' }}>{weekday}</p>
                      <p className="font-display font-extrabold text-[22px] tracking-tight leading-tight" style={{ color: isToday ? 'var(--green-700)' : 'var(--text-strong)' }}>{day}</p>
                      <div className="h-[3px] rounded-full bg-ink-100 mx-2 mt-1.5 mb-0.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${occ}%`, background: barC }} />
                      </div>
                      <p className="text-[10px] text-ink-400 font-mono">{occ}% lleno</p>
                    </div>
                  )
                })}
              </div>

              {/* Court rows */}
              {filteredCourts.map((c) => (
                <div key={c.id} className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: '152px repeat(7, 1fr)' }}>
                  <div
                    className="flex items-center gap-2 px-2.5 rounded-md bg-white border border-ink-100"
                    style={{ minHeight: 64 }}
                  >
                    <span className="w-2 h-2 rounded-full flex-none" style={{ background: courtColor(c.sportType) }} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-ink-900">{c.name}</p>
                      <p className="text-[11px] text-ink-500">{c.sportType ?? '—'}</p>
                    </div>
                  </div>
                  {weekDays.map((iso) => (
                    <WeekCell
                      key={iso}
                      slots={hourSlots(bookings, c.id, iso)}
                      onDayClick={() => navigate(`/admin/${businessId}/agenda`)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
