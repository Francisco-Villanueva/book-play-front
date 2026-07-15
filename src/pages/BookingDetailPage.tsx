import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, MapPin, CalendarX, AlertTriangle } from 'lucide-react'
import { PlayerAppShell } from '@/features/bookings/components/PlayerAppShell'
import { AppHeader } from '@/features/bookings/components/AppHeader'
import { IconButton } from '@/shared/components/IconButton'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { useMyBooking, useCancelMyBooking } from '@/features/bookings/hooks/useBookings'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatLongDateEs, formatMoneyARS } from '@/shared/utils/date'

function humanizeSport(s?: string): string {
  if (!s) return 'Cancha'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const { data: booking, isLoading, isError } = useMyBooking(bookingId)
  const cancelBooking = useCancelMyBooking()

  return (
    <PlayerAppShell>
      <AppHeader
        title="Turno"
        left={
          <IconButton variant="outline" onClick={() => navigate('/my-bookings')} aria-label="Volver">
            <ChevronLeft size={20} />
          </IconButton>
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {isLoading ? (
          <p className="text-center text-body-sm text-ink-400 py-12">Cargando turno…</p>
        ) : isError || !booking ? (
          <EmptyState
            icon={CalendarX}
            variant="dashed"
            title="No encontramos este turno"
            description="Puede que ya no exista o que no te pertenezca."
            primaryAction={{ label: 'Volver a mis turnos', onClick: () => navigate('/my-bookings') }}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-ink-100 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-green-50 border-b border-green-100 px-3.5 py-2.5 flex items-center justify-between gap-2">
                <span className="font-display font-bold text-[15px] text-ink-900">{booking.court?.name ?? 'Cancha'}</span>
                <Badge tone={booking.status === 'CANCELLED' ? 'danger' : 'success'}>
                  {booking.status === 'CANCELLED' ? 'Cancelada' : 'Confirmada'}
                </Badge>
              </div>
              {booking.business?.name && (
                <div className="flex items-center gap-1.5 px-3.5 pt-2.5 text-[12px] text-ink-500">
                  <MapPin size={12} className="flex-none" aria-hidden />
                  <span className="truncate">{booking.business.name}</span>
                </div>
              )}
              {[
                { k: 'Deporte', v: humanizeSport(booking.court?.sportType) },
                { k: 'Fecha', v: formatLongDateEs(booking.date) },
                { k: 'Horario', v: `${booking.startTime.slice(0, 5)} – ${booking.endTime.slice(0, 5)} hs`, mono: true },
                ...(booking.totalPrice != null ? [{ k: 'Precio', v: formatMoneyARS(booking.totalPrice), mono: true }] : []),
                ...(booking.notes ? [{ k: 'Nota', v: booking.notes }] : []),
              ].map((r) => (
                <div key={r.k} className="flex justify-between items-center px-3.5 py-2.5 border-t border-ink-100">
                  <span className="text-[13px] text-ink-500">{r.k}</span>
                  <span className="text-[14px] font-bold text-ink-900 text-right" style={{ fontFamily: r.mono ? 'var(--font-mono)' : undefined }}>{r.v}</span>
                </div>
              ))}
            </div>

            {booking.status === 'ACTIVE' && (
              confirming ? (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3.5 flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-600 flex-none mt-0.5" aria-hidden />
                    <p className="text-[13px] text-red-700 font-semibold">¿Seguro que querés cancelar este turno? Esta acción no se puede deshacer.</p>
                  </div>
                  {cancelBooking.isError && (
                    <p className="text-caption text-red-600">{getApiErrorMessage(cancelBooking.error)}</p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" full onClick={() => setConfirming(false)} disabled={cancelBooking.isPending}>
                      No, mantener
                    </Button>
                    <Button
                      variant="danger"
                      full
                      disabled={cancelBooking.isPending}
                      onClick={() => cancelBooking.mutate(booking.id, { onSuccess: () => setConfirming(false) })}
                      data-testid="booking-cancel-confirm"
                    >
                      {cancelBooking.isPending ? 'Cancelando…' : 'Sí, cancelar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="danger" full onClick={() => setConfirming(true)} data-testid="booking-cancel-button">
                  Cancelar turno
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </PlayerAppShell>
  )
}
