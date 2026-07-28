export interface SubscriptionBannerProps {
  /** Días hasta el vencimiento. Negativo o cero significa que ya venció. */
  daysLeft: number | null
  /** El complejo ya está bloqueado en modo solo lectura. */
  readOnly: boolean
  /** Sólo el OWNER puede pagar; al resto se le indica a quién avisar. */
  canPay: boolean
  onUpgrade?: () => void
  onDismiss?: () => void
}

type Tier = 'info' | 'warning' | 'critical' | 'locked'

// El aviso arranca 10 días antes y sube de tono a medida que se acerca: a 10 días
// es un dato, a 5 aparece la consecuencia, a 1 es una alarma que no se puede cerrar.
const NOTICE_WINDOW_DAYS = 10

function resolveTier(daysLeft: number | null, readOnly: boolean): Tier | null {
  if (readOnly) return 'locked'
  if (daysLeft === null || daysLeft > NOTICE_WINDOW_DAYS) return null
  if (daysLeft <= 1) return 'critical'
  if (daysLeft <= 5) return 'warning'
  return 'info'
}

const STYLES: Record<Tier, { bg: string; accent: string }> = {
  info: { bg: 'var(--ink-800)', accent: 'var(--ink-900)' },
  warning: { bg: '#B45309', accent: '#B45309' },
  critical: { bg: 'rgba(220,38,38,.95)', accent: '#DC2626' },
  locked: { bg: '#B91C1C', accent: '#B91C1C' },
}

function copyFor(tier: Tier, daysLeft: number | null): { pill: string; title: string; sub: string } {
  if (tier === 'locked') {
    return {
      pill: 'Solo lectura',
      title: 'Tu complejo está en modo solo lectura.',
      sub: 'Podés ver y cancelar tus reservas, pero no cargar nuevas ni editar canchas u horarios.',
    }
  }

  const days = daysLeft ?? 0
  const when = days <= 0 ? 'hoy' : days === 1 ? 'mañana' : `en ${days} días`

  if (tier === 'critical') {
    return {
      pill: days <= 0 ? 'Vence hoy' : '1 día restante',
      title: `Tu plan vence ${when}.`,
      sub: 'Cuando venza vas a poder ver tus reservas, pero no crear ni editar nada.',
    }
  }
  if (tier === 'warning') {
    return {
      pill: `${days} días restantes`,
      title: `Tu plan vence ${when}.`,
      sub: 'Al vencer, el complejo pasa a solo lectura: no vas a poder cargar reservas ni editar canchas.',
    }
  }
  return {
    pill: `${days} días restantes`,
    title: `Tu plan vence ${when}.`,
    sub: 'Renovalo antes de esa fecha para no interrumpir el servicio.',
  }
}

export function SubscriptionBanner({
  daysLeft,
  readOnly,
  canPay,
  onUpgrade,
  onDismiss,
}: SubscriptionBannerProps) {
  const tier = resolveTier(daysLeft, readOnly)
  if (!tier) return null

  const { bg, accent } = STYLES[tier]
  const { pill, title, sub } = copyFor(tier, daysLeft)
  const dismissible = tier === 'info' && !!onDismiss

  return (
    <div
      role={tier === 'info' ? undefined : 'alert'}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '10px 20px', background: bg, color: 'white', flexShrink: 0,
      }}
    >
      <span style={{
        padding: '3px 10px', borderRadius: 'var(--r-full)',
        background: 'rgba(255,255,255,.15)', color: 'white',
        fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {pill}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{title}</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', flex: 1 }}>{sub}</span>

      {canPay ? (
        <button
          type="button"
          onClick={onUpgrade}
          data-testid="subscription-banner-cta"
          style={{
            padding: '7px 16px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer',
            background: 'white', color: accent,
            fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0,
            fontFamily: 'var(--font-body)',
          }}
        >
          {tier === 'locked' ? 'Reactivar ahora' : 'Elegir plan'}
        </button>
      ) : (
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          Avisale al dueño del complejo
        </span>
      )}

      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar aviso de vencimiento"
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
