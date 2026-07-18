import { addDaysISO, formatLongDateEs, todayISO } from '@/shared/utils/date'
import type { Court } from '@/shared/types/domain'

export const NEXT_DAYS = Array.from({ length: 7 }, (_, i) => addDaysISO(todayISO(), i))

export function humanizeSport(s?: string | null): string {
  if (!s) return 'Cancha'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Presentational only: a stable accent color per sport, mirroring the design.
export function courtColor(sportType?: string | null): string {
  const s = (sportType ?? '').toLowerCase()
  if (s.includes('pádel') || s.includes('padel')) return 'var(--blue-500)'
  if (s.includes('tenis')) return 'var(--amber-500)'
  if (s.includes('básquet') || s.includes('basquet') || s.includes('basket')) return 'var(--red-500)'
  return 'var(--green-500)'
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '·'
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

// Build a downloadable .ics blob URL for the booking.
export function buildIcsUrl(params: {
  courtName: string
  businessName: string
  address?: string | null | undefined
  date: string
  startTime: string
  endTime: string
  ref: string
}): string {
  const { courtName, businessName, address, date, startTime, endTime, ref } = params
  const [y, m, d] = date.split('-').map(Number)
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const stamp = (hh = 0, mm = 0) =>
    `${y}${pad(m ?? 1)}${pad(d ?? 1)}T${pad(hh)}${pad(mm)}00`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Book & Play//Reserva//ES',
    'BEGIN:VEVENT',
    `UID:${ref}@bookandplay`,
    `SUMMARY:${courtName} · ${businessName}`,
    `DTSTART:${stamp(sh, sm)}`,
    `DTEND:${stamp(eh, em)}`,
    address ? `LOCATION:${address.replace(/,/g, '\\,')}` : '',
    `DESCRIPTION:Reserva ${ref} en ${businessName}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`
}

export async function shareBooking(params: {
  courtName: string
  businessName: string
  date: string
  startTime: string
  endTime: string
}): Promise<'shared' | 'copied' | 'unsupported'> {
  const { courtName, businessName, date, startTime, endTime } = params
  const text = `Reservé ${courtName} en ${businessName} para el ${formatLongDateEs(date)}, ${startTime}–${endTime} hs.`
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: 'Mi reserva', text })
      return 'shared'
    } catch {
      return 'unsupported'
    }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return 'copied'
    } catch {
      return 'unsupported'
    }
  }
  return 'unsupported'
}

export function courtSports(courts: Court[]): string[] {
  return [...new Set(courts.map((c) => c.sportType).filter(Boolean) as string[])]
}
