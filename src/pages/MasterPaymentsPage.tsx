import { useState } from 'react'
import { Plus, RefreshCw, Archive, ArchiveRestore } from 'lucide-react'
import { MasterShell } from '@/features/master/components/MasterShell'
import {
  useArchivePlan,
  useCreatePlan,
  useMasterPlans,
  useRestorePlan,
  useSyncPlanMercadoPago,
  useUpdatePlan,
} from '@/features/plans/hooks/usePlans'
import { PlanFormPanel } from '@/features/plans/components/PlanFormPanel'
import type { PlanFormPayload } from '@/features/plans/api/plansApi'
import { useMasterTransactions, useMrr } from '@/features/billing/hooks/useMasterBilling'
import type { Plan } from '@/shared/types/domain'

type Tab = 'catalog' | 'transactions'
type PanelState = 'new' | Plan | null

const STATUS_LABEL: Record<string, string> = {
  APPROVED: 'Pagado', PENDING: 'Pendiente', REJECTED: 'Fallido', REFUNDED: 'Reembolsado',
}

export default function MasterPaymentsPage() {
  const [tab, setTab] = useState<Tab>('catalog')
  const [panel, setPanel] = useState<PanelState>(null)

  const { data: plans, isLoading, isError } = useMasterPlans()
  const { data: mrr } = useMrr(6)
  const { data: transactions, isLoading: txLoading } = useMasterTransactions({ limit: 50 })

  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const archivePlan = useArchivePlan()
  const restorePlan = useRestorePlan()
  const syncPlan = useSyncPlanMercadoPago()

  const list = plans ?? []
  const currentMrr = mrr && mrr.length > 0 ? mrr[mrr.length - 1]!.mrr : 0
  const activePlans = list.filter((p) => !p.isArchived).length
  const totalSubscribers = list.reduce((sum, p) => sum + (p.subscribersCount ?? 0), 0)

  const handleSave = (values: PlanFormPayload, id?: string) => {
    if (id) {
      updatePlan.mutate({ planId: id, data: values }, { onSuccess: () => setPanel(null) })
    } else {
      createPlan.mutate(values, { onSuccess: () => setPanel(null) })
    }
  }

  return (
    <MasterShell title="Pagos" subtitle="Catálogo de planes, MRR y transacciones">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Stats row */}
        <div style={{ flexShrink: 0, padding: '16px 24px', display: 'flex', gap: 14, borderBottom: '1px solid var(--border-subtle)' }}>
          {[
            { label: 'MRR actual', value: `$${currentMrr.toLocaleString('es-AR')}` },
            { label: 'Planes activos', value: String(activePlans) },
            { label: 'Suscriptores totales', value: String(totalSubscribers) },
          ].map((stat) => (
            <div key={stat.label} style={{ flex: 1, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: '14px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', margin: '0 0 6px' }}>{stat.label}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-strong)', margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ flexShrink: 0, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-card)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            {([['catalog', 'Catálogo de planes'], ['transactions', 'Transacciones']] as [Tab, string][]).map(([k, l]) => {
              const on = tab === k
              return (
                <button key={k} type="button" onClick={() => setTab(k)} style={{ padding: '6px 13px', border: 'none', borderRight: '1px solid var(--border-subtle)', cursor: 'pointer', background: on ? 'var(--surface-card)' : 'transparent', fontSize: 12, fontWeight: on ? 700 : 500, color: on ? 'var(--text-strong)' : 'var(--text-muted)' }}>
                  {l}
                </button>
              )
            })}
          </div>
          <div style={{ flex: 1 }} />
          {tab === 'catalog' && (
            <button
              type="button"
              onClick={() => setPanel('new')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', background: 'var(--action-primary)', color: 'white', fontSize: 12, fontWeight: 700 }}
            >
              <Plus size={14} aria-hidden /> Nuevo plan
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tab === 'catalog' ? (
              <CatalogTable
                plans={list}
                isLoading={isLoading}
                isError={isError}
                onEdit={setPanel}
                onArchive={(id) => archivePlan.mutate(id)}
                onRestore={(id) => restorePlan.mutate(id)}
                onSync={(id) => syncPlan.mutate(id)}
                syncing={syncPlan.isPending}
              />
            ) : (
              <TransactionsTable transactions={transactions ?? []} isLoading={txLoading} />
            )}
          </div>

          {panel !== null && (
            <PlanFormPanel
              plan={panel === 'new' ? null : panel}
              onClose={() => setPanel(null)}
              onSave={handleSave}
              saving={createPlan.isPending || updatePlan.isPending}
            />
          )}
        </div>
      </div>
    </MasterShell>
  )
}

const CATALOG_COLS = '1.5fr 1fr 1fr 1.3fr 90px 110px 100px 140px'
const CATALOG_HEADERS = ['Nombre', 'Código', 'Precio', 'Límites', 'Visible', 'Estado', 'Suscriptores', '']

