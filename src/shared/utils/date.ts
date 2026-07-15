const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const WEEKDAYS_LONG = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
]

export function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]!
}

export function dayOfWeek(iso: string): number {
  return new Date(iso + 'T12:00:00').getDay()
}

export function formatShortDay(iso: string): { weekday: string; day: string } {
  const d = new Date(iso + 'T12:00:00')
  return { weekday: WEEKDAYS_SHORT[d.getDay()]!, day: String(d.getDate()) }
}

export function formatLongDateEs(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return `${WEEKDAYS_LONG[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`
}

export function relativeDayLabel(iso: string): string {
  const today = todayISO()
  if (iso === today) return 'Hoy'
  if (iso === addDaysISO(today, 1)) return 'Mañana'
  if (iso === addDaysISO(today, -1)) return 'Ayer'
  const { weekday, day } = formatShortDay(iso)
  return `${weekday} ${day}`
}

export function timeToHours(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return h + m / 60
}

export function formatMoneyARS(n: number): string {
  return `$${Math.round(n).toLocaleString('es-AR')}`
}
