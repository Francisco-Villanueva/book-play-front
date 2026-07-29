import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CalendarOff, Clock, Info, Trash2 } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { formatLongDateEs, todayISO } from '@/shared/utils/date'
import { useAvailabilityRules } from '@/features/availability-rules/hooks/useAvailabilityRules'
import { formatDays, groupRules } from '@/features/availability-rules/utils/groupRules'
import { useDeleteExceptionRule, useExceptionRules } from '@/features/exception-rules/hooks/useExceptionRules'
import { MobileSubScreen } from './MobileSubScreen'
import { ConfirmDialog, type ConfirmRequest } from './ConfirmDialog'
import { flashToast } from '@/shared/store/toastStore'

type Tab = 'horarios' | 'excepciones'

export function MobileScheduleRulesScreen() {
  const { businessId } = useParams<{ businessId: string }>()
  const [tab, setTab] = useState<Tab>('horarios')
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null)

  const { data: rules, isLoading: rulesLoading, isError: rulesError } = useAvailabilityRules(businessId)
  const { data: exceptions, isLoading: exLoading } = useExceptionRules(businessId)
  const deleteException = useDeleteExceptionRule(businessId ?? '')

  const groups = useMemo(() => groupRules(rules ?? []), [rules])

  const today = todayISO()
  const upcoming = useMemo(
    () => (exceptions ?? []).filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [exceptions, today],
  )

  const askDelete = (id: string, label: string) =>
    setConfirm({
      title: 'Quitar excepción',
      body: `${label} vuelve a funcionar con el horario habitual.`,
      confirmLabel: 'Quitar',
      onConfirm: () =>
        deleteException.mutate(id, {
          onSuccess: () => {
            setConfirm(null)
            flashToast('Excepción eliminada')
          },
          onError: () => {
            setConfirm(null)
            flashToast('No pudimos eliminar la excepción', { kind: 'error' })
          },
        }),
    })

  return (
    <>
      <MobileSubScreen
        title="Horarios y excepciones"
        subtitle="Configuración vigente"
        toolbar={
          <div className="flex px-4 pt-2">
            {(
              [
                { key: 'horarios', label: 'Horarios', icon: Clock },
                { key: 'excepciones', label: 'Excepciones', icon: CalendarOff },
              ] as const
            ).map(({ key, label, icon: Icon }) => {
              const on = tab === key
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTab(key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 pb-2.5 pt-1 border-x-0 border-t-0 bg-transparent cursor-pointer min-h-[44px]',
                    on
                      ? 'border-b-2 border-green-500 text-green-700 font-bold'
                      : 'border-b-2 border-transparent text-ink-500 font-semibold',
                  )}
                >
                  <Icon size={16} aria-hidden />
                  <span className="text-caption">{label}</span>
                </button>
              )
            })}
          </div>
        }
      >
        <div className="flex items-start gap-2.5 px-3.5 py-3 bg-blue-50 rounded-md mb-4">
          <Info size={18} className="text-blue-600 flex-none mt-px" aria-hidden />
          <p className="text-caption text-blue-700 leading-relaxed">
            Acá podés revisar la configuración y quitar excepciones. Para cargar horarios nuevos
            conviene usar una computadora: el asistente es largo para una pantalla chica.
          </p>
        </div>

        {tab === 'horarios' ? (
          rulesLoading ? (
            <p className="py-10 text-center text-body-sm text-ink-400">Cargando horarios…</p>
          ) : rulesError ? (
            <p className="py-10 text-center text-body-sm text-red-600">No pudimos cargar los horarios.</p>
          ) : groups.length === 0 ? (
            <p className="py-10 text-center text-body-sm text-ink-500">
              Todavía no hay horarios cargados. Sin ellos las canchas no se pueden reservar.
            </p>
          ) : (
            <div className="bg-white rounded-lg border border-ink-100 overflow-hidden">
              {groups.map((group, i) => (
                <div
                  key={group.key}
                  className={cn(
                    'flex items-center justify-between gap-3 px-3.5 py-3.5 min-h-[56px]',
                    i > 0 && 'border-t border-ink-100',
                  )}
                >
                  <span className="font-semibold text-body-sm text-ink-700 truncate">
                    {formatDays(group.days)}
                  </span>
                  <span className="tnum font-mono font-bold text-caption text-ink-900 flex-none">
                    {group.from} – {group.to}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : exLoading ? (
          <p className="py-10 text-center text-body-sm text-ink-400">Cargando excepciones…</p>
        ) : upcoming.length === 0 ? (
          <p className="py-10 text-center text-body-sm text-ink-500">
            No hay excepciones próximas. Las excepciones pisan el horario habitual para una fecha
            puntual.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {upcoming.map((ex) => {
              const label = formatLongDateEs(ex.date)
              return (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 px-3.5 py-3 bg-white rounded-lg border border-ink-100 shadow-xs"
                >
                  <span
                    className={cn(
                      'w-2.5 h-2.5 rounded-full flex-none',
                      ex.isAvailable ? 'bg-green-500' : 'bg-ink-400',
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-body-sm text-ink-900 truncate">{label}</p>
                    <p className="tnum font-mono text-[12.5px] text-ink-500 truncate">
                      {ex.startTime && ex.endTime
                        ? `${ex.startTime.slice(0, 5)} – ${ex.endTime.slice(0, 5)}`
                        : 'Todo el día'}
                      {' · '}
                      {ex.isAvailable ? 'Abierto' : 'Cerrado'}
                    </p>
                    {ex.reason && <p className="text-[12px] text-ink-400 truncate">{ex.reason}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => askDelete(ex.id, label)}
                    aria-label={`Quitar excepción del ${label}`}
                    className="w-11 h-11 flex-none rounded-md border-[1.5px] border-ink-200 bg-white cursor-pointer flex items-center justify-center text-red-600"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </MobileSubScreen>

      <ConfirmDialog
        request={confirm}
        onClose={() => setConfirm(null)}
        pending={deleteException.isPending}
      />
    </>
  )
}
