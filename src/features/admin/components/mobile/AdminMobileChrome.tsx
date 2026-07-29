import { type ReactNode, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, ChevronDown, LayoutGrid, Menu, Plus, Search, Ticket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/features/auth/store/authStore'
import { SubscriptionBanner } from '@/shared/components/SubscriptionBanner'
import { useSubscriptionAccess } from '@/features/billing/hooks/useBilling'
import { BusinessPickerSheet } from './BusinessPickerSheet'

type TabKey = 'agenda' | 'reservas' | 'mas'

const TABS: { key: TabKey; icon: LucideIcon; label: string; path: string }[] = [
  { key: 'agenda', icon: CalendarDays, label: 'Agenda', path: '/agenda' },
  { key: 'reservas', icon: Ticket, label: 'Reservas', path: '/bookings' },
  { key: 'mas', icon: Menu, label: 'Más', path: '/mas' },
]

function activeTab(pathname: string, base: string): TabKey {
  const section = pathname.slice(base.length)
  if (section.startsWith('/mas')) return 'mas'
  if (section.startsWith('/bookings')) return 'reservas'
  return 'agenda'
}

interface AdminMobileChromeProps {
  children: ReactNode
}

export function AdminMobileChrome({ children }: AdminMobileChromeProps) {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const base = `/admin/${businessId}`
  const tab = activeTab(pathname, base)
  const membership = user?.businesses?.find((b) => b.id === businessId)

  const { data: access } = useSubscriptionAccess(businessId)
  const readOnly = access?.accessLevel === 'READ_ONLY'
  const isOwner = membership?.role === 'OWNER'

  return (
    <div className="fixed inset-0 flex flex-col bg-ink-25">
      <header
        className="flex-none flex items-center justify-between h-14 pl-4 pr-2 bg-white border-b border-ink-100"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-label="Cambiar de complejo"
          data-testid="mobile-business-picker"
          className="flex items-center gap-1.5 min-h-[44px] border-none bg-transparent cursor-pointer pr-2"
        >
          <span className="w-7 h-7 flex-none rounded-sm bg-green-500 flex items-center justify-center">
            <LayoutGrid size={16} className="text-white" aria-hidden />
          </span>
          <span className="font-display font-bold text-[17px] text-ink-900 tracking-tight truncate max-w-[170px]">
            {membership?.name ?? 'Complejo'}
          </span>
          <ChevronDown size={17} className="text-ink-400 flex-none" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => navigate(`${base}/bookings`)}
          aria-label="Buscar reservas"
          className="w-11 h-11 flex-none rounded-full border-none bg-transparent cursor-pointer flex items-center justify-center text-ink-700"
        >
          <Search size={21} aria-hidden />
        </button>
      </header>

      {!bannerDismissed && (
        <SubscriptionBanner
          daysLeft={access?.daysUntilExpiry ?? null}
          readOnly={!!readOnly}
          canPay={!!isOwner}
          onUpgrade={() => navigate(`${base}/upgrade`)}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>

      {!readOnly && tab !== 'mas' && (
        <button
          type="button"
          onClick={() => navigate(`${base}/agenda?nueva=1`)}
          aria-label="Nueva reserva"
          data-testid="mobile-fab-new-booking"
          className="fixed right-4 w-14 h-14 rounded-full bg-green-500 text-white border-none cursor-pointer shadow-brand flex items-center justify-center z-[50] active:scale-95 transition-transform"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 92px)' }}
        >
          <Plus size={26} strokeWidth={2.4} aria-hidden />
        </button>
      )}

      <nav
        className="flex-none flex h-[64px] bg-white border-t border-ink-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Secciones del panel"
      >
        {TABS.map(({ key, icon: Icon, label, path }) => {
          const on = tab === key
          return (
            <button
              key={key}
              type="button"
              aria-current={on ? 'page' : undefined}
              onClick={() => navigate(base + path)}
              data-testid={`mobile-tab-${key}`}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 border-none bg-transparent cursor-pointer',
                on ? 'text-green-600' : 'text-ink-400',
              )}
            >
              <Icon size={23} strokeWidth={on ? 2.4 : 2} aria-hidden />
              <span className={cn('text-[11px] font-body', on ? 'font-bold' : 'font-semibold')}>{label}</span>
            </button>
          )
        })}
      </nav>

      {pickerOpen && <BusinessPickerSheet onClose={() => setPickerOpen(false)} />}
    </div>
  )
}
