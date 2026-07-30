import { useMemo, useState } from 'react'
import { Repeat } from 'lucide-react'
import { SegmentedControl } from '@/shared/components/SegmentedControl'
import { ConfirmDialog, type ConfirmRequest } from '@/features/admin/components/mobile/ConfirmDialog'
import { flashToast } from '@/shared/store/toastStore'
import { weekdayNameEs } from '@/shared/utils/date'
import { Button } from '@/shared/components/Button'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import {
  useEndRecurring,
  useRecurringBookings,
  useResendGuestLink,
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

  const [emailPrompt, setEmailPrompt] = useState<RecurringBooking | null>(null)
  const [emailDraft, setEmailDraft] = useState('')

  const { data, isLoading, isError } = useRecurringBookings(businessId)
  const endSeries = useEndRecurring(businessId)
  const resendLink = useResendGuestLink(businessId)

  const sendLink = (series: RecurringBooking, email?: string) => {
    resendLink.mutate(
      { seriesId: series.id, ...(email ? { email } : {}) },
      {
        onSuccess: (res) => {
          setEmailPrompt(null)
          setEmailDraft('')
          flashToast(`Link enviado a ${res.sentTo}`)
        },
      },
    )
  }

  // Sin correo cargado no hay a dónde mandarlo: se pide en el momento y de paso
  // queda guardado en la serie.
  const askResend = (series: RecurringBooking) => {
    if (series.guestEmail) return sendLink(series)
    setEmailDraft('')
    setEmailPrompt(series)
  }

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
            <RecurringSeriesCard key={s.id} series={s} onEnd={askEnd} onResendLink={askResend} />
          ))}
        </ul>
      )}

      <ConfirmDialog
        request={confirm}
        onClose={() => setConfirm(null)}
        pending={endSeries.isPending}
      />

      {emailPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enviar el link al cliente"
          className="fixed inset-0 z-[130] flex items-center justify-center p-6"
          style={{ background: 'rgba(13,20,25,0.48)' }}
        >
          <div className="w-full max-w-[400px] bg-white rounded-xl shadow-xl p-5">
            <h3 className="font-display font-bold text-[17px] text-ink-900 mb-1">
              Enviarle el link a {emailPrompt.guestName ?? 'el cliente'}
            </h3>
            <p className="text-[13px] text-ink-500 mb-4">
              Con ese link puede ver sus fechas y dar de baja las semanas que no puede venir.
              El correo queda guardado en el turno fijo.
            </p>
            <label htmlFor="resend-email" className="block text-[12.5px] font-bold text-ink-700 mb-1.5">
              Correo del cliente
            </label>
            <input
              id="resend-email"
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="w-full h-[46px] px-3.5 rounded-md border-[1.5px] border-ink-200 bg-white font-body text-[15px] text-ink-900 outline-none focus:border-green-500"
            />
            {resendLink.isError && (
              <p className="mt-2 text-caption text-red-600">
                {getApiErrorMessage(resendLink.error)}
              </p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setEmailPrompt(null)}>
                Cancelar
              </Button>
              <Button
                disabled={!emailDraft.includes('@') || resendLink.isPending}
                onClick={() => sendLink(emailPrompt, emailDraft.trim())}
                data-testid="recurring-resend-confirm"
              >
                {resendLink.isPending ? 'Enviando…' : 'Enviar link'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
