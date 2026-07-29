import { useToastStore } from '@/shared/store/toastStore'
import { Toast } from './Toast'

/** Único punto de montaje del toast. Va en `Providers`, por encima del router. */
export function ToastHost() {
  const toast = useToastStore((s) => s.toast)
  const dismiss = useToastStore((s) => s.dismiss)

  if (!toast) return null
  return <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
}
