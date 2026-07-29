import { type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CalendarDays, Ticket, User, LogOut, Building2 } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Avatar } from '@/shared/components/Avatar'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useCurrentBusiness } from '@/features/auth/hooks/useAppContext'

const NAV = [
  { key: '/dashboard', icon: CalendarDays, label: 'Reservar' },
  { key: '/my-bookings', icon: Ticket, label: 'Mis turnos' },
  { key: '/profile', icon: User, label: 'Perfil' },
]

interface PlayerAppShellProps {
  children: ReactNode
}

export function PlayerAppShell({ children }: PlayerAppShellProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const business = useCurrentBusiness()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-full bg-ink-25">
      {/* Desktop sidebar nav — hidden below md, mobile uses the bottom tab bar instead */}
      <aside className="hidden md:flex md:flex-none md:w-60 md:flex-col bg-white border-r border-ink-100">
        <div className="px-5 pt-5 pb-4">
          <img src="/logo-wordmark.svg" height="30" alt="Book & Play" />
        </div>

        <nav className="flex-1 px-3.5 flex flex-col gap-0.5">
          {NAV.map(({ key, icon: Icon, label }) => {
            const active = pathname.startsWith(key)
            return (
              <button
                key={key}
                type="button"
                onClick={() => navigate(key)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-md border-none cursor-pointer w-full text-left',
                  'font-body text-body-sm transition-colors duration-[120ms]',
                  active
                    ? 'bg-green-50 text-green-700 font-bold'
                    : 'bg-transparent text-ink-700 font-medium hover:bg-ink-50',
                )}
              >
                <Icon size={19} strokeWidth={active ? 2.3 : 2} className="flex-none" aria-hidden />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Sin esto, quien administra un complejo queda encerrado en la app de
            jugador: las rutas del panel no se alcanzan desde ninguna pantalla. */}
        {business && (
          <div className="px-3.5 pb-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/${business.id}`)}
              data-testid="player-shell-back-to-business"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-ink-100 bg-ink-50 hover:bg-ink-100 cursor-pointer text-left transition-colors duration-[120ms]"
            >
              <span className="w-7 h-7 rounded-sm bg-white flex items-center justify-center text-green-600 flex-none">
                <Building2 size={16} aria-hidden />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[11px] text-ink-500">Volver a</span>
                <span className="block text-caption font-bold text-ink-900 truncate">{business.name}</span>
              </span>
            </button>
          </div>
        )}

        <div className="p-3.5 border-t border-ink-100 flex items-center gap-2.5">
          <Avatar name={user?.name ?? 'Jugador'} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-caption font-semibold text-ink-900 truncate">{user?.name ?? 'Jugador'}</p>
            <p className="text-[11px] text-ink-500 truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="border-none bg-transparent cursor-pointer text-ink-400 hover:text-ink-600"
          >
            <LogOut size={17} aria-hidden />
          </button>
        </div>
      </aside>

      {/* Content column — phone-width on mobile, wider centered column on desktop */}
      <div className="flex-1 flex justify-center min-w-0 h-full overflow-hidden">
        <div className="flex flex-col h-full w-full max-w-[420px] md:max-w-2xl bg-ink-25 relative">
          <main className="flex-1 overflow-hidden flex flex-col min-h-0">
            {children}
          </main>
          <nav
            className="md:hidden flex-none flex bg-white border-t border-ink-100"
            style={{ height: 'var(--tabbar-h)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="Secciones"
          >
            {NAV.map(({ key, icon: Icon, label }) => {
              const active = pathname.startsWith(key)
              return (
                <button
                  key={key}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => navigate(key)}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-1 border-none bg-transparent cursor-pointer',
                    active ? 'text-green-600' : 'text-ink-400',
                  )}
                >
                  <Icon size={23} strokeWidth={active ? 2.4 : 2} aria-hidden />
                  <span className={cn('text-[11px] font-body', active ? 'font-bold' : 'font-semibold')}>
                    {label}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
