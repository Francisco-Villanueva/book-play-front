import { AlertTriangle, Check, X } from 'lucide-react'
import { formatLongDateEs } from '@/shared/utils/date'
import type { RecurringPreview } from '@/shared/types/domain'

interface RecurringPreviewPanelProps {
  preview: RecurringPreview
}

// Las fechas que van a quedar afuera se muestran ANTES de confirmar: crear el
// turno fijo saltea los choques en silencio, y eso no puede ser una sorpresa.
export function RecurringPreviewPanel({ preview }: RecurringPreviewPanelProps) {
  const free = preview.occurrences.filter((o) => o.available)
  const taken = preview.occurrences.filter((o) => !o.available)

  return (
    <div>
      <div className="px-3.5 py-3 rounded-md bg-green-50 border border-green-200 mb-4">
        <p className="text-[14px] font-bold text-ink-900 font-display">
          Se van a reservar {free.length} {free.length === 1 ? 'fecha' : 'fechas'}
        </p>
        <p className="text-[12px] text-ink-500 mt-0.5">
          Hasta el {formatLongDateEs(preview.until)}. Después se extiende solo, semana a semana.
        </p>
      </div>

      {taken.length > 0 && (
        <div className="px-3.5 py-3 rounded-md bg-amber-50 border border-amber-200 mb-4 flex gap-2.5">
          <AlertTriangle size={16} className="text-amber-600 flex-none mt-0.5" aria-hidden />
          <div>
            <p className="text-[13px] font-bold text-ink-900">
              {taken.length} {taken.length === 1 ? 'fecha queda' : 'fechas quedan'} afuera
            </p>
            <p className="text-[12px] text-ink-600 mt-0.5">
              El turno fijo se crea igual. Esas fechas hay que resolverlas aparte.
            </p>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
        {preview.occurrences.map((o) => (
          <li
            key={o.date}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-ink-100 bg-white"
          >
            <div className="flex items-center gap-2 min-w-0">
              {o.available ? (
                <Check size={14} className="text-green-600 flex-none" aria-hidden />
              ) : (
                <X size={14} className="text-amber-600 flex-none" aria-hidden />
              )}
              <span className="text-[13px] text-ink-900 truncate">
                {formatLongDateEs(o.date)}
              </span>
            </div>
            {!o.available && (
              <span className="text-[11px] text-amber-700 flex-none">{o.reason}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
