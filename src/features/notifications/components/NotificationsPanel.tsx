import { useEffect, useRef } from 'react'
import { BellOff, CalendarX, Repeat } from 'lucide-react'
import { relativeTimeEs } from '@/shared/utils/date'
import type { Notification, NotificationType } from '@/shared/types/domain'

const ICONS: Record<NotificationType, typeof CalendarX> = {
  BOOKING_CANCELLED_BY_CLIENT: CalendarX,
  RECURRING_INSTANCE_CANCELLED_BY_CLIENT: Repeat,
}

interface NotificationsPanelProps {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  onClose: () => void
  onSelect: (notification: Notification) => void
  onMarkAllRead: () => void
}

export function NotificationsPanel({
  notifications, unreadCount, isLoading, onClose, onSelect, onMarkAllRead,
}: NotificationsPanelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKey)
    // En el mismo tick el click que abrió el panel todavía está burbujeando y lo
    // cerraría al instante.
    const id = window.setTimeout(() => document.addEventListener('mousedown', onClick), 0)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
      window.clearTimeout(id)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Notificaciones"
      className="absolute right-0 top-[46px] z-50 w-[340px] max-h-[420px] flex flex-col bg-white border border-ink-100 rounded-lg shadow-xl overflow-hidden"
    >
      <div className="flex-none flex items-center justify-between px-3.5 py-2.5 border-b border-ink-100">
        <span className="font-display font-bold text-[14px] text-ink-900">Notificaciones</span>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-[12px] font-semibold text-green-700 bg-transparent border-none cursor-pointer"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="text-center text-[13px] text-ink-400 py-8">Cargando…</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-2 py-9 px-4">
            <BellOff size={20} className="text-ink-300" aria-hidden />
            <p className="text-[13px] text-ink-500">No tenés notificaciones.</p>
          </div>
        ) : (
          <ul>
            {notifications.map((n) => {
              const Icon = ICONS[n.type] ?? CalendarX
              const unread = !n.readAt
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(n)}
                    data-testid={`notification-${n.id}`}
                    className="w-full flex items-start gap-2.5 px-3.5 py-3 border-none border-b border-ink-100 cursor-pointer text-left"
                    style={{ background: unread ? 'var(--green-50)' : 'transparent' }}
                  >
                    <span className="w-8 h-8 flex-none rounded-full bg-white border border-ink-100 flex items-center justify-center">
                      <Icon size={15} className="text-ink-600" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-ink-900 truncate">{n.title}</span>
                        {unread && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-green-500 flex-none"
                            aria-label="Sin leer"
                          />
                        )}
                      </span>
                      <span className="block text-[12px] text-ink-600 mt-0.5">{n.body}</span>
                      <span className="block text-[11px] text-ink-400 mt-1">
                        {relativeTimeEs(n.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
