const ITEMS = [
  { label: 'Disponible', bg: 'var(--state-available-bg)', bd: 'var(--state-available-bd)' },
  { label: 'En espera', bg: 'var(--state-pending-bg)', bd: 'var(--state-pending-bd)' },
  { label: 'Reservado', bg: 'var(--red-50)', bd: 'var(--red-100)' },
  { label: 'Bloqueado', bg: 'var(--state-blocked-bg)', bd: 'var(--state-blocked-bd)' },
] as const

export function AvailabilityLegend() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-xs flex-none"
            style={{ background: item.bg, border: `1.5px solid ${item.bd}` }}
          />
          <span className="text-caption text-ink-500">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
