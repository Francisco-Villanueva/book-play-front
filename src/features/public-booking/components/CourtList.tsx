import { useState } from 'react'
import { ArrowRight, CircleCheck, Clock } from 'lucide-react'
import { Badge } from '@/shared/components/Badge'
import { formatMoneyARS } from '@/shared/utils/date'
import type { Court } from '@/shared/types/domain'
import { courtColor, courtSports, humanizeSport, NEXT_DAYS } from '../lib'
import { useCourtsAvailability, type CourtAvailability } from '../hooks'
import { DateStrip } from './DateStrip'

interface CourtListProps {
  businessId: string
  courts: Court[]
  isLoading: boolean
  isError: boolean
  onPick: (court: Court) => void
}

export function CourtList({ businessId, courts, isLoading, isError, onPick }: CourtListProps) {
  const [date, setDate] = useState(NEXT_DAYS[0]!)
  const [sport, setSport] = useState<string>('Todos')

  const sports = ['Todos', ...courtSports(courts)]
  const filtered = sport === 'Todos' ? courts : courts.filter((c) => c.sportType === sport)
  const availability = useCourtsAvailability(businessId, filtered, date)
  const availCount = filtered.filter((c) => availability[c.id]?.isFull === false).length

  return (
    <>
      <DateStrip selected={date} onSelect={setDate} />

      {sports.length > 1 && (
        <div className="flex gap-1.5 px-4 pt-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {sports.map((s) => {
            const on = sport === s
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSport(s)}
                className="flex-none px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-semibold cursor-pointer transition-colors"
                style={{
                  borderColor: on ? 'var(--action-primary)' : 'var(--border-default)',
                  background: on ? 'var(--green-50)' : 'transparent',
                  color: on ? 'var(--green-700)' : 'var(--text-muted)',
                }}
              >
                {s === 'Todos' ? s : humanizeSport(s)}
              </button>
            )
          })}
        </div>
      )}

      <div className="px-4 pt-3 pb-8 flex flex-col gap-2.5">
        {isLoading ? (
          <p className="text-center text-body-sm text-ink-400 py-12">Cargando canchas…</p>
        ) : isError ? (
          <p className="text-center text-body-sm text-red-600 py-12">No pudimos cargar las canchas de este complejo.</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-body-sm text-ink-400 py-12">No hay canchas para este filtro.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-overline text-ink-400 uppercase">{filtered.length} canchas</span>
              <Badge tone="success" dot>{availCount} con lugar</Badge>
            </div>
            {filtered.map((c) => (
              <CourtCard
                key={c.id}
                court={c}
                availability={availability[c.id]}
                onClick={() => onPick(c)}
              />
            ))}
          </>
        )}
      </div>
    </>
  )
}

function CourtCard({
  court,
  availability,
  onClick,
}: {
  court: Court
  availability: CourtAvailability | undefined
  onClick: () => void
}) {
  const isFull = availability?.isFull ?? false
  const loading = availability?.isLoading ?? true
  const nextFree = availability?.nextFree ?? null

  return (
    <div
      role="button"
      tabIndex={isFull ? -1 : 0}
      onClick={isFull ? undefined : onClick}
      onKeyDown={(e) => !isFull && e.key === 'Enter' && onClick()}
      className="bg-white border-[1.5px] border-ink-100 rounded-lg p-4 shadow-sm transition-all duration-[180ms]"
      style={{
        cursor: isFull ? 'default' : 'pointer',
        opacity: isFull ? 0.6 : 1,
      }}
      data-testid={`public-court-${court.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: courtColor(court.sportType) }} />
            <span className="font-display font-bold text-[16px] text-ink-900 truncate">{court.name}</span>
          </div>
          <p className="text-[12px] text-ink-500 mt-0.5 pl-[18px] truncate">
            {humanizeSport(court.sportType)}{court.surface ? ` · ${court.surface}` : ''}
          </p>
        </div>
        {court.pricePerHour != null && (
          <div className="text-right flex-none">
            <p className="font-mono font-bold text-[15px] text-ink-900">{formatMoneyARS(court.pricePerHour)}</p>
            <p className="text-[10px] text-ink-400 mt-0.5">por hora</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {loading ? (
          <span className="text-[12px] text-ink-400">Buscando horarios…</span>
        ) : isFull ? (
          <span className="text-[12px] text-ink-400 flex items-center gap-1">
            <Clock size={12} className="text-ink-400" aria-hidden /> Completa por hoy
          </span>
        ) : (
          <span className="text-[12px] text-green-700 font-semibold flex items-center gap-1">
            <CircleCheck size={13} className="text-green-500" aria-hidden />
            {nextFree ? <>Libre · próximo: <strong className="font-mono">{nextFree}</strong></> : 'Con lugar'}
          </span>
        )}
        {!isFull && !loading && (
          <div className="flex items-center gap-1 bg-green-500 text-white rounded-full px-3.5 py-1.5 text-[13px] font-bold font-body">
            Reservar <ArrowRight size={13} />
          </div>
        )}
      </div>
    </div>
  )
}
