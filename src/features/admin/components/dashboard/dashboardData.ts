import { timeToHours, todayISO, addDaysISO, formatShortDay } from '@/shared/utils/date'
import { courtColor } from '@/features/admin/components/courtTypes'
import type { Booking, Court } from '@/shared/types/domain'

export const DAY_START = 8
export const DAY_END = 23
export const DAY_SPAN = DAY_END - DAY_START

export interface DashboardKpis {
  todayActive: number
  cancelled: number
  occPct: number
  bookedHours: number
  activeCourts: number
  revenue: number
  revenueDelta: number | null
  revenueAvg: number
  next: { time: string; court: string; client: string; inMin: number } | null
}

export interface TimelineBooking {
  id: string
  start: number
  end: number
  client: string
}

export interface TimelineCourt {
  id: string
  name: string
  sport: string
  dot: string
  bookings: TimelineBooking[]
}

export interface TrendPoint {
  label: string
  res: number
  ing: number
}

export interface AttentionItem {
  id: string
  title: string
  desc: string
}

function bookingClient(b: Booking): string {
  return b.guestName ?? b.user?.name ?? 'Jugador'
}

function isActiveOn(b: Booking, date: string): boolean {
  return b.date === date && b.status === 'ACTIVE'
}

function revenueOn(bookings: Booking[], date: string): number {
  return bookings
    .filter((b) => isActiveOn(b, date))
    .reduce((acc, b) => acc + (b.totalPrice ?? 0), 0)
}

export function computeKpis(bookings: Booking[], courts: Court[], now: Date): DashboardKpis {
  const today = todayISO()
  const nowHM = now.toTimeString().slice(0, 5)
  const nowHours = timeToHours(nowHM)

  const todayActive = bookings.filter((b) => isActiveOn(b, today))
  const cancelled = bookings.filter((b) => b.date === today && b.status === 'CANCELLED').length
  const activeCourts = courts.filter((c) => c.isActive).length

  const bookedHours = todayActive.reduce(
    (acc, b) => acc + (timeToHours(b.endTime) - timeToHours(b.startTime)),
    0,
  )
  const courtHours = activeCourts * DAY_SPAN
  const occPct = courtHours > 0 ? Math.min(100, Math.round((bookedHours / courtHours) * 100)) : 0

  const revenue = revenueOn(bookings, today)
  let baselineSum = 0
  for (let d = 1; d <= 7; d += 1) baselineSum += revenueOn(bookings, addDaysISO(today, -d))
  const revenueAvg = Math.round(baselineSum / 7)
  const revenueDelta = revenueAvg > 0 ? Math.round(((revenue - revenueAvg) / revenueAvg) * 100) : null

  const upcoming = todayActive
    .filter((b) => timeToHours(b.startTime) >= nowHours)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  const nextBooking = upcoming[0]
  const next = nextBooking
    ? {
        time: nextBooking.startTime.slice(0, 5),
        court: nextBooking.court?.name ?? 'Cancha',
        client: bookingClient(nextBooking),
        inMin: Math.max(0, Math.round((timeToHours(nextBooking.startTime) - nowHours) * 60)),
      }
    : null

  return { todayActive: todayActive.length, cancelled, occPct, bookedHours, activeCourts, revenue, revenueDelta, revenueAvg, next }
}

export function computeTimeline(bookings: Booking[], courts: Court[]): TimelineCourt[] {
  const today = todayISO()
  return courts
    .filter((c) => c.isActive)
    .map((c) => ({
      id: c.id,
      name: c.name,
      sport: c.sportType ?? '—',
      dot: courtColor(c.sportType),
      bookings: bookings
        .filter((b) => b.courtId === c.id && isActiveOn(b, today))
        .map((b) => ({
          id: b.id,
          start: timeToHours(b.startTime),
          end: timeToHours(b.endTime),
          client: bookingClient(b),
        })),
    }))
}

export function computeTrend(bookings: Booking[]): TrendPoint[] {
  const today = todayISO()
  const points: TrendPoint[] = []
  for (let d = 6; d >= 0; d -= 1) {
    const iso = addDaysISO(today, -d)
    const dayActive = bookings.filter((b) => isActiveOn(b, iso))
    points.push({
      label: formatShortDay(iso).weekday,
      res: dayActive.length,
      ing: dayActive.reduce((acc, b) => acc + (b.totalPrice ?? 0), 0),
    })
  }
  return points
}

export function computeAttention(bookings: Booking[]): AttentionItem[] {
  const today = todayISO()
  return bookings
    .filter((b) => b.date === today && b.status === 'CANCELLED')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 4)
    .map((b) => ({
      id: b.id,
      title: 'Reserva cancelada sin reprogramar',
      desc: `${b.court?.name ?? 'Cancha'} · ${b.startTime.slice(0, 5)} · ${bookingClient(b)}`,
    }))
}
