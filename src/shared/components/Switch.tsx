import { type InputHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export function Switch({ label, description, className, ...rest }: SwitchProps) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', rest.disabled && 'opacity-50 cursor-not-allowed', className)}>
      <div className="relative flex-none">
        <input type="checkbox" className="sr-only peer" {...rest} />
        <div className="w-11 h-6 bg-ink-200 rounded-full peer-checked:bg-green-500 transition-colors duration-[180ms]" />
        <div
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm',
            'transition-transform duration-[180ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            'peer-checked:translate-x-5',
          )}
        />
      </div>
      {(label ?? description) ? (
        <div>
          {label && <p className="text-body-sm font-semibold text-ink-900">{label}</p>}
          {description && <p className="text-caption text-ink-500">{description}</p>}
        </div>
      ) : null}
    </label>
  )
}
