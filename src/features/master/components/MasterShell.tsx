import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Building2, Users, ToggleRight, CreditCard, ScrollText, Settings } from 'lucide-react'

const NAV = [
  { label: 'Complejos',     Icon: Building2,  path: '/master/businesses' },
  { label: 'Usuarios',      Icon: Users,       path: '/master/users'     },
  { label: 'Feature flags', Icon: ToggleRight, path: '/master/features'  },
  { label: 'Pagos',         Icon: CreditCard,  path: '/master/payments'  },
  { label: 'Audit logs',    Icon: ScrollText,  path: '/master/logs'      },
  { label: 'Configuración', Icon: Settings,    path: '/master/config'    },
] as const

interface MasterShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function MasterShell({ title, subtitle, children }: MasterShellProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface-sunken)' }}>
      {/* Sidebar */}
      <aside style={{ width: 232, background: 'var(--ink-900)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo + MASTER badge */}
        <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <img src="/logo-wordmark-inverse.svg" height="26" alt="Book & Play" />
          <div style={{
            marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', borderRadius: 'var(--r-full)',
            background: 'rgba(245,158,11,.15)',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.07em', color: '#F59E0B',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
            MASTER
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ label, Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              end
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 'var(--r-md)',
                textDecoration: 'none',
                background: isActive ? 'rgba(12,168,106,.18)' : 'transparent',
                color: isActive ? 'var(--green-300)' : 'rgba(255,255,255,.55)',
                fontSize: 13, fontWeight: isActive ? 700 : 500,
              })}
            >
              <Icon size={16} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer avatar */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#78350F', flexShrink: 0 }}>
            MA
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Matías Admin</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>matias@bookandplay.io</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', padding: '0 24px', flexShrink: 0, gap: 12 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-strong)' }}>{title}</span>
            {subtitle !== undefined && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>{subtitle}</span>
            )}
          </div>
          <span style={{ padding: '4px 10px', borderRadius: 'var(--r-full)', background: 'rgba(245,158,11,.12)', color: '#B45309', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
            Panel MASTER
          </span>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
