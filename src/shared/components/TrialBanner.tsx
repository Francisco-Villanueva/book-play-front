interface TrialBannerProps {
  daysLeft: number
  onUpgrade?: () => void
  onDismiss?: () => void
}

export function TrialBanner({ daysLeft, onUpgrade, onDismiss }: TrialBannerProps) {
  const urgent = daysLeft <= 3
  const expired = daysLeft === 0

  const bg = expired ? 'rgba(220,38,38,.9)' : urgent ? '#B45309' : 'var(--ink-800)'
  const pillBg = expired || urgent ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.1)'
  const pillLabel = expired ? 'Vencido' : urgent ? `${daysLeft}d restantes` : `${daysLeft} días restantes`

  const copy = expired
    ? 'Tu período de prueba venció.'
    : urgent
    ? `¡Te quedan solo ${daysLeft} día${daysLeft === 1 ? '' : 's'}!`
    : 'Período de prueba activo.'

  const sub = expired
    ? 'Elegí un plan para retomar la operación sin perder tus datos.'
    : 'Elegí un plan antes de que venza para no interrumpir el servicio.'

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '10px 20px', background: bg, color: 'white', flexShrink: 0,
      }}
    >
      <span style={{
        padding: '3px 10px', borderRadius: 'var(--r-full)',
        background: pillBg, color: 'white',
        fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {pillLabel}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{copy}{' '}</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', flex: 1 }}>{sub}</span>
      <button
        type="button"
        onClick={onUpgrade}
        style={{
          padding: '7px 16px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer',
          background: 'white', color: expired ? '#DC2626' : 'var(--ink-900)',
          fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0,
          fontFamily: 'var(--font-body)',
        }}
      >
        {expired ? 'Reactivar ahora' : 'Elegir plan'}
      </button>
      {!expired && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar aviso de trial"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,.5)', fontSize: 18, lineHeight: 1,
            padding: '0 2px', flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
