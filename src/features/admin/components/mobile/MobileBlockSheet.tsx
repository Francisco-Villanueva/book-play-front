import { useState } from 'react'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatLongDateEs } from '@/shared/utils/date'
import { useCreateExceptionRule } from '@/features/exception-rules/hooks/useExceptionRules'
import { hFmt, type AgendaCourt } from '../agendaTypes'
import { Sheet } from './Sheet'

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
  const mutation = useCreateExceptionRule(businessId)

  const handleSave = () => {
    mutation.mutate(
      {
        date,
        startTime: hFmt(hour),
        endTime: hFmt(hour + 1),
        isAvailable: false,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
        courtIds: [court.id],
      },
      { onSuccess: onSaved },
    )
  }

  return (
    <Sheet
      onClose={onClose}
      title="Bloquear turno"
      subtitle={`${court.name} · ${hFmt(hour)}–${hFmt(hour + 1)} · ${formatLongDateEs(date)}`}
      footer={
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={handleSave}
          data-testid="mobile-block-save"
          className="w-full h-[50px] rounded-md border-none bg-green-500 text-white shadow-brand font-body font-bold text-[15.5px] cursor-pointer disabled:opacity-50"
        >
          {mutation.isPending ? 'Bloqueando…' : 'Bloquear turno'}
        </button>
      }
    >
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

      {mutation.isError && (
        <p className="mt-3 text-body-sm text-red-600">{getApiErrorMessage(mutation.error)}</p>
      )}
    </Sheet>
  )
}
