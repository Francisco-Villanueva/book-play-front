import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { PhoneInput } from '@/shared/components/PhoneInput'
import { useCreateBooking } from '@/features/bookings/hooks/useBookings'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatMoneyARS, relativeDayLabel } from '@/shared/utils/date'
import { isValidArgentinePhone } from '@/shared/utils/phone'
import type { Court } from '@/shared/types/domain'
import { courtColor, humanizeSport } from '../lib'
import type { Player } from '../types'
import { StepHeader } from './ComplexHeader'

interface GuestFormProps {
  businessId: string
  court: Court
  date: string
  startTime: string
  endTime: string
  onBack: () => void
  onConfirm: (player: Player, bookingId: string) => void
}

export function GuestForm({ businessId, court, date, startTime, endTime, onBack, onConfirm }: GuestFormProps) {
  const { user } = useAuthStore()
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const valid = name.trim().length >= 2 && isValidArgentinePhone(phone)
  const createBooking = useCreateBooking(businessId)

  const handleConfirm = () => {
    createBooking.mutate(
      { courtId: court.id, date, startTime, guestName: name, guestPhone: phone },
      { onSuccess: ({ data }) => onConfirm({ name, phone }, data.id) },
    )
  }

  const rows = [
    { k: 'Fecha', v: relativeDayLabel(date) },
    { k: 'Horario', v: `${startTime} – ${endTime} hs`, mono: true },
    ...(court.pricePerHour != null ? [{ k: 'Precio', v: formatMoneyARS(court.pricePerHour), mono: true }] : []),
  ]

  return (
    <>
      <StepHeader title="Tus datos" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-4">
        <div className="bg-white border border-ink-100 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-green-50 border-b border-green-100 px-3.5 py-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-none" style={{ background: courtColor(court.sportType) }} />
            <span className="font-display font-bold text-[14px] text-ink-900">{court.name}</span>
            <span className="text-[12px] text-ink-500 ml-auto">{humanizeSport(court.sportType)}</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.k}
              className="flex justify-between items-center px-3.5 py-2.5"
              style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}
            >
              <span className="text-[13px] text-ink-500">{r.k}</span>
              <span
                className="text-[14px] font-bold text-ink-900"
                style={{ fontFamily: r.mono ? 'var(--font-mono)' : undefined }}
              >
                {r.v}
              </span>
            </div>
          ))}
        </div>

        <Input
          label="Nombre completo"
          placeholder="Ej: Martín Gómez"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <PhoneInput
          label="Teléfono"
          value={phone}
          onChange={setPhone}
          required
          helperText="El complejo te puede contactar por este número."
        />

        <div className="flex gap-2 items-start px-3 py-2.5 bg-ink-50 rounded-md">
          <Lock size={13} className="text-ink-400 flex-none mt-0.5" aria-hidden />
          <span className="text-[11px] text-ink-400 leading-relaxed">
            {user
              ? 'Vas a reservar con tu cuenta — la vas a poder ver en "Mis turnos".'
              : 'Tus datos solo los ve el complejo. No creamos una cuenta ni enviamos publicidad.'}
          </span>
        </div>

        {createBooking.isError && (
          <p className="text-body-sm text-red-600 text-center">{getApiErrorMessage(createBooking.error)}</p>
        )}
      </div>
      <div
        className="flex-none px-4 pb-5 pt-3 bg-white border-t border-ink-100"
        style={{ boxShadow: '0 -4px 16px -10px rgba(19,26,31,.2)' }}
      >
        <Button full size="lg" disabled={!valid || createBooking.isPending} onClick={handleConfirm}>
          {createBooking.isPending ? 'Confirmando…' : 'Confirmar reserva'}
        </Button>
      </div>
    </>
  )
}
