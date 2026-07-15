import { cn } from '@/shared/utils/cn'

interface SegmentedControlProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  full?: boolean
  className?: string
}

export function SegmentedControl({ options, value, onChange, full = false, className }: SegmentedControlProps) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex items-center bg-ink-50 border border-ink-100 rounded-md p-1 gap-1',
        full && 'w-full',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={cn(
              'flex-1 px-3 py-1.5 rounded-sm text-body-sm font-semibold font-body',
              'transition-all duration-[120ms] cursor-pointer whitespace-nowrap',
              active
                ? 'bg-white text-ink-900 shadow-xs'
                : 'text-ink-500 hover:text-ink-700',
            )}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
