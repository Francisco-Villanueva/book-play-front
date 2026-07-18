import { Activity, Banknote, CalendarSearch, Check, Clock, LayoutGrid, Layers, MapPin } from 'lucide-react'
import { formatMoneyARS } from '@/shared/utils/date'
import type { Court } from '@/shared/types/domain'
import { humanizeSport, initials } from '../lib'
import type { PublicStep } from '../types'

interface SummarySidebarProps {
  businessName: string
  address?: string | null | undefined
  step: PublicStep
  court: Court | null
  startTime: string | null
  endTime: string | null
}

function Row({
  icon,
  label,
  value,
  mono,
  last,
}: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
  last?: boolean
}) {
  return (
    <div
      className="flex items-center gap-2.5 py-2.5"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}
    >
      <span className="w-7 h-7 rounded-sm bg-ink-50 flex-none flex items-center justify-center text-ink-400">
        {icon}
      </span>
      <span className="text-[12px] text-ink-500 w-[54px] flex-none">{label}</span>
      <span
        className="text-[13px] font-semibold text-ink-900 flex-1 truncate"
        style={{ fontFamily: mono ? 'var(--font-mono)' : undefined }}
      >
        {value}
      </span>
    </div>
  )
}

export function SummarySidebar({ businessName, address, step, court, startTime, endTime }: SummarySidebarProps) {
  const isSuccess = step === 'success'

  return (
    <div className="bg-white border border-ink-100 rounded-lg shadow-md overflow-hidden">
      <div
        className="px-5 pt-4 pb-3.5 border-b border-ink-100"
        style={{
          background: isSuccess
            ? 'var(--action-primary)'
            : 'linear-gradient(135deg, var(--green-50) 0%, var(--surface-card) 100%)',
        }}
      >
        {isSuccess && (
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,.25)' }}>
              <Check size={26} strokeWidth={3} className="text-white" />
            </div>
          </div>
        )}
        <div
          className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
          style={{ color: isSuccess ? 'rgba(255,255,255,.75)' : 'var(--green-700)' }}
        >
          {isSuccess ? '¡Reserva confirmada!' : 'Resumen de reserva'}
        </div>
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-md flex-none text-white flex items-center justify-center font-display font-extrabold text-[13px]"
            style={{ background: isSuccess ? 'rgba(255,255,255,.2)' : 'var(--action-primary)' }}
          >
            {initials(businessName)}
          </div>
          <div className="min-w-0">
            <div
              className="font-display font-bold text-[16px] truncate"
              style={{ color: isSuccess ? '#fff' : 'var(--text-strong)' }}
            >
              {businessName}
            </div>
            {address && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} style={{ color: isSuccess ? 'rgba(255,255,255,.6)' : 'var(--text-subtle)' }} aria-hidden />
                <span className="text-[11px] truncate" style={{ color: isSuccess ? 'rgba(255,255,255,.75)' : 'var(--text-muted)' }}>
                  {address}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5">
        {court ? (
          <>
            <Row icon={<LayoutGrid size={13} />} label="Cancha" value={court.name} />
            <Row icon={<Activity size={13} />} label="Deporte" value={humanizeSport(court.sportType)} />
            {court.surface && <Row icon={<Layers size={13} />} label="Piso" value={court.surface} />}
            {startTime && endTime && <Row icon={<Clock size={13} />} label="Horario" value={`${startTime} – ${endTime} hs`} mono />}
            {court.pricePerHour != null && (
              <Row icon={<Banknote size={13} />} label="Precio" value={`${formatMoneyARS(court.pricePerHour)} /h`} mono last />
            )}
          </>
        ) : (
          <div className="py-7 text-center">
            <CalendarSearch size={38} className="mx-auto text-ink-200" aria-hidden />
            <p className="text-[13px] text-ink-400 mt-3 leading-relaxed">
              Elegí una cancha para ver el resumen de tu reserva.
            </p>
          </div>
        )}
      </div>

      <div
        className="px-5 pt-3 pb-4 flex flex-col gap-2.5 items-center"
        style={{ borderTop: court ? '1px solid var(--border-subtle)' : 'none' }}
      >
        <div className="flex items-center gap-1.5">
          <img src="/logo-mark.svg" width="11" height="11" alt="" />
          <span className="text-[10px] text-ink-400">Reserva segura con Book &amp; Play</span>
        </div>
      </div>
    </div>
  )
}
