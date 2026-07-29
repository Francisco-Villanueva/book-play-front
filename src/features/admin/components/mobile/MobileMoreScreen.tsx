import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CalendarRange, ChevronRight, Clock, CreditCard, LayoutGrid, LogOut, Repeat,
  Settings, User, UserPlus, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar } from '@/shared/components/Avatar'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { BusinessRole } from '@/shared/types/domain'
import { BusinessPickerSheet } from './BusinessPickerSheet'

interface MoreItem {
  key: string
  icon: LucideIcon
  label: string
  path?: string
  minRole?: BusinessRole
}

interface MoreGroup {
  label: string
  items: MoreItem[]
}

const GROUPS: MoreGroup[] = [
  {
    label: 'Gestión',
    items: [
      { key: 'canchas', icon: LayoutGrid, label: 'Canchas', path: '/courts', minRole: 'ADMIN' },
      { key: 'clientes', icon: Users, label: 'Clientes', path: '/clients' },
      { key: 'horarios', icon: Clock, label: 'Horarios y excepciones', path: '/schedule', minRole: 'ADMIN' },
      { key: 'semanal', icon: CalendarRange, label: 'Vista semanal', path: '/schedule' },
    ],
  },
  {
    label: 'Negocio',
    items: [
      { key: 'config', icon: Settings, label: 'Configuración del complejo', path: '/settings', minRole: 'OWNER' },
      { key: 'equipo', icon: UserPlus, label: 'Equipo y usuarios', path: '/settings', minRole: 'ADMIN' },
      { key: 'facturacion', icon: CreditCard, label: 'Plan y facturación', path: '/upgrade', minRole: 'OWNER' },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { key: 'perfil', icon: User, label: 'Mi perfil', path: '/profile' },
      { key: 'cambiar', icon: Repeat, label: 'Cambiar de complejo' },
    ],
  },
]

const RANK: Record<BusinessRole, number> = { STAFF: 0, ADMIN: 1, OWNER: 2 }

export function MobileMoreScreen() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [pickerOpen, setPickerOpen] = useState(false)

  const membership = user?.businesses?.find((b) => b.id === businessId)
  const role = membership?.role
  const base = `/admin/${businessId}`

  const allowed = (item: MoreItem) =>
    !item.minRole || (role != null && RANK[role] >= RANK[item.minRole])

  const go = (item: MoreItem) => {
    if (item.key === 'cambiar') {
      setPickerOpen(true)
      return
    }
    // El perfil es global, no vive bajo el complejo.
    navigate(item.path === '/profile' ? '/profile' : base + item.path)
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 bg-ink-25">
      <div className="flex items-center gap-3 p-3.5 bg-white rounded-lg border border-ink-100 shadow-xs">
        <Avatar name={user?.name ?? 'Usuario'} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[16px] text-ink-900 truncate">{user?.name ?? 'Administrador'}</p>
          <p className="text-[12.5px] text-ink-500 truncate">{membership?.name ?? user?.email}</p>
        </div>
        {role && (
          <span className="flex-none text-[10.5px] font-bold uppercase tracking-wide text-green-700 bg-green-50 px-2 py-1 rounded-full">
            {role}
          </span>
        )}
      </div>

      {GROUPS.map((group) => {
        const items = group.items.filter(allowed)
        if (items.length === 0) return null
        return (
          <section key={group.label} className="mt-[18px]">
            <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400 mx-1 mb-2">
              {group.label}
            </h2>
            <div className="bg-white rounded-lg border border-ink-100 overflow-hidden">
              {items.map((item, i) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => go(item)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3.5 min-h-[52px] bg-transparent cursor-pointer text-left border-none ${
                    i > 0 ? 'border-t border-ink-100' : ''
                  }`}
                >
                  <item.icon size={20} className="text-ink-500 flex-none" aria-hidden />
                  <span className="flex-1 font-semibold text-body-sm text-ink-700">{item.label}</span>
                  <ChevronRight size={18} className="text-ink-400 flex-none" aria-hidden />
                </button>
              ))}
            </div>
          </section>
        )
      })}

      <button
        type="button"
        onClick={() => {
          logout()
          navigate('/login')
        }}
        className="w-full flex items-center justify-center gap-2 mt-5 p-3.5 min-h-[52px] rounded-lg border border-ink-100 bg-white text-red-600 font-body font-bold text-body-sm cursor-pointer"
      >
        <LogOut size={18} aria-hidden />
        Cerrar sesión
      </button>

      {pickerOpen && <BusinessPickerSheet onClose={() => setPickerOpen(false)} />}
    </div>
  )
}
