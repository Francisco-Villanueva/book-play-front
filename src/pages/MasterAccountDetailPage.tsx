import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MasterShell } from '@/features/master/components/MasterShell'
import { useMasterBusiness } from '@/features/master/hooks/useMaster'
import { useSubscription } from '@/features/billing/hooks/useBilling'
import { useReactivateAccountSubscription } from '@/features/billing/hooks/useMasterBilling'
import type { BusinessRole, SubscriptionStatus } from '@/shared/types/domain'

const SUB_STATUS_BADGE: Record<SubscriptionStatus, { label: string; bg: string; fg: string; bd: string }> = {
  TRIALING: { label: 'Trial', bg: 'var(--ink-50)', fg: 'var(--ink-500)', bd: 'var(--ink-200)' },
  ACTIVE: { label: 'Activa', bg: 'var(--green-50)', fg: 'var(--green-700)', bd: 'var(--green-200)' },
  PAST_DUE: { label: 'Pago pendiente', bg: 'var(--amber-50)', fg: 'var(--amber-700)', bd: 'var(--amber-200)' },
  SUSPENDED: { label: 'Suspendida', bg: '#FEE2E2', fg: '#B91C1C', bd: '#FECACA' },
  CANCELLED: { label: 'Cancelada', bg: 'var(--ink-50)', fg: 'var(--ink-500)', bd: 'var(--ink-200)' },
}

const ROLE_BADGE: Record<BusinessRole, { label: string; bg: string; fg: string; bd: string }> = {
  OWNER: { label: 'Owner', bg: 'var(--blue-50)', fg: 'var(--blue-700)', bd: 'var(--blue-200)' },
  ADMIN: { label: 'Admin', bg: 'var(--amber-50)', fg: 'var(--amber-700)', bd: 'var(--amber-200)' },
  STAFF: { label: 'Staff', bg: 'var(--ink-50)', fg: 'var(--ink-600)', bd: 'var(--ink-200)' },
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function MasterAccountDetailPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const { data: business, isLoading, isError } = useMasterBusiness(businessId)

  if (isLoading) {
    return (
      <MasterShell title="Cargando…">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)' }}>Cargando complejo…</div>
      </MasterShell>
    )
  }

  if (isError || !business) {
    return (
      <MasterShell title="Complejo no encontrado">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>No existe un complejo con ese ID.</p>
          <button type="button" onClick={() => navigate('/master/businesses')} style={{ padding: '8px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            ← Volver a complejos
          </button>
        </div>
      </MasterShell>
    )
  }

  const owner = business.members.find((m) => m.role === 'OWNER')
  const { data: subscription } = useSubscription(businessId)
  const reactivate = useReactivateAccountSubscription()

  return (
    <MasterShell title={business.name}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ flexShrink: 0, padding: '16px 24px', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => navigate('/master/businesses')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, marginBottom: 12, padding: 0 }}
          >
            <ArrowLeft size={14} aria-hidden /> Todos los complejos
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--r-lg)', flexShrink: 0, background: 'var(--action-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>
              {initials(business.name)}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 3px', color: 'var(--text-strong)' }}>{business.name}</h1>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                {business.email ?? 'Sin email'} · Alta: {new Date(business.createdAt).toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>
          {[
            { label: 'Dueño',      value: owner?.name ?? '—' },
            { label: 'Canchas',    value: `${business.courts.length} canchas`, mono: true },
            { label: 'Miembros',   value: `${business.members.length} personas`, mono: true },
            { label: 'Zona horaria', value: business.timezone.split('/').pop()?.replace(/_/g, ' ') ?? business.timezone },
          ].map((row, i) => (
            <div key={row.label} style={{ padding: '12px 20px', borderLeft: i > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', display: 'block', marginBottom: 2 }}>{row.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)', fontFamily: row.mono ? 'var(--font-mono)' : 'var(--font-body)' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px', display: 'flex', gap: 24 }}>
          <div style={{ flex: 1, maxWidth: 420 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', margin: '0 0 8px' }}>Canchas</p>
            <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              {business.courts.length === 0 ? (
                <p style={{ padding: 16, fontSize: 13, color: 'var(--text-subtle)' }}>Sin canchas cargadas.</p>
              ) : (
                business.courts.map((c, i) => (
                  <div key={c.id} style={{ padding: '11px 16px', borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{c.sportType ?? '—'}{c.surface ? ` · ${c.surface}` : ''}</div>
                    </div>
                    {c.pricePerHour != null && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text-strong)' }}>${c.pricePerHour.toLocaleString('es-AR')}/h</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: 420 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', margin: '0 0 8px' }}>Suscripción</p>
            <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', padding: 16 }}>
              {!subscription ? (
                <p style={{ fontSize: 13, color: 'var(--text-subtle)', margin: 0 }}>Cargando…</p>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>{subscription.plan?.name ?? 'Gratis (Trial)'}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 'var(--r-full)',
                      background: SUB_STATUS_BADGE[subscription.status].bg,
                      color: SUB_STATUS_BADGE[subscription.status].fg,
                      border: `1px solid ${SUB_STATUS_BADGE[subscription.status].bd}`,
                    }}>
                      {SUB_STATUS_BADGE[subscription.status].label}
                    </span>
                  </div>
                  {subscription.status === 'SUSPENDED' && (
                    <button
                      type="button"
                      disabled={reactivate.isPending}
                      onClick={() => businessId && reactivate.mutate({ businessId })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', background: 'var(--action-primary)', color: 'white', fontSize: 12, fontWeight: 700 }}
                    >
                      {reactivate.isPending ? 'Reactivando…' : 'Reactivar cuenta'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: 420 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', margin: '0 0 8px' }}>Miembros</p>
            <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              {business.members.length === 0 ? (
                <p style={{ padding: 16, fontSize: 13, color: 'var(--text-subtle)' }}>Sin miembros.</p>
              ) : (
                business.members.map((m, i) => {
                  const rb = ROLE_BADGE[m.role]
                  return (
                    <div key={m.id} style={{ padding: '11px 16px', borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{m.email}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 'var(--r-full)', background: rb.bg, color: rb.fg, border: `1px solid ${rb.bd}` }}>{rb.label}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </MasterShell>
  )
}
