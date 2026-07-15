import { type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  interactive?: boolean
}

export function Card({ children, className, onClick, interactive = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        'bg-white border border-ink-100 rounded-lg shadow-sm',
        interactive && 'cursor-pointer transition-all duration-[180ms] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]',
        className,
      )}
    >
      {children}
    </div>
  )
}
