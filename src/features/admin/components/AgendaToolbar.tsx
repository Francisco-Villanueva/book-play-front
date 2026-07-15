import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const LEGEND_ITEMS = [
  { bg: 'var(--green-50)', bd: 'var(--green-200)', label: 'Libre' },
  { bg: 'var(--state-booked-bg)', bd: 'var(--state-booked-bd)', label: 'Ocupado' },
]

interface AgendaToolbarProps {
  dateLabel: string
  isToday: boolean
  onPrevDay: () => void
  onNextDay: () => void
  sports: string[]
  filter: string
  onFilterChange: (filter: string) => void
}

export function AgendaToolbar({ dateLabel, isToday, onPrevDay, onNextDay, sports, filter, onFilterChange }: AgendaToolbarProps) {
  return (
    <div className="flex-none flex items-center gap-3 px-5 py-2.5 bg-white border-b border-ink-100 flex-nowrap">
      <div className="flex items-center gap-1.5 flex-none">
        <button type="button" onClick={onPrevDay} className="p-1.5 border border-ink-100 rounded-md bg-ink-50 cursor-pointer" aria-label="Día anterior">
          <ChevronLeft size={14} aria-hidden />
        </button>
        <div className="text-center min-w-[148px]">
          <p className="font-display font-bold text-[14px] text-ink-900">{dateLabel}</p>
          {isToday && <p className="text-[11px] text-green-600 font-bold mt-0.5">● Hoy</p>}
        </div>
        <button type="button" onClick={onNextDay} className="p-1.5 border border-ink-100 rounded-md bg-ink-50 cursor-pointer" aria-label="Día siguiente">
          <ChevronRight size={14} aria-hidden />
        </button>
      </div>

      <div className="w-px h-6 bg-ink-100 flex-none" />

      <div className="flex gap-1.5">
        {sports.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onFilterChange(s)}
            className={cn(
              'px-2.5 py-1 rounded-full border-[1.5px] text-[12px] font-semibold cursor-pointer transition-colors',
              filter === s ? 'border-green-500 bg-green-50 text-green-700' : 'border-ink-200 bg-transparent text-ink-500',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5">
        {LEGEND_ITEMS.map((it) => (
          <div key={it.label} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[3px] flex-none" style={{ background: it.bg, border: `1.5px solid ${it.bd}` }} />
            <span className="text-[12px] text-ink-500">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
