import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CalendarX, Repeat } from 'lucide-react'
import { AppHeader } from '@/features/bookings/components/AppHeader'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import {
  useCancelGuestInstance,
  useGuestSeries,
} from '@/features/recurring-bookings/hooks/useRecurringBookings'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatLongDateEs, weekdayNameEs } from '@/shared/utils/date'

// El link del correo de turno fijo. Deja dar de baja una fecha suelta ("esta
// semana no puedo") — nunca la serie entera, que la decide el complejo.
export default function GuestRecurringPage() {
  const { businessId, seriesId } = useParams<{ businessId: string; seriesId: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? undefined
  const [confirming, setConfirming] = useState<string | null>(null)

  const { data: series, isLoading, isError } = useGuestSeries(businessId, seriesId, token)
  const cancelInstance = useCancelGuestInstance(businessId, seriesId, token)

  return (
    <div className="flex justify-center" style={{ background: 'var(--surface-sunken)', minHeight: '100dvh' }}>
      <div className="w-full max-w-[480px] flex flex-col" style={{ background: 'var(--surface-page)', minHeight: '100dvh' }}>
        <AppHeader title="Mi turno fijo" />
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {!token || isError ? (
            <EmptyState
              icon={CalendarX}
              variant="dashed"
              title="No encontramos este turno fijo"
              description="El enlace no es válido o ya venció. Si necesitás ayuda, contactá al complejo."
            />
          ) : isLoading || !series ? (
            <p className="text-center text-body-sm text-ink-400 py-12">Cargando turno fijo…</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-ink-100 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-green-50 border-b border-green-100 px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-[15px] text-ink-900 inline-flex items-center gap-1.5">
                    <Repeat size={14} className="text-green-600" aria-hidden />
                    {series.courtName}
                  </span>
                  <Badge tone={series.status === 'ACTIVE' ? 'success' : 'default'}>
                    {series.status === 'ACTIVE' ? 'Activo' : 'Terminado'}
                  </Badge>
                </div>
                {[
                  { k: 'Complejo', v: series.businessName },
                  { k: 'Día', v: `Todos los ${weekdayNameEs(series.dayOfWeek)}` },
                  { k: 'Horario', v: `${series.startTime.slice(0, 5)} hs` },
                ].map((r) => (
                  <div key={r.k} className="flex justify-between items-center px-3.5 py-2.5 border-t border-ink-100">
                    <span className="text-[13px] text-ink-500">{r.k}</span>
                    <span className="text-[14px] font-bold text-ink-900 text-right">{r.v}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[12px] font-bold uppercase tracking-wide text-ink-400 mb-2">
                  Próximas fechas
                </p>
                {series.instances.length === 0 ? (
                  <p className="text-body-sm text-ink-500 py-4 text-center">
                    No quedan fechas próximas.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {series.instances.map((i) => {
                      const cancelled = i.status === 'CANCELLED'
                      return (
                        <li
                          key={i.id}
                          className="bg-white border border-ink-100 rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-2"
                        >
                          <span
                            className={
                              cancelled
                                ? 'text-[14px] text-ink-400 line-through'
                                : 'text-[14px] font-semibold text-ink-900'
                            }
                          >
                            {formatLongDateEs(i.date)}
                          </span>
                          {cancelled ? (
                            <Badge tone="default">Dada de baja</Badge>
                          ) : !i.canCancel ? (
                            <span className="text-[11px] text-ink-400 flex-none text-right max-w-[130px]">
                              Fuera de plazo · avisale al complejo
                            </span>
                          ) : confirming === i.id ? (
                            <span className="flex gap-1.5 flex-none">
                              <Button variant="ghost" onClick={() => setConfirming(null)}>
                                No
                              </Button>
                              <Button
                                variant="danger"
                                disabled={cancelInstance.isPending}
                                onClick={() =>
                                  cancelInstance.mutate(i.id, {
                                    onSuccess: () => setConfirming(null),
                                  })
                                }
                                data-testid={`guest-series-cancel-confirm-${i.id}`}
                              >
                                {cancelInstance.isPending ? 'Dando de baja…' : 'Sí, dar de baja'}
                              </Button>
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => setConfirming(i.id)}
                              data-testid={`guest-series-cancel-${i.id}`}
                            >
                              No puedo
                            </Button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
                {cancelInstance.isError && (
                  <p className="mt-2 text-caption text-red-600">
                    {getApiErrorMessage(cancelInstance.error)}
                  </p>
                )}
              </div>

              <p className="text-[12px] text-ink-500 text-center">
                Dar de baja una fecha no cancela tu turno fijo: seguís teniendo el horario las demás
                semanas. Para darlo de baja del todo, hablá con el complejo.
                {series.cancellationDeadlineHours > 0 && (
                  <>
                    {' '}Podés dar de baja hasta{' '}
                    <strong>
                      {series.cancellationDeadlineHours}{' '}
                      {series.cancellationDeadlineHours === 1 ? 'hora' : 'horas'}
                    </strong>{' '}
                    antes de cada turno.
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
