import { useState } from 'react'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatLongDateEs } from '@/shared/utils/date'
import {
  useCreateExceptionRule,
  usePreviewExceptionImpact,
} from '@/features/exception-rules/hooks/useExceptionRules'
import { BlockImpactPanel } from '../BlockImpactPanel'
import { hFmt, type AgendaCourt } from '../agendaTypes'
import { Sheet } from './Sheet'
import type { AffectedBooking } from '@/shared/types/domain'

interface MobileBlockSheetProps {
  businessId: string
  date: string
  court: AgendaCourt
  hour: number
  onClose: () => void
  onSaved: () => void
}

export function MobileBlockSheet({ businessId, date, court, hour, onClose, onSaved }: MobileBlockSheetProps) {
  const [reason, setReason] = useState('')
  // El bloqueo cancela las reservas de esa franja y les manda un correo: primero
  // se muestra a quién alcanza, recién después se confirma (BR-029).
  const [impact, setImpact] = useState<AffectedBooking[] | null>(null)

  const preview = usePreviewExceptionImpact(businessId)
  const mutation = useCreateExceptionRule(businessId)
  const active = impact ? mutation : preview

  const payload = {
    date,
    startTime: hFmt(hour),
    endTime: hFmt(hour + 1),
    isAvailable: false,
    ...(reason.trim() ? { reason: reason.trim() } : {}),
    courtIds: [court.id],
  }

  const handleContinue = () => {
    preview.mutate(payload, { onSuccess: (data) => setImpact(data.bookings) })
  }

  return (
    <Sheet
      onClose={onClose}
      title={impact ? 'Confirmar bloqueo' : 'Bloquear turno'}
      subtitle={`${court.name} · ${hFmt(hour)}–${hFmt(hour + 1)} · ${formatLongDateEs(date)}`}
      footer={
        <button
          type="button"
          disabled={active.isPending}
          onClick={impact ? () => mutation.mutate(payload, { onSuccess: onSaved }) : handleContinue}
          data-testid="mobile-block-save"
          className="w-full h-[50px] rounded-md border-none bg-green-500 text-white shadow-brand font-body font-bold text-[15.5px] cursor-pointer disabled:opacity-50"
        >
          {active.isPending
            ? (impact ? 'Bloqueando…' : 'Revisando…')
            : (impact ? 'Bloquear turno' : 'Continuar')}
        </button>
      }
    >
      {impact ? (
        <BlockImpactPanel affected={impact} />
      ) : (
        <>
          <label htmlFor="mobile-block-reason" className="block text-[12.5px] font-bold text-ink-700 mb-1.5">
            Motivo <span className="font-medium text-ink-400">(opcional)</span>
          </label>
          <input
            id="mobile-block-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Mantenimiento, uso propio, torneo…"
            className="w-full h-[50px] px-3.5 rounded-md border-[1.5px] border-ink-200 bg-white font-body text-[16px] text-ink-900 outline-none focus:border-green-500"
          />
          <p className="mt-2 text-[12px] text-ink-500">
            Si hay reservas en ese horario, te las mostramos antes de confirmar.
          </p>
        </>
      )}

      {active.isError && (
        <p className="mt-3 text-body-sm text-red-600">{getApiErrorMessage(active.error)}</p>
      )}
    </Sheet>
  )
}
