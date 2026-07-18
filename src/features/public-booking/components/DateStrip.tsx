import { formatShortDay } from '@/shared/utils/date'
import { NEXT_DAYS } from '../lib'

interface DateStripProps {
  selected: string
  onSelect: (iso: string) => void
}

export function DateStrip({ selected, onSelect }: DateStripProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto py-2.5 px-4 bg-white" style={{ scrollbarWidth: 'none' }}>
      {NEXT_DAYS.map((iso) => {
        const on = selected === iso
        const { weekday, day } = formatShortDay(iso)
        const isToday = iso === NEXT_DAYS[0]
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            className="flex-none w-[52px] py-1.5 rounded-md border-[1.5px] text-center cursor-pointer transition-colors"
            style={{
              borderColor: on ? 'var(--action-primary)' : 'var(--border-default)',
              background: on ? 'var(--action-primary)' : 'transparent',
            }}
            aria-pressed={on}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-wide font-body"
              style={{ color: on ? 'rgba(255,255,255,.75)' : 'var(--text-subtle)' }}
            >
              {isToday ? 'Hoy' : weekday}
            </div>
            <div
              className="text-[17px] font-extrabold font-display tracking-tight"
              style={{ color: on ? 'white' : 'var(--text-strong)' }}
            >
              {day}
            </div>
          </button>
        )
      })}
    </div>
  )
}
