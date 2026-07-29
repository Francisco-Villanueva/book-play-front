import type { AvailabilityRule } from '@/shared/types/domain'

export interface RuleGroup {
  key: string
  ruleIds: string[]
  days: number[]
  from: string
  to: string
}

// Las reglas se guardan una por día; para mostrarlas se agrupan por franja
// horaria ("Lun a Vie 08:00–23:00" en vez de cinco filas iguales).
export function groupRules(rules: AvailabilityRule[]): RuleGroup[] {
  const map = new Map<string, RuleGroup>()
  for (const r of rules) {
    const key = `${r.startTime.slice(0, 5)}-${r.endTime.slice(0, 5)}`
    const existing = map.get(key)
    if (existing) {
      existing.ruleIds.push(r.id)
      existing.days.push(r.dayOfWeek)
    } else {
      map.set(key, {
        key,
        ruleIds: [r.id],
        days: [r.dayOfWeek],
        from: r.startTime.slice(0, 5),
        to: r.endTime.slice(0, 5),
      })
    }
  }
  return [...map.values()]
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// "Lun a Vie" cuando los días son consecutivos, la lista suelta cuando no.
export function formatDays(days: number[]): string {
  const sorted = [...new Set(days)].sort((a, b) => a - b)
  if (sorted.length === 0) return '—'
  if (sorted.length === 7) return 'Todos los días'

  const consecutive = sorted.every((d, i) => i === 0 || d === (sorted[i - 1] ?? d) + 1)
  if (consecutive && sorted.length > 2) {
    return `${DAY_NAMES[sorted[0]!]} a ${DAY_NAMES[sorted[sorted.length - 1]!]}`
  }
  return sorted.map((d) => DAY_NAMES[d]).join(' · ')
}
