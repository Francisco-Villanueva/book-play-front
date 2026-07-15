import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Pencil, Home, Wind, Zap } from 'lucide-react'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { CourtFormPanel, type CourtFormValues } from '@/features/admin/components/CourtFormPanel'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'
import { useCourts, useCreateCourt, useUpdateCourt } from '@/features/courts/hooks/useCourts'
import { courtColor, type Court } from '@/features/admin/components/courtTypes'

function Tag({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: 'amber' | 'blue' }) {
  const toneStyles = tone === 'amber' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-blue-600 bg-blue-50 border-blue-100'
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full border', toneStyles)}>
      {icon}{label}
    </span>
  )
}

const COLS = '42px 1fr 100px 1fr 90px 100px 110px'

function CourtRow({ court, onEdit, onToggle }: { court: Court; onEdit: (c: Court) => void; onToggle: (c: Court) => void }) {
  const color = courtColor(court.sportType)
  return (
    <div
      className="grid items-center gap-3 px-5 py-3.5 border-b border-ink-100 bg-white"
      style={{ gridTemplateColumns: COLS }}
      data-testid={`court-row-${court.id}`}
    >
      <div
        className="w-9 h-9 rounded-md flex-none flex items-center justify-center"
        style={{ background: court.isActive ? color : 'var(--ink-300)' }}
      >
        {court.isIndoor ? <Home size={16} className="text-white" /> : <Wind size={16} className="text-white" />}
      </div>
      <div>
        <p className="font-bold text-[14px] text-ink-900">{court.name}</p>
        <p className="text-[12px] text-ink-500 mt-0.5">{court.surface ?? '—'}{court.capacity ? ` · ${court.capacity} jug.` : ''}</p>
      </div>
      <span className="text-[13px] text-ink-700">{court.sportType ?? '—'}</span>
      <div className="flex gap-1.5 flex-wrap">
        {court.hasLighting && <Tag icon={<Zap size={10} />} label="Ilum." tone="amber" />}
        {court.isIndoor && <Tag icon={<Home size={10} />} label="Indoor" tone="blue" />}
      </div>
      <span className="font-mono font-bold text-[13px] text-ink-900">
        {court.pricePerHour != null ? `$${court.pricePerHour.toLocaleString('es-AR')}/h` : '—'}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onToggle(court)}
          aria-pressed={court.isActive}
          aria-label={`${court.isActive ? 'Desactivar' : 'Activar'} ${court.name}`}
          className={cn('relative w-9 h-5 rounded-full flex-none border-none cursor-pointer transition-colors', court.isActive ? 'bg-green-500' : 'bg-ink-300')}
        >
          <span
            className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all', court.isActive ? 'left-[18px]' : 'left-0.5')}
          />
        </button>
        <span className={cn('text-[12px] font-semibold', court.isActive ? 'text-green-700' : 'text-ink-400')}>
          {court.isActive ? 'Activa' : 'Inactiva'}
        </span>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onEdit(court)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border-[1.5px] border-ink-200 bg-transparent cursor-pointer text-[12px] font-semibold text-ink-700"
          data-testid={`court-edit-${court.id}`}
        >
          <Pencil size={12} /> Editar
        </button>
      </div>
    </div>
  )
}

export default function AdminCourtsPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { data: courts, isLoading, isError } = useCourts(businessId)
  const createCourt = useCreateCourt(businessId ?? '')
  const updateCourt = useUpdateCourt(businessId ?? '')
  const [panel, setPanel] = useState<'new' | Court | null>(null)

  const handleSave = (values: CourtFormValues, id?: string) => {
    const mutation = id ? updateCourt.mutateAsync({ courtId: id, data: values }) : createCourt.mutateAsync(values)
    mutation.then(() => setPanel(null))
  }

  const list = courts ?? []
  const activeCount = list.filter((c) => c.isActive).length

  return (
    <AdminShell title="Canchas" subtitle={`${activeCount} activas · ${list.length} total`}>
      <div className="h-full flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-none px-5 py-3 bg-white border-b border-ink-100 flex items-center justify-between">
            <p className="text-[14px] text-ink-500">
              <strong className="text-ink-900">{list.length}</strong> canchas ·{' '}
              <strong className="text-green-700">{activeCount}</strong> activas ·{' '}
              <strong className="text-ink-400">{list.length - activeCount}</strong> inactivas
            </p>
            <Button leftIcon={<Plus size={15} aria-hidden />} onClick={() => setPanel('new')} data-testid="court-new-button">
              Nueva cancha
            </Button>
          </div>

          <div
            className="flex-none grid gap-3 px-5 py-2.5 bg-ink-50 border-b-2 border-ink-200"
            style={{ gridTemplateColumns: COLS }}
          >
            {['', 'Cancha', 'Deporte', 'Amenidades', 'Precio', 'Estado', ''].map((c, i) => (
              <span key={i} className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{c}</span>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-body-sm text-ink-400 py-12">Cargando canchas…</p>
            ) : isError ? (
              <p className="text-center text-body-sm text-red-600 py-12">No pudimos cargar las canchas.</p>
            ) : list.length === 0 ? (
              <p className="text-center text-body-sm text-ink-400 py-12">Todavía no cargaste ninguna cancha.</p>
            ) : (
              list.map((c) => (
                <CourtRow
                  key={c.id}
                  court={c}
                  onEdit={setPanel}
                  onToggle={(court) => updateCourt.mutate({ courtId: court.id, data: { isActive: !court.isActive } })}
                />
              ))
            )}
          </div>
        </div>

        {panel && (
          <CourtFormPanel
            court={panel === 'new' ? null : panel}
            onClose={() => setPanel(null)}
            onSave={handleSave}
            saving={createCourt.isPending || updateCourt.isPending}
          />
        )}
      </div>
    </AdminShell>
  )
}
