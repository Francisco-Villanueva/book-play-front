export type { Court } from '@/shared/types/domain'

const SPORT_COLORS: Record<string, string> = {
  futbol5: 'var(--green-500)',
  padel: 'var(--blue-500)',
  tenis: 'var(--amber-500)',
  basquet: '#e05e3d',
}

export function courtColor(sportType?: string): string {
  const key = (sportType ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  return SPORT_COLORS[key] ?? 'var(--ink-400)'
}
