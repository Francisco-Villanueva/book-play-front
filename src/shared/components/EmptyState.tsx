import type { LucideIcon } from 'lucide-react'
import { Button } from '@/shared/components/Button'

interface EmptyStateAction {
  label: string
  onClick: () => void
  icon?: LucideIcon
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  /** `rings` = layered-circle illustration (search/generic). `dashed` = dashed-box illustration (empty collection). */
  variant?: 'rings' | 'dashed'
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  variant = 'rings',
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      {variant === 'rings' ? (
        <div className="relative mx-auto mb-7 flex h-[108px] w-[108px] items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-ink-100 opacity-25" />
          <div className="absolute inset-3.5 rounded-full bg-ink-100 opacity-40" />
          <div className="absolute inset-6 flex items-center justify-center rounded-full bg-ink-50">
            <Icon size={36} className="text-ink-400" aria-hidden />
          </div>
        </div>
      ) : (
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-ink-200 bg-ink-50">
          <Icon size={36} className="text-ink-400" aria-hidden />
        </div>
      )}
      <h2 className="mb-2 font-display text-[22px] font-bold tracking-[-0.02em] text-ink-900">
        {title}
      </h2>
      <p className="mb-6 max-w-[340px] text-[14px] leading-[1.65] text-ink-500">
        {description}
      </p>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap justify-center gap-2.5">
          {primaryAction && (
            <Button
              leftIcon={primaryAction.icon ? <primaryAction.icon size={15} aria-hidden /> : undefined}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              leftIcon={secondaryAction.icon ? <secondaryAction.icon size={15} aria-hidden /> : undefined}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
