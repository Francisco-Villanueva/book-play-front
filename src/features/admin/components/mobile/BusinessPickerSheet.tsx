import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Avatar } from '@/shared/components/Avatar'
import { useAuthStore } from '@/features/auth/store/authStore'
import { Sheet } from './Sheet'

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Complejo deportivo',
  ADMIN: 'Administración',
  STAFF: 'Personal',
}

interface BusinessPickerSheetProps {
  onClose: () => void
}

export function BusinessPickerSheet({ onClose }: BusinessPickerSheetProps) {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const businesses = useAuthStore((s) => s.user?.businesses) ?? []

  const switchTo = (id: string) => {
    onClose()
    if (id === businessId) return
    // Mantiene la sección actual (agenda, reservas…) al cambiar de complejo.
    const section = pathname.slice(`/admin/${businessId}`.length)
    navigate(`/admin/${id}${section}`)
  }

  return (
    <Sheet onClose={onClose} title="Cambiar de complejo">
      <div className="flex flex-col gap-2">
        {businesses.map((b) => {
          const selected = b.id === businessId
          return (
            <button
              key={b.id}
              type="button"
              aria-current={selected}
              onClick={() => switchTo(b.id)}
              data-testid={`mobile-business-option-${b.id}`}
              className={cn(
                'w-full flex items-center gap-3 px-3.5 py-3 rounded-md border-[1.5px] cursor-pointer text-left min-h-[60px]',
                selected ? 'border-green-500 bg-green-50' : 'border-ink-100 bg-white',
              )}
            >
              <Avatar name={b.name} size="sm" />
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-body-sm text-ink-900 truncate">{b.name}</span>
                <span className="block text-[12px] text-ink-500">{ROLE_LABELS[b.role] ?? b.role}</span>
              </span>
              {selected && <Check size={20} className="text-green-600 flex-none" aria-hidden />}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => {
            onClose()
            navigate('/onboarding')
          }}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-md border border-dashed border-ink-200 bg-white cursor-pointer text-left min-h-[52px]"
        >
          <span className="w-8 h-8 rounded-sm bg-ink-50 flex items-center justify-center text-ink-500 flex-none">
            <Plus size={16} aria-hidden />
          </span>
          <span className="font-semibold text-body-sm text-ink-700">Registrar otro complejo</span>
        </button>
      </div>
    </Sheet>
  )
}
