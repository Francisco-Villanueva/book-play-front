import { useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { addDaysISO, formatLongDateEs, formatShortDay, todayISO } from '@/shared/utils/date'
import { Sheet } from './Sheet'

const DAYS_AHEAD = 14

interface DatePickerSheetProps {
  date: string
  onPick: (date: string) => void
  onClose: () => void
}

export function DatePickerSheet({ date, onPick, onClose }: DatePickerSheetProps) {
  const [selected, setSelected] = useState(date)
  const today = todayISO()
  // Arranca ayer para poder revisar el día anterior sin abrir el calendario.
  const days = Array.from({ length: DAYS_AHEAD + 1 }, (_, i) => addDaysISO(today, i - 1))

  return (
    <Sheet
      onClose={onClose}
      title="Elegí el día"
      subtitle={formatLongDateEs(selected)}
      footer={
        <button
          type="button"
          onClick={() => {
            onPick(selected)
            onClose()
          }}
          className="w-full h-12 rounded-md border-none bg-green-500 text-white shadow-brand font-body font-bold text-body-sm cursor-pointer"
        >
          Ver ese día
        </button>
      }
    >
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
        {days.map((iso) => {
          const { weekday, day } = formatShortDay(iso)
          const on = selected === iso
          return (
            <button
              key={iso}
              type="button"
              aria-pressed={on}
              aria-label={formatLongDateEs(iso)}
              onClick={() => setSelected(iso)}
              className={cn(
                'flex-none w-[54px] py-2.5 rounded-md border-[1.5px] cursor-pointer text-center',
                on ? 'border-green-500 bg-green-50' : 'border-ink-100 bg-white',
              )}
            >
              <div
                className={cn(
                  'text-[11px] font-bold uppercase tracking-wide',
                  on ? 'text-green-700' : 'text-ink-400',
                )}
              >
                {weekday}
              </div>
              <div
                className={cn(
                  'tnum font-mono font-bold text-[19px] mt-0.5',
                  on ? 'text-green-700' : 'text-ink-900',
                )}
              >
                {day}
              </div>
              {iso === today && <div className="w-[5px] h-[5px] rounded-full bg-green-500 mx-auto mt-1" />}
            </button>
          )
        })}
      </div>

      <label className="block mt-4">
        <span className="text-caption font-bold text-ink-700">Otra fecha</span>
        <input
          type="date"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-1.5 w-full h-12 px-3.5 rounded-md border-[1.5px] border-ink-200 bg-white font-body text-[16px] text-ink-900 outline-none focus:border-green-500"
        />
      </label>
    </Sheet>
  )
}
