import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, HelpCircle, LogOut, Repeat, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Avatar } from '@/shared/components/Avatar'
import { useAuthStore } from '@/features/auth/store/authStore'
import { ProfileIdentityCard } from '@/features/users/components/ProfileIdentityCard'

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Dueño del complejo',
  ADMIN: 'Administración',
  STAFF: 'Personal',
}

const MENU: { icon: LucideIcon; label: string }[] = [
  { icon: Shield, label: 'Privacidad' },
  { icon: HelpCircle, label: 'Ayuda y soporte' },
]

export function MobileProfileScreen() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const base = `/admin/${businessId}`
  const membership = user?.businesses?.find((b) => b.id === businessId)
  const others = (user?.businesses ?? []).filter((b) => b.id !== businessId)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-ink-25">
      <div className="flex-none flex items-center gap-1.5 h-14 px-2 bg-white border-b border-ink-100">
        <button
          type="button"
          onClick={() => navigate(`${base}/mas`)}
          aria-label="Volver a Más"
          className="w-11 h-11 flex-none rounded-full border-none bg-transparent cursor-pointer flex items-center justify-center"
        >
          <ChevronLeft size={24} className="text-ink-700" aria-hidden />
        </button>
        <p className="flex-1 font-display font-bold text-[18px] text-ink-900 truncate">Mi perfil</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 pb-32">
        <ProfileIdentityCard />

        {membership && (
          <section className="mb-4">
            <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400 mx-1 mb-2">
              Complejo actual
            </h2>
            <div className="flex items-center gap-3 p-3.5 bg-white rounded-lg border border-ink-100 shadow-xs">
              <Avatar name={membership.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-body-sm text-ink-900 truncate">{membership.name}</p>
                <p className="text-[12.5px] text-ink-500">
                  {ROLE_LABELS[membership.role] ?? membership.role}
                </p>
              </div>
              <span className="flex-none text-[10.5px] font-bold uppercase tracking-wide text-green-700 bg-green-50 px-2 py-1 rounded-full">
                {membership.role}
              </span>
            </div>

            {others.length > 0 && (
              <button
                type="button"
                onClick={() => navigate(`${base}/mas`)}
                className="w-full flex items-center gap-3 mt-2 px-3.5 py-3 min-h-[52px] bg-white rounded-lg border border-ink-100 cursor-pointer text-left"
              >
                <Repeat size={18} className="text-ink-500 flex-none" aria-hidden />
                <span className="flex-1 font-semibold text-body-sm text-ink-700">
                  Cambiar de complejo
                  <span className="block text-[12px] font-normal text-ink-400">
                    {others.length === 1 ? '1 complejo más' : `${others.length} complejos más`}
                  </span>
                </span>
                <ChevronRight size={18} className="text-ink-400 flex-none" aria-hidden />
              </button>
            )}
          </section>
        )}

        <div className="bg-white border border-ink-100 rounded-lg overflow-hidden">
          {MENU.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              type="button"
              className={cn(
                'w-full flex items-center gap-3.5 px-3.5 py-3.5 min-h-[52px] text-left cursor-pointer bg-transparent border-none',
                i > 0 && 'border-t border-ink-100',
              )}
            >
              <Icon size={20} className="text-ink-500 flex-none" aria-hidden />
              <span className="flex-1 font-semibold text-body-sm text-ink-700">{label}</span>
              <ChevronRight size={18} className="text-ink-400 flex-none" aria-hidden />
            </button>
          ))}
        </div>

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
      </div>
    </div>
  )
}
