import type { Plan } from '@/shared/types/domain'
import { featureLabel } from '@/features/plans/featureLabels'

export interface PlanCardProps {
  plan: Plan
  recommended?: boolean
  selected?: boolean
  currentPlan?: boolean
  ctaLabel?: string
  onSelect?: () => void
}

export function PlanCard({ plan, recommended = false, selected = false, currentPlan = false, ctaLabel, onSelect }: PlanCardProps) {
  const isFree = plan.priceArs === 0
  const color = isFree ? 'var(--ink-400)' : 'var(--green-600)'
  const bg = isFree ? 'var(--ink-50)' : 'var(--green-50)'
  const border = selected
    ? `2px solid ${color}`
    : recommended
    ? '2px solid var(--green-400)'
    : '1.5px solid var(--border-default)'

  const limitLines = [
    plan.courtsLimit ? `Hasta ${plan.courtsLimit} canchas` : 'Canchas ilimitadas',
    plan.staffLimit ? `Hasta ${plan.staffLimit} miembros de staff` : 'Staff ilimitado',
  ]
  const featureLines = plan.featureKeys.map((key) => featureLabel(key))

  return (
    <div style={{
      borderRadius: 'var(--r-xl)', border,
      boxShadow: selected || recommended ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      background: 'var(--surface-card)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      {recommended && (
        <div style={{ background: 'var(--action-primary)', color: 'white', textAlign: 'center', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 0' }}>
          ⭐ Recomendado
        </div>
      )}
      <div style={{ padding: '22px 22px 16px', background: bg, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: 4 }}>{plan.name}</div>
        {plan.description && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{plan.description}</div>
        )}
        {!isFree ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-strong)' }}>
              ${plan.priceArs.toLocaleString('es-AR')}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>por mes</span>
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-strong)', letterSpacing: '-0.03em' }}>
            Gratis
            <div style={{ fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--text-subtle)', marginTop: 2 }}>sin tarjeta requerida</div>
          </div>
        )}
      </div>
      <ul style={{ flex: 1, margin: 0, padding: '16px 22px 20px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {[...limitLines, ...featureLines].map((text, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'var(--text-body)' }}>
            <span style={{ width: 17, height: 17, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: isFree ? 'var(--surface-sunken)' : 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: isFree ? 'var(--ink-400)' : 'var(--green-700)' }}>✓</span>
            </span>
            {text}
          </li>
        ))}
      </ul>
      <div style={{ padding: '0 22px 22px' }}>
        {currentPlan ? (
          <div style={{ width: '100%', padding: 11, borderRadius: 'var(--r-md)', textAlign: 'center', background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 700, color: 'var(--text-subtle)', boxSizing: 'border-box' }}>
            Plan actual
          </div>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            style={{
              width: '100%', padding: 12, borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer',
              background: isFree ? 'var(--ink-200)' : 'var(--action-primary)',
              color: isFree ? 'var(--text-body)' : 'white',
              fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', boxSizing: 'border-box',
            }}
          >
            {ctaLabel ?? (isFree ? 'Empezar gratis' : `Elegir ${plan.name}`)}
          </button>
        )}
      </div>
    </div>
  )
}
