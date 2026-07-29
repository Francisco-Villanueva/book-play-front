import { useCallback, useEffect, useRef, useState } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastState {
  message: string
  kind: ToastKind
  onUndo?: (() => void) | undefined
}

interface FlashOptions {
  kind?: ToastKind
  onUndo?: () => void
}

const PLAIN_MS = 2600
const UNDO_MS = 5000

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timer = useRef<number | null>(null)

  const dismiss = useCallback(() => {
    if (timer.current != null) window.clearTimeout(timer.current)
    setToast(null)
  }, [])

  const flash = useCallback((message: string, options: FlashOptions = {}) => {
    if (timer.current != null) window.clearTimeout(timer.current)
    setToast({ message, kind: options.kind ?? 'success', onUndo: options.onUndo })
    timer.current = window.setTimeout(() => setToast(null), options.onUndo ? UNDO_MS : PLAIN_MS)
  }, [])

  useEffect(
    () => () => {
      if (timer.current != null) window.clearTimeout(timer.current)
    },
    [],
  )

  return { toast, flash, dismiss }
}
