import { type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface BadgeProps {
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  dot?: boolean
  children: ReactNode
  className?: string
}

const toneStyles = {
  default: 'bg-ink-50 text-ink-600 border-ink-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-red-50 text-red-700 border-red-100',
  info: 'bg-blue-50 text-blue-600 border-blue-100',
}

const dotColors = {
  default: 'bg-ink-400',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
}

export function Badge({ tone = 'default', dot = false, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border',
        'text-caption font-semibold font-body',
        toneStyles[tone],
        className,
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-none', dotColors[tone])} />}
      {children}
    </span>
  )
}
