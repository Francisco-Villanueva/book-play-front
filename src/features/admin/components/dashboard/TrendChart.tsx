import { useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { SegmentedControl } from '@/shared/components/SegmentedControl'
import { formatMoneyARS } from '@/shared/utils/date'
import type { TrendPoint } from './dashboardData'

const METRICS = ['Reservas', 'Ingresos'] as const
type Metric = (typeof METRICS)[number]

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const [metric, setMetric] = useState<Metric>('Reservas')
  const isRes = metric === 'Reservas'

  const vals = data.map((d) => (isRes ? d.res : d.ing))
  const max = Math.max(...vals, 1)
  const first = vals[0] ?? 0
  const last = vals[vals.length - 1] ?? 0
  const deltaPct = first > 0 ? Math.round(((last - first) / first) * 100) : null
  const up = (deltaPct ?? 0) >= 0

  const fmt = (v: number) => (isRes ? String(v) : formatMoneyARS(v))

  return (
    <div className="bg-white border border-ink-100 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1.5 gap-2.5">
        <h2 className="font-display font-bold text-[17px] text-ink-900">Últimos 7 días</h2>
        <SegmentedControl
          options={[...METRICS]}
          value={metric}
          onChange={(v) => setMetric(v as Metric)}
        />
      </div>

      <div className="flex items-center gap-1.5 mb-3.5">
        {deltaPct == null ? (
          <span className="text-[12.5px] text-ink-500">Sin datos de hace 7 días</span>
        ) : (
          <>
            {up ? (
              <TrendingUp size={15} className="text-green-600" aria-hidden />
            ) : (
              <TrendingDown size={15} className="text-red-500" aria-hidden />
            )}
            <span className={`text-[12.5px] font-bold ${up ? 'text-green-600' : 'text-red-500'}`}>
              {up ? '+' : ''}{deltaPct}%
            </span>
            <span className="text-[12.5px] text-ink-500">vs. hace 7 días</span>
          </>
        )}
      </div>

      <div className="flex items-end gap-2" style={{ height: 120 }}>
        {data.map((d, i) => {
          const v = isRes ? d.res : d.ing
          const h = Math.max(6, (v / max) * 100)
          const isLast = i === data.length - 1
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
              <div
                title={fmt(v)}
                className="w-full"
                style={{
                  height: `${h}%`,
                  background: isLast ? 'var(--green-500)' : 'var(--green-100)',
                  borderRadius: '6px 6px 2px 2px',
                }}
              />
              <span className="text-[11px] font-bold text-ink-400">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
