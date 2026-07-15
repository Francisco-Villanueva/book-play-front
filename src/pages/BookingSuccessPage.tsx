import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PlayerAppShell } from '@/features/bookings/components/PlayerAppShell'
import { Button } from '@/shared/components/Button'

export default function BookingSuccessPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const time = params.get('time') ?? '19:00'
  const endH = String((Number(time.split(':')[0]) + 1) % 24).padStart(2, '0')
  const endTime = `${endH}:00`

  return (
    <PlayerAppShell>
      <div className="flex-1 flex flex-col items-center justify-center px-7 text-center">
        <div className="w-[88px] h-[88px] rounded-full bg-green-50 flex items-center justify-center mb-5">
          <div className="w-[60px] h-[60px] rounded-full bg-green-500 flex items-center justify-center shadow-brand">
            <Check size={34} color="white" strokeWidth={3} aria-hidden />
          </div>
        </div>
        <h1 className="font-display font-bold text-[26px] text-ink-900 tracking-tight mb-2">
          ¡Turno reservado!
        </h1>
        <p className="font-mono font-bold text-h4 text-ink-900 mb-7">
          Hoy · {time} – {endTime}
        </p>
        <div className="w-full max-w-[280px] flex flex-col gap-2.5">
          <Button full size="lg" onClick={() => navigate('/my-bookings')}>
            Ver mis turnos
          </Button>
          <Button full variant="ghost" onClick={() => navigate('/dashboard')}>
            Reservar otra cancha
          </Button>
        </div>
      </div>
    </PlayerAppShell>
  )
}
