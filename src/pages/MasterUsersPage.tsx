import { useState } from 'react'
import { X } from 'lucide-react'
import { MasterShell } from '@/features/master/components/MasterShell'
import { useMasterUsers } from '@/features/master/hooks/useMaster'
import type { MasterUser } from '@/features/master/api/masterApi'

type RoleFilter = 'all' | 'MASTER' | 'PLAYER'

const ROLE_CFG: Record<'MASTER' | 'PLAYER', { label: string; bg: string; fg: string; bd: string; avatarBg: string }> = {
  MASTER: { label: 'Master', bg: 'rgba(139,92,246,.1)', fg: '#6D28D9', bd: 'rgba(139,92,246,.25)', avatarBg: '#6D28D9' },
  PLAYER: { label: 'Jugador', bg: 'var(--green-50)', fg: 'var(--green-700)', bd: 'var(--green-200)', avatarBg: 'var(--action-primary)' },
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

const COLS = '2fr 2fr 1.5fr 90px 110px 120px'
const HEADERS = ['Usuario', 'Email', 'Negocios', 'Rol', 'Alta', '']

export default function MasterUsersPage() {
  const { data: users, isLoading, isError } = useMasterUsers()
  const [search, setSearch] = useState('')
  const [roleF, setRoleF] = useState<RoleFilter>('all')
  const [hovered, setHovered] = useState<string | null>(null)
  const [detail, setDetail] = useState<MasterUser | null>(null)

  const list = users ?? []
  const filtered = list.filter((u) => {
    const q = search.toLowerCase()
    const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    return matchQ && (roleF === 'all' || u.globalRole === roleF)
  })

  const totals = { MASTER: list.filter((u) => u.globalRole === 'MASTER').length, PLAYER: list.filter((u) => u.globalRole === 'PLAYER').length }

  return (
    <MasterShell title="Usuarios" subtitle="Todos los usuarios de la plataforma">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Toolbar */}
        <div style={{ flexShrink: 0, padding: '12px 24px', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', flex: 1, maxWidth: 320 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o email…" style={{ border: 'none', background: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-strong)', width: '100%' }} />
            {search !== '' && <button type="button" onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}><X size={13} /></button>}
          </div>
          <div style={{ display: 'flex', background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            {([['all', `Todos (${list.length})`], ['MASTER', `Master (${totals.MASTER})`], ['PLAYER', `Jugadores (${totals.PLAYER})`]] as [RoleFilter, string][]).map(([k, l]) => {
              const on = roleF === k
              return <button key={k} type="button" onClick={() => setRoleF(k)} style={{ padding: '6px 13px', border: 'none', borderRight: '1px solid var(--border-subtle)', cursor: 'pointer', background: on ? 'var(--surface-card)' : 'transparent', fontSize: 12, fontWeight: on ? 700 : 500, color: on ? 'var(--text-strong)' : 'var(--text-muted)' }}>{l}</button>
            })}
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>{filtered.length} / {list.length} usuarios</span>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '9px 24px', background: 'var(--surface-sunken)', borderBottom: '2px solid var(--border-default)', position: 'sticky', top: 0, zIndex: 2 }}>
            {HEADERS.map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)' }}>{h}</span>
            ))}
          </div>
          {isLoading ? (
            <p style={{ textAlign: 'center', padding: 48, color: 'var(--text-subtle)', fontSize: 14 }}>Cargando usuarios…</p>
          ) : isError ? (
            <p style={{ textAlign: 'center', padding: 48, color: '#B91C1C', fontSize: 14 }}>No pudimos cargar los usuarios.</p>
          ) : (
            filtered.map((u) => {
              const rc = ROLE_CFG[u.globalRole]
              return (
                <div
                  key={u.id}
                  onMouseEnter={() => setHovered(u.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setDetail(u)}
                  style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '12px 24px', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', background: hovered === u.id ? 'var(--ink-25)' : 'var(--surface-card)', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: rc.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white' }}>
                      {initials(u.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.businessesCount > 0 ? `${u.businessesCount} negocio${u.businessesCount > 1 ? 's' : ''}` : '—'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 'var(--r-full)', background: rc.bg, border: `1px solid ${rc.bd}`, fontSize: 11, fontWeight: 700, color: rc.fg }}>{rc.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(u.createdAt).toLocaleDateString('es-AR')}</span>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setDetail(u) }} style={{ padding: '5px 10px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--text-body)' }}>Ver →</button>
                  </div>
                </div>
              )
            })
          )}
          {!isLoading && !isError && filtered.length === 0 && (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-subtle)' }}>
              <p style={{ marginTop: 10, fontSize: 14 }}>Sin resultados</p>
            </div>
          )}
        </div>

        {/* Side panel */}
        {detail !== null && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setDetail(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 360, height: '100%', background: 'var(--surface-card)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>Detalle de usuario</span>
                <button type="button" onClick={() => setDetail(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
              </div>
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: ROLE_CFG[detail.globalRole].avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white' }}>
                    {initials(detail.name)}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>{detail.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{detail.email}</div>
                  </div>
                </div>
                {[
                  { label: 'Rol',    value: ROLE_CFG[detail.globalRole].label },
                  { label: 'Teléfono', value: detail.phone ?? '—' },
                  { label: 'Alta',   value: new Date(detail.createdAt).toLocaleDateString('es-AR') },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{row.value}</span>
                  </div>
                ))}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', margin: '10px 0 8px' }}>Negocios</p>
                  {detail.businesses.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>No participa de ningún negocio.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {detail.businesses.map((b) => (
                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{b.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{b.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MasterShell>
  )
}
