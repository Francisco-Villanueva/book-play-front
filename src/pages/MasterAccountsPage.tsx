import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MasterShell } from '@/features/master/components/MasterShell'
import { useMasterBusinesses } from '@/features/master/hooks/useMaster'

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

const COLS = '2fr 1.2fr 100px 90px 100px'
const HEADERS = ['Complejo', 'Alta', 'Canchas', 'Miembros', '']

export default function MasterAccountsPage() {
  const navigate = useNavigate()
  const { data: businesses, isLoading, isError } = useMasterBusinesses()
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)

  const list = businesses ?? []
  const filtered = list.filter((b) => {
    const q = search.toLowerCase()
    return !q || b.name.toLowerCase().includes(q) || (b.email ?? '').toLowerCase().includes(q)
  })

  return (
    <MasterShell title="Complejos" subtitle="Todos los complejos de la plataforma">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ flexShrink: 0, padding: '12px 24px', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email…"
            style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-strong)', outline: 'none', width: 280 }}
            aria-label="Buscar complejos"
          />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>{filtered.length} complejos</span>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '9px 24px', background: 'var(--surface-sunken)', borderBottom: '2px solid var(--border-default)', position: 'sticky', top: 0, zIndex: 2 }}>
            {HEADERS.map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)' }}>{h}</span>
            ))}
          </div>

          {isLoading ? (
            <p style={{ textAlign: 'center', padding: 48, color: 'var(--text-subtle)', fontSize: 14 }}>Cargando complejos…</p>
          ) : isError ? (
            <p style={{ textAlign: 'center', padding: 48, color: '#B91C1C', fontSize: 14 }}>No pudimos cargar los complejos.</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 48, color: 'var(--text-subtle)', fontSize: 14 }}>Sin resultados.</p>
          ) : (
            filtered.map((b) => (
              <div
                key={b.id}
                onMouseEnter={() => setHovered(b.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(`/master/businesses/${b.id}`)}
                style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '13px 24px', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', background: hovered === b.id ? 'var(--ink-25)' : 'var(--surface-card)', cursor: 'pointer', transition: 'background .1s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', flexShrink: 0, background: 'var(--action-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>
                    {initials(b.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.email ?? '—'}</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(b.createdAt).toLocaleDateString('es-AR')}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>{b.courtsCount}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>{b.membersCount}</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate(`/master/businesses/${b.id}`) }}
                    style={{ padding: '5px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-body)' }}
                  >
                    Ver →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MasterShell>
  )
}
