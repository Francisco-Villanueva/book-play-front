import { ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { formatLongDateEs, todayISO } from '@/shared/utils/date'
import { DAY_START, DAY_END, DAY_SPAN, type TimelineCourt } from './dashboardData'

const HOUR_MARKS: number[] = []
for (let h = DAY_START; h <= DAY_END; h += 2) HOUR_MARKS.push(h)

function Legend() {
  const items = [
    { label: 'Confirmada', bg: 'var(--state-booked-bg)', bd: 'var(--state-booked-bd)' },
    { label: 'Libre', bg: 'var(--surface-sunken)', bd: 'var(--border-subtle)' },
  ]
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs flex-none" style={{ background: item.bg, border: `1.5px solid ${item.bd}` }} />
          <span className="text-caption text-ink-500">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

interface DashboardAgendaProps {
  courts: TimelineCourt[]
  nowHours: number
  onGoToAgenda: () => void
}

export function DashboardAgenda({ courts, nowHours, onGoToAgenda }: DashboardAgendaProps) {
  const nowPct = ((nowHours - DAY_START) / DAY_SPAN) * 100
  const showNow = nowHours >= DAY_START && nowHours <= DAY_END
  const hasCourts = courts.length > 0

  return (
    <div className="bg-white border border-ink-100 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="font-display font-bold text-[17px] text-ink-900">Agenda de hoy</h2>
          <p className="text-caption text-ink-500 mt-0.5">
            {formatLongDateEs(todayISO())} · 08:00 a 23:00
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Legend />
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={16} aria-hidden />} onClick={onGoToAgenda}>
            Ver agenda completa
          </Button>
        </div>
      </div>

      {!hasCourts ? (
        <p className="text-body-sm text-ink-400 py-8 text-center">No hay canchas activas para mostrar.</p>
      ) : (
        <div className="flex">
          <div className="flex-none" style={{ width: 140 }}>
            <div style={{ height: 26 }} />
            {courts.map((c) => (
              <div key={c.id} className="flex items-center gap-2" style={{ height: 52 }}>
                <span className="w-2 h-2 rounded-full flex-none" style={{ background: c.dot }} />
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-ink-900 truncate">{c.name}</div>
                  <div className="text-[11px] text-ink-400">{c.sport}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 min-w-0 relative">
            <div className="relative" style={{ height: 26 }}>
              {HOUR_MARKS.map((h) => (
                <span
                  key={h}
                  className="absolute font-mono text-[11px] font-bold text-ink-500"
                  style={{
                    left: `${((h - DAY_START) / DAY_SPAN) * 100}%`,
                    transform: h === DAY_START ? 'none' : h === DAY_END ? 'translateX(-100%)' : 'translateX(-50%)',
                  }}
                >
                  {String(h).padStart(2, '0')}:00
                </span>
              ))}
            </div>

            {showNow && (
              <div className="absolute z-[2]" style={{ top: 26, bottom: 0, left: `${nowPct}%`, width: 1.5, background: 'var(--red-500)' }}>
                <span className="absolute rounded-full" style={{ top: -7, left: -3.5, width: 8, height: 8, background: 'var(--red-500)' }} />
              </div>
            )}

            {courts.map((c) => (
              <div key={c.id} className="relative border-t border-ink-100" style={{ height: 52 }}>
                {HOUR_MARKS.map((h) => (
                  <div
                    key={h}
                    className="absolute bg-ink-100"
                    style={{ left: `${((h - DAY_START) / DAY_SPAN) * 100}%`, top: 8, bottom: 8, width: 1 }}
                  />
                ))}
                {c.bookings.map((b) => {
                  const left = ((Math.max(b.start, DAY_START) - DAY_START) / DAY_SPAN) * 100
                  const width = ((Math.min(b.end, DAY_END) - Math.max(b.start, DAY_START)) / DAY_SPAN) * 100
                  return (
                    <div
                      key={b.id}
                      title={`${b.client} · Confirmada`}
                      className="absolute flex items-center px-2 overflow-hidden cursor-pointer rounded-sm"
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 0)}%`,
                        top: 8,
                        bottom: 8,
                        background: 'var(--state-booked-bg)',
                        border: '1.5px solid var(--state-booked-bd)',
                      }}
                    >
                      <span
                        className="text-[11px] font-bold truncate"
                        style={{ color: 'var(--state-booked-fg)' }}
                      >
                        {b.client}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
