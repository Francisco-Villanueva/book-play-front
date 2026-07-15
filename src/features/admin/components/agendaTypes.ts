export const SLOT_H = 64
export const HOUR_START = 8
export const HOUR_END = 23
export const TOTAL_H = (HOUR_END - HOUR_START) * SLOT_H

export function nowHour(): number {
  const d = new Date()
  return d.getHours() + d.getMinutes() / 60
}

export function hFmt(h: number) {
  const hr = Math.floor(h)
  const mn = Math.round((h % 1) * 60)
  return `${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}`
}

export function toY(h: number) {
  return (h - HOUR_START) * SLOT_H
}

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
}

export function durationLabel(start: number, end: number) {
  const d = end - start
  const parts = [d >= 1 ? `${Math.floor(d)}h` : '', d % 1 > 0 ? `${Math.round((d % 1) * 60)}min` : '']
  return parts.filter(Boolean).join(' ')
}

export interface AgendaCourt {
  id: string
  name: string
  sport: string
  color: string
}

// Real bookings only ever have status ACTIVE (rendered as 'booked') — 'pending' and
// 'blocked' remain part of the type so AgendaBookingBlock/AgendaDetailPanel keep their
// generic rendering branches, but nothing in the wired app produces them anymore.
export type BookingStatus = 'booked' | 'pending' | 'blocked'

export interface AgendaBooking {
  id: string
  cid: string
  s: number
  e: number
  name: string
  ph?: string | undefined
  note?: string | undefined
  st: BookingStatus
  p?: string | undefined
}

export const STATUS_META: Record<BookingStatus, { bg: string; bd: string; fg: string; label: string }> = {
  booked: { bg: 'var(--state-booked-bg)', bd: 'var(--state-booked-bd)', fg: 'var(--state-booked-fg)', label: 'Ocupado' },
  pending: { bg: 'var(--state-pending-bg)', bd: 'var(--state-pending-bd)', fg: 'var(--state-pending-fg)', label: 'En espera' },
  blocked: { bg: 'var(--state-blocked-bg)', bd: 'var(--state-blocked-bd)', fg: 'var(--state-blocked-fg)', label: 'Bloqueado' },
}

export interface BookingPrefill {
  cid?: string
  startH?: number
}
