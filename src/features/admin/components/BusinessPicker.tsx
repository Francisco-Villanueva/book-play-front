import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Avatar } from '@/shared/components/Avatar'
import { cn } from '@/shared/utils/cn'
import type { UserBusinessMembership } from '@/shared/types/domain'

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Complejo deportivo',
  ADMIN: 'Administración',
  STAFF: 'Personal',
}

interface BusinessPickerProps {
  businessId: string
  businesses: UserBusinessMembership[]
}

export function BusinessPicker({ businessId, businesses }: BusinessPickerProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const active = businesses.find((b) => b.id === businessId)
  const label = active ? (ROLE_LABELS[active.role] ?? 'Complejo deportivo') : 'Complejo deportivo'

  const switchTo = (id: string) => {
    setOpen(false)
    if (id === businessId) return
    // Mantiene la sección actual (agenda, canchas…) al cambiar de complejo.
    const section = pathname.slice(`/admin/${businessId}`.length)
    navigate(`/admin/${id}${section}`)
  }

  const trigger = (
    <>
      <Avatar name={active?.name ?? 'Complejo'} size="sm" />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-caption font-bold text-ink-900 font-body truncate">{active?.name ?? 'Complejo'}</p>
        <p className="text-[11px] text-ink-500">{label}</p>
      </div>
    </>
  )

  const boxClasses = 'flex items-center gap-2.5 px-3 py-2.5 bg-ink-50 border border-ink-100 rounded-md text-left'

  if (businesses.length <= 1) {
    return <div className={cn(boxClasses, 'mx-3.5 mb-3.5')}>{trigger}</div>
  }

  return (
    <div ref={containerRef} className="relative mx-3.5 mb-3.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Cambiar de complejo"
        data-testid="business-picker"
        className={cn(boxClasses, 'w-full cursor-pointer')}
      >
        {trigger}
        <ChevronsUpDown size={15} className="text-ink-400 flex-none" aria-hidden />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-ink-100 rounded-md shadow-lg py-1 max-h-[280px] overflow-y-auto"
        >
          {businesses.map((b) => {
            const selected = b.id === businessId
            return (
              <button
                key={b.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => switchTo(b.id)}
                data-testid={`business-picker-option-${b.id}`}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2 border-none cursor-pointer text-left',
                  selected ? 'bg-green-50' : 'bg-transparent hover:bg-ink-50',
                )}
              >
                <Avatar name={b.name} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-semibold text-ink-900 truncate">{b.name}</p>
                  <p className="text-[11px] text-ink-500">{ROLE_LABELS[b.role] ?? b.role}</p>
                </div>
                {selected && <Check size={14} className="text-green-600 flex-none" aria-hidden />}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate('/onboarding')
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 border-t border-ink-100 bg-transparent hover:bg-ink-50 cursor-pointer text-left"
          >
            <span className="w-6 h-6 rounded-sm bg-ink-50 flex items-center justify-center text-ink-500 flex-none">
              <Plus size={13} aria-hidden />
            </span>
            <span className="text-caption font-semibold text-ink-700">Registrar otro complejo</span>
          </button>
        </div>
      )}
    </div>
  )
}
