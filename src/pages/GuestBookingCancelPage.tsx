import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CalendarX, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { AppHeader } from '@/features/bookings/components/AppHeader'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { useGuestCancellation, useCancelGuestBooking } from '@/features/bookings/hooks/useBookings'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatLongDateEs } from '@/shared/utils/date'

export default function GuestBookingCancelPage() {
  const { businessId, bookingId } = useParams<{ businessId: string; bookingId: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? undefined
  const [confirming, setConfirming] = useState(false)

  const { data: booking, isLoading, isError } = useGuestCancellation(businessId, bookingId, token)
  const cancelBooking = useCancelGuestBooking(businessId, bookingId)

  return (
    <div className="flex justify-center" style={{ background: 'var(--surface-sunken)', minHeight: '100dvh' }}>
      <div className="w-full max-w-[480px] flex flex-col" style={{ background: 'var(--surface-page)', minHeight: '100dvh' }}>
        <AppHeader title="Cancelar turno" />
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {!token || isError ? (
            <EmptyState
              icon={CalendarX}
              variant="dashed"
              title="No encontramos este turno"
              description="El enlace no es válido o ya venció. Si necesitás ayuda, contactá al complejo."
            />
          ) : isLoading || !booking ? (
            <p className="text-center text-body-sm text-ink-400 py-12">Cargando turno…</p>
          ) : cancelBooking.isSuccess ? (
            <div className="flex flex-col items-center text-center gap-3 py-12 px-4">
              <CheckCircle2 size={48} className="text-green-600" aria-hidden />
              <p className="font-display font-bold text-h4 text-ink-900">Reserva cancelada</p>
              <p className="text-body-sm text-ink-500">Te enviamos la confirmación por correo.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-ink-100 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-green-50 border-b border-green-100 px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-[15px] text-ink-900">{booking.courtName}</span>
                  <Badge tone={booking.status === 'CANCELLED' ? 'danger' : 'success'}>
                    {booking.status === 'CANCELLED' ? 'Cancelada' : 'Confirmada'}
                  </Badge>
                </div>
                {[
                  { k: 'Complejo', v: booking.businessName },
                  { k: 'Fecha', v: formatLongDateEs(booking.date) },
                  { k: 'Horario', v: `${booking.startTime.slice(0, 5)} – ${booking.endTime.slice(0, 5)} hs` },
                ].map((r) => (
                  <div key={r.k} className="flex justify-between items-center px-3.5 py-2.5 border-t border-ink-100">
                    <span className="text-[13px] text-ink-500">{r.k}</span>
                    <span className="text-[14px] font-bold text-ink-900 text-right">{r.v}</span>
                  </div>
                ))}
              </div>

              {booking.status === 'CANCELLED' ? (
                <p className="text-center text-body-sm text-ink-500 py-4">Esta reserva ya estaba cancelada.</p>
              ) : confirming ? (
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
                      onClick={() => cancelBooking.mutate(token)}
                      data-testid="guest-booking-cancel-confirm"
                    >
                      {cancelBooking.isPending ? 'Cancelando…' : 'Sí, cancelar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="danger" full onClick={() => setConfirming(true)} data-testid="guest-booking-cancel-button">
                  Cancelar reserva
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
