import { Select } from '@/shared/components/Select'
import { HOUR_START, HOUR_END, type AgendaCourt } from './agendaTypes'

interface TimeOption {
  val: number
  label: string
}

interface NewBookingModalStep1Props {
  courts: AgendaCourt[]
  courtPrices: Record<string, number>
  dateLabel: string
  cid: string | null
  setCid: (cid: string) => void
  startH: number | null
  setStartH: (h: number) => void
  endH: number | null
  setEndH: (h: number) => void
}

const TIME_OPTS: TimeOption[] = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => ({
  val: HOUR_START + i,
  label: `${String(HOUR_START + i).padStart(2, '0')}:00`,
}))

export function NewBookingModalStep1({ courts, courtPrices, dateLabel, cid, setCid, startH, setStartH, endH, setEndH }: NewBookingModalStep1Props) {
  const dur = startH != null && endH != null && endH > startH ? endH - startH : 0
  const court = courts.find((c) => c.id === cid)
  const rawPrice = cid && dur > 0 ? (courtPrices[cid] ?? 0) * dur : null
  const priceStr = rawPrice ? `$${rawPrice.toLocaleString('es-AR')}` : null

  return (
    <div>
      <div className="mb-5">
        <p className="text-[12px] font-bold uppercase tracking-wide text-ink-400 mb-2.5">Cancha</p>
        <div className="grid grid-cols-3 gap-2">
          {courts.map((c) => {
            const on = cid === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCid(c.id)}
                className="text-left px-3 py-2.5 rounded-md cursor-pointer"
                style={{
                  border: `1.5px solid ${on ? 'var(--action-primary)' : 'var(--border-default)'}`,
                  background: on ? 'var(--surface-brand-soft)' : 'var(--surface-sunken)',
                }}
                data-testid={`new-booking-court-${c.id}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full flex-none" style={{ background: c.color }} />
                  <span className="font-bold text-[13px] font-body" style={{ color: on ? 'var(--green-800)' : 'var(--text-strong)' }}>{c.name}</span>
                </div>
                <p className="text-[11px] text-ink-500 pl-3.5">{c.sport}</p>
                {courtPrices[c.id] != null && (
                  <p className="text-[11px] font-mono font-semibold pl-3.5 mt-0.5" style={{ color: on ? 'var(--green-700)' : 'var(--text-subtle)' }}>
                    ${courtPrices[c.id]!.toLocaleString('es-AR')}/h
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[12px] font-bold uppercase tracking-wide text-ink-400 mb-2">Fecha</p>
        <div className="px-3.5 py-2.5 rounded-md bg-ink-50 border border-ink-100 flex items-center justify-between">
          <span className="text-[14px] font-semibold text-ink-900">{dateLabel}</span>
        </div>
      </div>

      <div>
        <p className="text-[12px] font-bold uppercase tracking-wide text-ink-400 mb-2.5">Horario</p>
        <div className="grid gap-2 items-end" style={{ gridTemplateColumns: '1fr 28px 1fr' }}>
          <Select
            label="Desde"
            options={[{ value: '', label: '--:--' }, ...TIME_OPTS.slice(0, -1).map((o) => ({ value: String(o.val), label: o.label }))]}
            value={startH ?? ''}
            onChange={(e) => {
              const v = Number(e.target.value)
              setStartH(v)
              if (endH != null && endH <= v) setEndH(v + 1)
            }}
          />
          <span className="text-center pb-2.5 text-ink-400 text-[18px]">→</span>
          <Select
            label="Hasta"
            options={[{ value: '', label: '--:--' }, ...TIME_OPTS.slice(1).filter((o) => startH == null || o.val > startH).map((o) => ({ value: String(o.val), label: o.label }))]}
            value={endH ?? ''}
            onChange={(e) => setEndH(Number(e.target.value))}
          />
        </div>
        {dur > 0 && priceStr && (
          <div className="mt-3 px-3.5 py-2.5 rounded-md flex justify-between items-center" style={{ background: 'var(--surface-brand-soft)' }}>
            <span className="text-[13px] font-semibold text-green-700">{dur}h · {court?.name}</span>
            <span className="font-mono font-bold text-[16px] text-green-700">{priceStr}</span>
          </div>
        )}
      </div>
    </div>
  )
}
