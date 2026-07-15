import { type ReactNode } from 'react'
import { ArrowUpRight, ArrowDownRight, Ticket, Gauge, Banknote, Clock } from 'lucide-react'
import { formatMoneyARS } from '@/shared/utils/date'
import type { DashboardKpis } from './dashboardData'

function KpiShell({ icon, corner, children }: { icon: ReactNode; corner?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex-1 min-w-0 bg-white border border-ink-100 rounded-lg p-[18px] shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="w-[38px] h-[38px] rounded-md bg-ink-50 flex items-center justify-center text-ink-700 flex-none">
          {icon}
        </span>
        {corner}
      </div>
      {children}
    </div>
  )
}

function BigValue({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display font-bold text-[28px] text-ink-900 tracking-tight leading-none">{value}</p>
      <p className="text-caption text-ink-500 mt-0.5">{label}</p>
    </div>
  )
}

export function SummaryKpis({ k }: { k: DashboardKpis }) {
  const revenueUp = k.revenueDelta != null && k.revenueDelta >= 0

  return (
    <div className="flex gap-4">
      <KpiShell icon={<Ticket size={19} aria-hidden />}>
        <BigValue value={String(k.todayActive)} label="Reservas hoy" />
        {k.todayActive > 0 || k.cancelled > 0 ? (
          <div className="flex gap-3.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-500">
              <span className="w-[7px] h-[7px] rounded-full flex-none bg-green-500" />
              <span className="font-mono font-bold text-ink-700">{k.todayActive}</span> Confirmadas
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-500">
              <span className="w-[7px] h-[7px] rounded-full flex-none bg-red-500" />
              <span className="font-mono font-bold text-ink-700">{k.cancelled}</span> Canceladas
            </span>
          </div>
        ) : (
          <p className="text-[12px] text-ink-400">Sin reservas todavía hoy</p>
        )}
      </KpiShell>

      <KpiShell icon={<Gauge size={19} aria-hidden />}>
        <BigValue value={`${k.occPct}%`} label="Ocupación del día" />
        <div>
          <div className="h-1.5 rounded-full bg-ink-50 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${k.occPct}%` }} />
          </div>
          <p className="text-[12px] text-ink-500 mt-1.5">
            {Math.round(k.bookedHours)} h reservadas · {k.activeCourts} canchas activas
          </p>
        </div>
      </KpiShell>

      <KpiShell
        icon={<Banknote size={19} aria-hidden />}
        corner={
          k.revenueDelta != null ? (
            <span className={`inline-flex items-center gap-0.5 text-[12px] font-bold ${revenueUp ? 'text-green-600' : 'text-red-500'}`}>
              {revenueUp ? <ArrowUpRight size={13} aria-hidden /> : <ArrowDownRight size={13} aria-hidden />}
              {Math.abs(k.revenueDelta)}%
            </span>
          ) : undefined
        }
      >
        <BigValue value={formatMoneyARS(k.revenue)} label="Ingresos del día" />
        <p className="text-[12px] text-ink-400">
          {k.revenueDelta != null ? `vs. promedio semanal (${formatMoneyARS(k.revenueAvg)})` : 'Todavía no hay ingresos hoy'}
        </p>
      </KpiShell>

      <KpiShell
        icon={<Clock size={19} aria-hidden />}
        corner={k.next ? <span className="text-[11px] font-bold text-ink-400">en {k.next.inMin} min</span> : undefined}
      >
        <BigValue value={k.next?.time ?? '—'} label="Próximo turno" />
        <p className="text-[12px] text-ink-400 truncate">
          {k.next ? `${k.next.court} · ${k.next.client}` : 'No hay más turnos por hoy'}
        </p>
      </KpiShell>
    </div>
  )
}
