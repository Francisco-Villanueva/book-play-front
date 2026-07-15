import { CalendarX, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import type { AttentionItem } from './dashboardData'

interface AttentionPanelProps {
  items: AttentionItem[]
  onResolve: () => void
}

export function AttentionPanel({ items, onResolve }: AttentionPanelProps) {
  return (
    <div className="bg-white border border-ink-100 rounded-lg p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3.5">
        <h2 className="font-display font-bold text-[17px] text-ink-900">Requiere tu atención</h2>
        {items.length > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-50 text-red-600 text-[11px] font-extrabold">
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-2 py-[22px] px-2">
          <span className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 size={21} aria-hidden />
          </span>
          <p className="text-body-sm text-ink-500">Por ahora no hay nada que requiera tu acción.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {items.map((it, i) => (
            <div key={it.id} className={`flex items-center gap-3 py-2.5 ${i > 0 ? 'border-t border-ink-100' : ''}`}>
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center flex-none"
                style={{ background: 'var(--red-50)', color: 'var(--red-600)' }}
              >
                <CalendarX size={17} aria-hidden />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold text-ink-900">{it.title}</div>
                <div className="text-[12px] text-ink-500 mt-px truncate">{it.desc}</div>
              </div>
              <Button variant="secondary" size="sm" className="flex-none" onClick={onResolve}>
                Reprogramar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
