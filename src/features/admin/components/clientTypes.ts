import type { Booking } from '@/shared/types/domain'
import { relativeDayLabel, todayISO } from '@/shared/utils/date'

// Ventana de historial sobre la que se arman los clientes. Sin esto la consulta
// recorrería todo el historial del complejo.
export const CLIENT_HISTORY_DAYS = 180

export interface ClientHistoryEntry {
  court: string
  date: string
  st: 'booked' | 'cancelled'
}

export interface Client {
  key: string
  name: string
  phone: string
  email: string
  total: number
  cancelled: number
  lastDate: string
  nextDate: string | null
  sport: string
  totalSpent: number
  history: ClientHistoryEntry[]
}

const SPORT_COLORS: Record<string, string> = {
  futbol5: 'var(--green-500)',
  padel: 'var(--blue-500)',
  tenis: 'var(--amber-500)',
  basquet: '#e05e3d',
}

export function sportColor(sport: string): string {
  const key = sport.toLowerCase().replace(/[^a-z0-9]/g, '')
  return SPORT_COLORS[key] ?? 'var(--green-500)'
}

// Los clientes no son una entidad del backend: se derivan agrupando reservas.
// Vive acá para que la tabla de escritorio y la lista mobile agrupen igual.
export function buildClients(bookings: Booking[]): Client[] {
  const groups = new Map<string, Booking[]>()
  for (const b of bookings) {
    const key = b.userId ?? b.guestPhone ?? b.guestEmail ?? b.guestName ?? b.id
    const arr = groups.get(key)
    if (arr) arr.push(b)
    else groups.set(key, [b])
  }

  const today = todayISO()

  return [...groups.entries()].map(([key, list]) => {
    const sorted = [...list].sort((a, b) => (a.date + a.startTime < b.date + b.startTime ? 1 : -1))
    const latest = sorted[0]!
    const upcoming = list
      .filter((b) => b.status === 'ACTIVE' && b.date >= today)
      .sort((a, b) => (a.date + a.startTime < b.date + b.startTime ? -1 : 1))[0]
    const sportCounts = new Map<string, number>()
    for (const b of list) {
      const s = b.court?.sportType ?? 'otro'
      sportCounts.set(s, (sportCounts.get(s) ?? 0) + 1)
    }
    const topSport = [...sportCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

    return {
      key,
      name: latest.guestName ?? latest.user?.name ?? 'Jugador',
      phone: latest.guestPhone ?? '—',
      email: latest.guestEmail ?? latest.user?.email ?? '—',
      total: list.length,
      cancelled: list.filter((b) => b.status === 'CANCELLED').length,
      lastDate: relativeDayLabel(latest.date),
      nextDate: upcoming ? `${relativeDayLabel(upcoming.date)} ${upcoming.startTime.slice(0, 5)}` : null,
      sport: topSport,
      totalSpent: list.filter((b) => b.status === 'ACTIVE').reduce((acc, b) => acc + (b.totalPrice ?? 0), 0),
      history: sorted.slice(0, 5).map((b) => ({
        court: b.court?.name ?? 'Cancha',
        date: `${relativeDayLabel(b.date)} ${b.startTime.slice(0, 5)}`,
        st: b.status === 'CANCELLED' ? ('cancelled' as const) : ('booked' as const),
      })),
    }
  })
}
