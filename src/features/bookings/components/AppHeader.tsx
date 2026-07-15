import { type ReactNode } from 'react'

interface AppHeaderProps {
  title: string
  sub?: string
  left?: ReactNode
  right?: ReactNode
}

export function AppHeader({ title, sub, left, right }: AppHeaderProps) {
  return (
    <header
      className="flex-none flex items-center gap-3 bg-white border-b border-ink-100 px-4"
      style={{ height: 'var(--header-h)' }}
    >
      {left && <div className="flex-none">{left}</div>}
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-bold text-h4 text-ink-900 tracking-tight leading-none truncate">{title}</h1>
        {sub && <p className="text-caption text-ink-500 mt-0.5 truncate">{sub}</p>}
      </div>
      {right && <div className="flex-none">{right}</div>}
    </header>
  )
}
