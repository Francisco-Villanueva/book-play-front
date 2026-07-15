import { type ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'
import type { SlotState } from '@/shared/types/domain'

interface SlotChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  time: string
  state?: SlotState
  selected?: boolean
  price?: string
}

const stateStyles: Record<SlotState, { base: string; selected: string }> = {
  available: {
    base: 'bg-green-50 border-green-200 text-green-700',
    selected: 'bg-green-500 border-green-500 text-white shadow-brand',
  },
  pending: {
    base: 'bg-amber-50 border-amber-100 text-amber-700',
    selected: 'bg-green-500 border-green-500 text-white shadow-brand',
  },
  booked: {
    base: 'bg-red-50 border-red-100 text-red-700 line-through cursor-not-allowed',
    selected: 'bg-red-50 border-red-100 text-red-700 line-through cursor-not-allowed',
  },
  blocked: {
    base: 'bg-ink-50 border-ink-200 text-ink-500 opacity-70 cursor-not-allowed',
    selected: 'bg-ink-50 border-ink-200 text-ink-500 opacity-70 cursor-not-allowed',
  },
}

export function SlotChip({ time, state = 'available', selected = false, price, className, onClick, ...rest }: SlotChipProps) {
  const isDisabled = state === 'booked' || state === 'blocked'
  const isSelected = selected && !isDisabled
  const styles = stateStyles[state] ?? stateStyles.available

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-pressed={isSelected}
      onClick={isDisabled ? undefined : onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5',
        'min-w-[68px] px-3 rounded-md border-[1.5px]',
        'font-mono text-body-sm font-bold font-[tabular-nums]',
        'transition-all duration-[120ms] select-none',
        'active:scale-[0.94]',
        price ? 'h-14' : 'h-11',
        isSelected ? styles.selected : styles.base,
        className,
      )}
      {...rest}
    >
      <span>{time}</span>
      {price && (
        <span className="font-body text-overline font-semibold opacity-85">{price}</span>
      )}
    </button>
  )
}
