import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface MobileSubScreenProps {
  title: string
  subtitle?: string | undefined
  action?: ReactNode | undefined
  toolbar?: ReactNode | undefined
  children: ReactNode
}

// Las secciones de "Gestión" son subpantallas de la pestaña Más: header propio
// con vuelta, y la barra de pestañas del shell sigue abajo.
export function MobileSubScreen({ title, subtitle, action, toolbar, children }: MobileSubScreenProps) {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-ink-25">
      <div className="flex-none flex items-center gap-1.5 h-14 px-2 bg-white border-b border-ink-100">
        <button
          type="button"
          onClick={() => navigate(`/admin/${businessId}/mas`)}
          aria-label="Volver a Más"
          className="w-11 h-11 flex-none rounded-full border-none bg-transparent cursor-pointer flex items-center justify-center"
        >
          <ChevronLeft size={24} className="text-ink-700" aria-hidden />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[18px] text-ink-900 leading-tight truncate">{title}</p>
          {subtitle && <p className="text-[12px] text-ink-500 truncate">{subtitle}</p>}
        </div>
        {action && <div className="flex-none pr-1">{action}</div>}
      </div>

      {toolbar && <div className="flex-none bg-white border-b border-ink-100">{toolbar}</div>}

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">{children}</div>
    </div>
  )
}
