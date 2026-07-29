import { useMemo, useState } from 'react'
import { Repeat } from 'lucide-react'
import { SegmentedControl } from '@/shared/components/SegmentedControl'
import { ConfirmDialog, type ConfirmRequest } from '@/features/admin/components/mobile/ConfirmDialog'
import { flashToast } from '@/shared/store/toastStore'
import { weekdayNameEs } from '@/shared/utils/date'
import {
  useEndRecurring,
  useRecurringBookings,
} from '../hooks/useRecurringBookings'
import { RecurringSeriesCard } from './RecurringSeriesCard'
import type { RecurringBooking } from '@/shared/types/domain'

const FILTERS = ['Activos', 'Terminados'] as const

interface RecurringSeriesScreenProps {
  businessId: string
}

export function RecurringSeriesScreen({ businessId }: RecurringSeriesScreenProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Activos')
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null)

  const { data, isLoading, isError } = useRecurringBookings(businessId)
  const endSeries = useEndRecurring(businessId)

  const rows = useMemo(
    () =>
      (data ?? []).filter((s) =>
        filter === 'Activos' ? s.status === 'ACTIVE' : s.status === 'ENDED',
      ),
    [data, filter],
  )

  const askEnd = (series: RecurringBooking) => {
    setConfirm({
      title: 'Terminar el turno fijo',
      body:
        `Se cancelan todas las fechas futuras de ${series.guestName ?? 'este cliente'} ` +
        `(${weekdayNameEs(series.dayOfWeek)} a las ${series.startTime.slice(0, 5)}). ` +
        'Los turnos ya jugados no se tocan. Si dejó un correo, le avisamos.',
      confirmLabel: 'Terminar turno fijo',
      onConfirm: () =>
        endSeries.mutate(
          { seriesId: series.id },
          {
            onSuccess: (res) => {
              setConfirm(null)
              flashToast(
                res.cancelled === 0
                  ? 'Turno fijo terminado'
                  : `Turno fijo terminado · ${res.cancelled} ${res.cancelled === 1 ? 'fecha cancelada' : 'fechas canceladas'}`,
              )
            },
          },
        ),
    })
  }

  if (isLoading) return <p className="text-body-sm text-ink-500">Cargando turnos fijos…</p>
  if (isError) return <p className="text-body-sm text-red-600">No pudimos cargar los turnos fijos.</p>

  return (
    <div>
      <div className="mb-4 max-w-[280px]">
        <SegmentedControl
          full
          options={[...FILTERS]}
          value={filter}
          onChange={(v) => setFilter(v as (typeof FILTERS)[number])}
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-200 bg-ink-25 px-6 py-10 text-center">
          <Repeat size={22} className="text-ink-300 mx-auto mb-2" aria-hidden />
          <p className="font-display font-bold text-[15px] text-ink-900">
            {filter === 'Activos' ? 'Todavía no hay turnos fijos' : 'No hay turnos fijos terminados'}
          </p>
          {filter === 'Activos' && (
            <p className="text-[13px] text-ink-500 mt-1">
              Se crean desde la agenda: elegí el horario y en el paso 2 marcá «Turno fijo».
            </p>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((s) => (
            <RecurringSeriesCard key={s.id} series={s} onEnd={askEnd} />
          ))}
        </ul>
      )}

      <ConfirmDialog
        request={confirm}
        onClose={() => setConfirm(null)}
        pending={endSeries.isPending}
      />
    </div>
  )
}
