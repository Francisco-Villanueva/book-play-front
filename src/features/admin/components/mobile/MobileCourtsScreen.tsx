import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Home, Pencil, Plus, Wind, Zap } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { formatMoneyARS } from '@/shared/utils/date'
import { useBusiness } from '@/features/businesses/hooks/useBusinesses'
import { useCourts, useCreateCourt, useUpdateCourt } from '@/features/courts/hooks/useCourts'
import { CourtFormPanel, type CourtFormValues } from '../CourtFormPanel'
import { courtColor, type Court } from '../courtTypes'
import { MobileSubScreen } from './MobileSubScreen'

export function MobileCourtsScreen() {
  const { businessId } = useParams<{ businessId: string }>()
  const { data: courts, isLoading, isError } = useCourts(businessId)
  const { data: business } = useBusiness(businessId)
  const createCourt = useCreateCourt(businessId ?? '')
  const updateCourt = useUpdateCourt(businessId ?? '')
  const [panel, setPanel] = useState<'new' | Court | null>(null)

  const list = courts ?? []
  const activeCount = list.filter((c) => c.isActive).length

  const handleSave = (values: CourtFormValues, id?: string) => {
    const mutation = id
      ? updateCourt.mutateAsync({ courtId: id, data: values })
      : createCourt.mutateAsync(values)
    mutation.then(() => setPanel(null))
  }

  return (
    <>
      <MobileSubScreen
        title="Canchas"
        subtitle={`${activeCount} activas · ${list.length} total`}
        action={
          <button
            type="button"
            onClick={() => setPanel('new')}
            aria-label="Nueva cancha"
            data-testid="mobile-court-new"
            className="w-11 h-11 rounded-full bg-green-500 text-white border-none cursor-pointer flex items-center justify-center"
          >
            <Plus size={20} aria-hidden />
          </button>
        }
      >
        {isLoading ? (
          <p className="py-12 text-center text-body-sm text-ink-400">Cargando canchas…</p>
        ) : isError ? (
          <p className="py-12 text-center text-body-sm text-red-600">No pudimos cargar las canchas.</p>
        ) : list.length === 0 ? (
          <p className="py-12 text-center text-body-sm text-ink-500">Todavía no cargaste ninguna cancha.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {list.map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                onEdit={() => setPanel(court)}
                onToggle={() =>
                  updateCourt.mutate({ courtId: court.id, data: { isActive: !court.isActive } })
                }
              />
            ))}
          </div>
        )}
      </MobileSubScreen>

      {panel && business && (
        <div className="fixed inset-0 z-[100] flex bg-white">
          <CourtFormPanel
            court={panel === 'new' ? null : panel}
            defaultSlotDuration={business.defaultSlotDuration}
            defaultPricePerSlot={business.defaultPricePerSlot ?? null}
            onClose={() => setPanel(null)}
            onSave={handleSave}
            saving={createCourt.isPending || updateCourt.isPending}
          />
        </div>
      )}
    </>
  )
}

interface CourtCardProps {
  court: Court
  onEdit: () => void
  onToggle: () => void
}

function CourtCard({ court, onEdit, onToggle }: CourtCardProps) {
  const color = courtColor(court.sportType)

  return (
    <div
      className="bg-white rounded-lg border border-ink-100 shadow-xs p-3.5"
      data-testid={`mobile-court-${court.id}`}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-11 h-11 flex-none rounded-md flex items-center justify-center"
          style={{ background: court.isActive ? color : 'var(--ink-300)' }}
        >
          {court.isIndoor ? (
            <Home size={18} className="text-white" aria-hidden />
          ) : (
            <Wind size={18} className="text-white" aria-hidden />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-body-sm text-ink-900 truncate">{court.name}</p>
          <p className="text-[12.5px] text-ink-500 truncate">
            {court.sportType ?? '—'}
            {court.surface ? ` · ${court.surface}` : ''}
            {court.capacity ? ` · ${court.capacity} jug.` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${court.name}`}
          data-testid={`mobile-court-edit-${court.id}`}
          className="w-11 h-11 flex-none rounded-md border-[1.5px] border-ink-200 bg-white cursor-pointer flex items-center justify-center text-ink-700"
        >
          <Pencil size={16} aria-hidden />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100">
        <span className="tnum font-mono text-[13px] font-bold text-ink-900">
          {court.pricePerSlot != null ? formatMoneyARS(court.pricePerSlot) : '—'}
        </span>
        <span className="text-ink-300">·</span>
        <span className="tnum font-mono text-[13px] text-ink-500">{court.slotDuration} min</span>

        <div className="flex-1 flex justify-end gap-1.5 flex-wrap">
          {court.hasLighting && <Tag icon={<Zap size={10} aria-hidden />} label="Ilum." tone="amber" />}
          {court.isIndoor && <Tag icon={<Home size={10} aria-hidden />} label="Indoor" tone="blue" />}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={court.isActive}
        className="w-full flex items-center gap-2.5 mt-3 pt-3 border-t border-ink-100 bg-transparent border-x-0 border-b-0 cursor-pointer min-h-[44px]"
      >
        <span
          className={cn(
            'relative w-9 h-5 rounded-full flex-none transition-colors',
            court.isActive ? 'bg-green-500' : 'bg-ink-300',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
              court.isActive ? 'left-[18px]' : 'left-0.5',
            )}
          />
        </span>
        <span
          className={cn(
            'text-[13px] font-semibold',
            court.isActive ? 'text-green-700' : 'text-ink-400',
          )}
        >
          {court.isActive ? 'Activa — se puede reservar' : 'Inactiva — no se muestra'}
        </span>
      </button>
    </div>
  )
}

interface TagProps {
  icon: React.ReactNode
  label: string
  tone: 'amber' | 'blue'
}

function Tag({ icon, label, tone }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full border',
        tone === 'amber'
          ? 'text-amber-700 bg-amber-50 border-amber-200'
          : 'text-blue-600 bg-blue-50 border-blue-100',
      )}
    >
      {icon}
      {label}
    </span>
  )
}
