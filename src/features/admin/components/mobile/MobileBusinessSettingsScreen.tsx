import { useNavigate, useParams } from 'react-router-dom'
import { CalendarOff, ChevronRight, Clock } from 'lucide-react'
import { BusinessGeneralForm } from '@/features/businesses/components/BusinessGeneralForm'
import { useBusiness } from '@/features/businesses/hooks/useBusinesses'
import { MobileSubScreen } from './MobileSubScreen'

export function MobileBusinessSettingsScreen() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const { data: business } = useBusiness(businessId)

  return (
    <MobileSubScreen title="Configuración del complejo" subtitle={business?.name}>
      <BusinessGeneralForm businessId={businessId ?? ''} />

      {/* En escritorio horarios y excepciones son pestañas de esta pantalla; en
          mobile viven aparte, así que se enlazan para no dejarlas huérfanas. */}
      <div className="mt-6 bg-white rounded-lg border border-ink-100 overflow-hidden">
        <button
          type="button"
          onClick={() => navigate(`/admin/${businessId}/horarios`)}
          className="w-full flex items-center gap-3.5 px-3.5 py-3.5 min-h-[52px] bg-transparent border-none cursor-pointer text-left"
        >
          <Clock size={20} className="text-ink-500 flex-none" aria-hidden />
          <span className="flex-1 font-semibold text-body-sm text-ink-700">Horarios de atención</span>
          <ChevronRight size={18} className="text-ink-400 flex-none" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => navigate(`/admin/${businessId}/horarios`)}
          className="w-full flex items-center gap-3.5 px-3.5 py-3.5 min-h-[52px] bg-transparent border-none border-t border-ink-100 cursor-pointer text-left"
        >
          <CalendarOff size={20} className="text-ink-500 flex-none" aria-hidden />
          <span className="flex-1 font-semibold text-body-sm text-ink-700">Excepciones y feriados</span>
          <ChevronRight size={18} className="text-ink-400 flex-none" aria-hidden />
        </button>
      </div>
    </MobileSubScreen>
  )
}
