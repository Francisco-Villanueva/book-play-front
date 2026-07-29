import { AlertTriangle, Repeat } from 'lucide-react'
import { formatLongDateEs } from '@/shared/utils/date'
import type { AffectedBooking } from '@/shared/types/domain'

interface BlockImpactPanelProps {
  affected: AffectedBooking[]
}

// Bloquear un horario cancela las reservas que caen adentro y le manda un correo
// a cada cliente (BR-029). Esto es lo que lo hace explícito antes de confirmar.
export function BlockImpactPanel({ affected }: BlockImpactPanelProps) {
  if (affected.length === 0) {
    return (
      <div className="px-3.5 py-3 rounded-md bg-ink-50 border border-ink-100">
        <p className="text-[14px] font-bold text-ink-900 font-display">
          No hay reservas en ese horario
        </p>
        <p className="text-[12px] text-ink-500 mt-0.5">
          El bloqueo no afecta a ningún cliente.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="px-3.5 py-3 rounded-md bg-red-50 border border-red-200 mb-4 flex gap-2.5">
        <AlertTriangle size={16} className="text-red-600 flex-none mt-0.5" aria-hidden />
        <div>
          <p className="text-[14px] font-bold text-ink-900 font-display">
            Se van a cancelar {affected.length}{' '}
            {affected.length === 1 ? 'reserva' : 'reservas'}
          </p>
          <p className="text-[12px] text-ink-600 mt-0.5">
            A cada cliente le llega un correo con el motivo del bloqueo. Esto no se puede deshacer.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
        {affected.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-ink-100 bg-white"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink-900 truncate flex items-center gap-1.5">
                {b.clientName}
                {b.isRecurring && (
                  <Repeat size={12} className="text-green-600 flex-none" aria-label="Turno fijo" />
                )}
              </p>
              <p className="text-[11px] text-ink-500 truncate">
                {b.courtName} · {formatLongDateEs(b.date)}
              </p>
            </div>
            <span className="font-mono text-[12px] text-ink-700 flex-none">
              {b.startTime}–{b.endTime}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
