interface FeatureGateProps {
  feature: string
  requiredPlan: 'basic' | 'pro'
  description?: string
  compact?: boolean
  onUpgrade?: () => void
}

export function FeatureGate({ feature, requiredPlan, description, compact = false, onUpgrade }: FeatureGateProps) {
  const planLabel = requiredPlan === 'pro' ? 'Pro' : 'Basic'
  const planColor = requiredPlan === 'pro' ? 'var(--green-700)' : 'var(--blue-700)'
  const planBg    = requiredPlan === 'pro' ? 'var(--green-50)'  : 'var(--blue-50)'
  const planBd    = requiredPlan === 'pro' ? 'var(--green-200)' : 'var(--blue-200)'
  const ctaBg     = requiredPlan === 'pro' ? 'var(--action-primary)' : 'var(--blue-600)'

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px', borderRadius: 'var(--r-md)', background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: 13 }}>🔒</span>
        <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontWeight: 600 }}>{feature}</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--r-full)', background: planBg, color: planColor, border: `1px solid ${planBd}` }}>
          Plan {planLabel}
        </span>
        <button
          type="button"
          onClick={onUpgrade}
          style={{ padding: '4px 10px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', background: ctaBg, color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)' }}
        >
          Actualizar
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 28px', borderRadius: 'var(--r-xl)', background: 'var(--surface-card)', border: '1.5px dashed var(--border-default)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--surface-sunken)', border: '2px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
        🔒
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 4px', color: 'var(--text-strong)' }}>
          {feature}
        </h3>
        {description && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{description}</p>
        )}
      </div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 'var(--r-full)', background: planBg, border: `1px solid ${planBd}`, fontSize: 12, fontWeight: 700, color: planColor }}>
        Disponible en el plan {planLabel}
      </span>
      <button
        type="button"
        onClick={onUpgrade}
        style={{ padding: '10px 24px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', background: ctaBg, color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)' }}
      >
        Actualizar a {planLabel}
      </button>
    </div>
  )
}
