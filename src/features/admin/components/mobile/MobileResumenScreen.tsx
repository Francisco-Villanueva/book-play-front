import { useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import { useBookings } from '@/features/bookings/hooks/useBookings'
import { addDaysISO, formatLongDateEs, formatMoneyARS, todayISO } from '@/shared/utils/date'
import { useAgendaDay } from '../../hooks/useAgendaDay'
import { computeTrend } from '../dashboard/dashboardData'
import { HOUR_END, HOUR_START } from '../agendaTypes'
import { StackScreen } from './StackScreen'

interface MobileResumenScreenProps {
  businessId: string
  date: string
  onBack: () => void
}

export function MobileResumenScreen({ businessId, date, onBack }: MobileResumenScreenProps) {
  const today = todayISO()
  const { courts, bookings } = useAgendaDay(businessId, date)
  // Mismo rango que el panel de escritorio: React Query comparte la caché.
  const { data: weekBookings } = useBookings(businessId, {
    dateFrom: addDaysISO(today, -7),
    dateTo: today,
  })

  const stats = useMemo(() => {
    const real = bookings.filter((b) => b.st !== 'blocked')
    const capacity = (HOUR_END - HOUR_START) * Math.max(courts.length, 1)
    const busy = bookings.reduce((n, b) => n + (b.e - b.s), 0)
    return {
      count: real.length,
      occupancy: Math.round((busy / capacity) * 100),
      income: real.reduce((n, b) => n + (b.price ?? 0), 0),
      paid: real.filter((b) => b.paymentStatus === 'PAID').length,
      unpaid: real.filter((b) => b.paymentStatus !== 'PAID').length,
    }
  }, [bookings, courts])

  const trend = useMemo(() => computeTrend(weekBookings ?? []), [weekBookings])
  const peak = Math.max(1, ...trend.map((t) => t.res))

  return (
    <StackScreen title="Resumen del día" subtitle={formatLongDateEs(date)} onBack={onBack}>
      <div className="flex gap-2.5 mb-2.5">
        <Kpi value={String(stats.count)} label="reservas" hint={`${stats.paid} cobradas`} />
        <Kpi
          value={`${stats.occupancy}%`}
          label="ocupación"
          hint={`${courts.length} ${courts.length === 1 ? 'cancha' : 'canchas'}`}
          color="var(--green-600)"
        />
      </div>

      <div className="mb-4">
        <Kpi value={formatMoneyARS(stats.income)} label="ingresos del día" hint="turnos activos" />
      </div>

      <div className="p-4 bg-white rounded-lg border border-ink-100 shadow-xs mb-4">
        <p className="text-[12.5px] font-bold text-ink-700 mb-3">Reservas · últimos 7 días</p>
        <div className="flex items-end gap-2 h-20">
          {trend.map((point, i) => (
            <div key={`${point.label}-${i}`} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t-xs"
                style={{
                  height: `${Math.max(4, (point.res / peak) * 100)}%`,
                  background: i === trend.length - 1 ? 'var(--green-500)' : 'var(--green-200)',
                }}
              />
              <span className="text-[10px] text-ink-400">{point.label}</span>
            </div>
          ))}
        </div>
      </div>

      {stats.unpaid > 0 && (
        <div className="flex items-center gap-2.5 px-3.5 py-3 bg-amber-50 rounded-md border border-amber-100">
          <AlertCircle size={18} className="text-amber-700 flex-none" aria-hidden />
          <span className="text-body-sm font-semibold text-amber-700">
            Requiere atención: {stats.unpaid === 1 ? '1 turno sin cobrar' : `${stats.unpaid} turnos sin cobrar`}
          </span>
        </div>
      )}
    </StackScreen>
  )
}

interface KpiProps {
  value: string
  label: string
  hint: string
  color?: string
}

function Kpi({ value, label, hint, color }: KpiProps) {
  return (
    <div className="flex-1 min-w-0 p-3.5 bg-white rounded-lg border border-ink-100 shadow-xs">
      <p
        className="tnum font-mono font-bold text-[24px] tracking-tight truncate"
        style={{ color: color ?? 'var(--ink-900)' }}
      >
        {value}
      </p>
      <p className="text-[12.5px] font-semibold text-ink-700 mt-0.5">{label}</p>
      <p className="text-[11px] text-ink-400 mt-px">{hint}</p>
    </div>
  )
}
