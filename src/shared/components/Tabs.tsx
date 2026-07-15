import { type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface Tab {
  key: string
  label: string
  icon?: ReactNode
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex border-b border-ink-100', className)}>
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-3 text-body-sm font-semibold font-body',
              'border-b-2 -mb-px transition-colors duration-[120ms] cursor-pointer',
              isActive
                ? 'border-green-500 text-green-700'
                : 'border-transparent text-ink-500 hover:text-ink-700',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold',
                  isActive ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-500',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
