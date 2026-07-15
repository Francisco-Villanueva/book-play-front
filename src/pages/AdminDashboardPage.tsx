import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { SummaryKpis } from '@/features/admin/components/dashboard/SummaryKpis'
import { DashboardAgenda } from '@/features/admin/components/dashboard/DashboardAgenda'
import { AttentionPanel } from '@/features/admin/components/dashboard/AttentionPanel'
import { TrendChart } from '@/features/admin/components/dashboard/TrendChart'
import { computeKpis, computeTimeline, computeTrend, computeAttention } from '@/features/admin/components/dashboard/dashboardData'
import { useBookings } from '@/features/bookings/hooks/useBookings'
import { useCourts } from '@/features/courts/hooks/useCourts'
import { formatLongDateEs, timeToHours, todayISO } from '@/shared/utils/date'

export default function AdminDashboardPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const { data: bookings, isLoading, isError } = useBookings(businessId)
  const { data: courts } = useCourts(businessId)

  const today = todayISO()
  const list = useMemo(() => bookings ?? [], [bookings])
  const courtList = useMemo(() => courts ?? [], [courts])

  const kpis = useMemo(() => computeKpis(list, courtList, new Date()), [list, courtList])
  const timeline = useMemo(() => computeTimeline(list, courtList), [list, courtList])
  const trend = useMemo(() => computeTrend(list), [list])
  const attention = useMemo(() => computeAttention(list), [list])
  const nowHours = timeToHours(new Date().toTimeString().slice(0, 5))

  const goToAgenda = () => navigate(`/admin/${businessId}/agenda`)

  return (
    <AdminShell title="Resumen" subtitle={formatLongDateEs(today)}>
      <div className="h-full overflow-y-auto p-7 space-y-[18px]">
        {isError ? (
          <p className="text-body-sm text-red-600">No pudimos cargar los datos del panel.</p>
        ) : isLoading ? (
          <p className="text-body-sm text-ink-400 py-6 text-center">Cargando…</p>
        ) : (
          <>
            <SummaryKpis k={kpis} />

            <div className="grid gap-[18px] items-start grid-cols-1 xl:grid-cols-[1fr_360px]">
              <DashboardAgenda courts={timeline} nowHours={nowHours} onGoToAgenda={goToAgenda} />
              <div className="flex flex-col gap-[18px]">
                <AttentionPanel items={attention} onResolve={goToAgenda} />
                <TrendChart data={trend} />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  )
}
