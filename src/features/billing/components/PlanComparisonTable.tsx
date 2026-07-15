import { cn } from '@/shared/utils/cn'
import type { Plan } from '@/shared/types/domain'
import { featureLabel } from '@/features/plans/featureLabels'

interface PlanComparisonTableProps {
  plans: Plan[]
}

function ValueCell({ value }: { value: string }) {
  return (
    <div
      className={cn(
        'px-[18px] py-[11px] text-center text-caption',
        value === '✓' && 'font-extrabold text-green-600',
        value === '—' && 'text-ink-300',
        value !== '✓' && value !== '—' && 'text-ink-700',
      )}
    >
      {value}
    </div>
  )
}

export function PlanComparisonTable({ plans }: PlanComparisonTableProps) {
  const allFeatureKeys = [...new Set(plans.flatMap((p) => p.featureKeys))]

  const rows: { feature: string; values: string[] }[] = [
    { feature: 'Canchas', values: plans.map((p) => (p.courtsLimit ? `Hasta ${p.courtsLimit}` : 'Ilimitadas')) },
    { feature: 'Staff', values: plans.map((p) => (p.staffLimit ? `Hasta ${p.staffLimit}` : 'Ilimitado')) },
    ...allFeatureKeys.map((key) => ({
      feature: featureLabel(key),
      values: plans.map((p) => (p.featureKeys.includes(key) ? '✓' : '—')),
    })),
  ]

  return (
    <div className="bg-white rounded-xl border border-ink-100 overflow-hidden overflow-x-auto">
      <div
        className="grid border-b-2 border-ink-200 bg-ink-50"
        style={{ gridTemplateColumns: `2fr repeat(${plans.length}, 1fr)` }}
      >
        <div className="px-[18px] py-3 text-overline text-ink-400">Feature</div>
        {plans.map((plan) => (
          <div key={plan.id} className="px-[18px] py-3 text-caption font-bold text-center text-ink-700">
            {plan.name}
          </div>
        ))}
      </div>
      {rows.map((row, i) => (
        <div
          key={row.feature}
          className={cn('grid border-t border-ink-100', i % 2 === 1 && 'bg-ink-25')}
          style={{ gridTemplateColumns: `2fr repeat(${plans.length}, 1fr)` }}
        >
          <div className="px-[18px] py-[11px] text-caption font-medium text-ink-700">{row.feature}</div>
          {row.values.map((value, j) => (
            <ValueCell key={j} value={value} />
          ))}
        </div>
      ))}
    </div>
  )
}