function CatalogTable({
  plans, isLoading, isError, onEdit, onArchive, onRestore, onSync, syncing,
}: {
  plans: Plan[]
  isLoading: boolean
  isError: boolean
  onEdit: (plan: Plan) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onSync: (id: string) => void
  syncing: boolean
}) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: CATALOG_COLS, gap: 12, padding: '9px 24px', background: 'var(--surface-sunken)', borderBottom: '2px solid var(--border-default)', position: 'sticky', top: 0, zIndex: 2 }}>
        {CATALOG_HEADERS.map((h) => (
          <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)' }}>{h}</span>
        ))}
      </div>
      {isLoading ? (
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--text-subtle)', fontSize: 14 }}>Cargando planes…</p>
      ) : isError ? (
        <p style={{ textAlign: 'center', padding: 48, color: '#B91C1C', fontSize: 14 }}>No pudimos cargar los planes.</p>
      ) : plans.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-subtle)' }}>
          <p style={{ fontSize: 14 }}>Todavía no creaste ningún plan.</p>
        </div>
      ) : (
        plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onEdit(plan)}
            style={{ display: 'grid', gridTemplateColumns: CATALOG_COLS, gap: 12, padding: '12px 24px', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>{plan.name}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{plan.code}</span>
            <span style={{ fontSize: 12, color: 'var(--text-body)', fontFamily: 'var(--font-mono)' }}>
              {plan.priceArs === 0 ? 'Gratis' : `$${plan.priceArs.toLocaleString('es-AR')}`}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {plan.courtsLimit ? `${plan.courtsLimit} canchas` : 'Ilimitado'} · {plan.staffLimit ? `${plan.staffLimit} staff` : 'staff ilimitado'}
            </span>
            <span style={{ fontSize: 12, color: plan.isPubliclyVisible ? 'var(--green-700)' : 'var(--text-subtle)' }}>
              {plan.isPubliclyVisible ? 'Sí' : 'No'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 'var(--r-full)', width: 'fit-content', background: plan.isArchived ? 'var(--ink-50)' : 'var(--green-50)', border: `1px solid ${plan.isArchived ? 'var(--ink-200)' : 'var(--green-200)'}`, fontSize: 11, fontWeight: 700, color: plan.isArchived ? 'var(--text-subtle)' : 'var(--green-700)' }}>
              {plan.isArchived ? 'Archivado' : 'Activo'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{plan.subscribersCount ?? 0}</span>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }} onClick={(e) => e.stopPropagation()}>
              {!plan.mpPreapprovalPlanId && plan.priceArs > 0 && (
                <button type="button" disabled={syncing} onClick={() => onSync(plan.id)} title="Sincronizar con Mercado Pago" style={iconBtnStyle}>
                  <RefreshCw size={13} aria-hidden />
                </button>
              )}
              {plan.isArchived ? (
                <button type="button" onClick={() => onRestore(plan.id)} title="Restaurar" style={iconBtnStyle}>
                  <ArchiveRestore size={13} aria-hidden />
                </button>
              ) : (
                <button type="button" onClick={() => onArchive(plan.id)} title="Archivar" style={iconBtnStyle}>
                  <Archive size={13} aria-hidden />
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </>
  )
}

const iconBtnStyle: React.CSSProperties = {
  padding: 6, borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', display: 'flex', color: 'var(--text-body)',
}

const TX_COLS = '1fr 1.5fr 1fr 1fr 1fr'
const TX_HEADERS = ['Fecha', 'Negocio', 'Plan', 'Monto', 'Estado']

function TransactionsTable({ transactions, isLoading }: { transactions: import('@/features/billing/api/masterBillingApi').Transaction[]; isLoading: boolean }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: TX_COLS, gap: 12, padding: '9px 24px', background: 'var(--surface-sunken)', borderBottom: '2px solid var(--border-default)', position: 'sticky', top: 0, zIndex: 2 }}>
        {TX_HEADERS.map((h) => (
          <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)' }}>{h}</span>
        ))}
      </div>
      {isLoading ? (
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--text-subtle)', fontSize: 14 }}>Cargando transacciones…</p>
      ) : transactions.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-subtle)' }}>
          <p style={{ fontSize: 14 }}>Todavía no hay transacciones.</p>
        </div>
      ) : (
        transactions.map((tx) => (
          <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: TX_COLS, gap: 12, padding: '12px 24px', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {tx.paidAt ? new Date(tx.paidAt).toLocaleDateString('es-AR') : '—'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{tx.business?.name ?? '—'}</span>
            <span style={{ fontSize: 12, color: 'var(--text-body)' }}>{tx.plan?.name ?? '—'}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)', fontFamily: 'var(--font-mono)' }}>${Number(tx.amount).toLocaleString('es-AR')}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{STATUS_LABEL[tx.status] ?? tx.status}</span>
          </div>
        ))
      )}
    </>
  )
}
