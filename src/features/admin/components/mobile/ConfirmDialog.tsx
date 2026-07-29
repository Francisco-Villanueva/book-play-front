import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export interface ConfirmRequest {
  title: string
  body: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
}

interface ConfirmDialogProps {
  request: ConfirmRequest | null
  onClose: () => void
  pending?: boolean
}

export function ConfirmDialog({ request, onClose, pending = false }: ConfirmDialogProps) {
  useEffect(() => {
    if (!request) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [request, onClose])

  if (!request) return null

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={request.title}
      className="fixed inset-0 z-[130] flex items-center justify-center p-6"
    >
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-[rgba(13,20,25,0.5)] animate-backdrop-in" />

      <div className="relative w-full max-w-[320px] rounded-xl bg-white shadow-xl px-5 pt-[22px] pb-[18px] animate-dialog-in">
        <div className="w-[46px] h-[46px] rounded-full bg-red-50 flex items-center justify-center mb-3.5">
          <AlertTriangle size={22} className="text-red-600" aria-hidden />
        </div>
        <h3 className="font-display font-bold text-[19px] text-ink-900 mb-1.5">{request.title}</h3>
        <p className="text-body-sm text-ink-500 mb-[18px]">{request.body}</p>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[46px] rounded-md border-[1.5px] border-ink-200 bg-white cursor-pointer font-body font-bold text-body-sm text-ink-700"
          >
            {request.cancelLabel ?? 'Volver'}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={request.onConfirm}
            className="flex-1 h-[46px] rounded-md border-none bg-red-500 text-white cursor-pointer font-body font-bold text-body-sm disabled:opacity-60"
          >
            {pending ? 'Un momento…' : request.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
