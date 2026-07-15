import { type SelectHTMLAttributes, useId } from 'react'
import { cn } from '@/shared/utils/cn'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: string[] | { value: string; label: string }[]
  error?: string
  helperText?: string
}

export function Select({ label, options, error, helperText, className, id: propId, ...rest }: SelectProps) {
  const generatedId = useId()
  const id = propId ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-caption font-bold text-ink-700">
          {label}
          {rest.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={cn(
            'w-full appearance-none px-3.5 py-3 pr-9 rounded-md font-body text-body-sm text-ink-900',
            'bg-white border border-ink-200 outline-none cursor-pointer',
            'transition-colors duration-[120ms]',
            'focus:border-green-500 focus:ring-2 focus:ring-[rgba(31,194,116,0.2)]',
            error && 'border-red-500',
            rest.disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
          {...rest}
        >
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value
            const optLabel = typeof opt === 'string' ? opt : opt.label
            return (
              <option key={value} value={value}>
                {optLabel}
              </option>
            )
          })}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
        />
      </div>
      {error && <p className="text-caption text-red-500">{error}</p>}
      {helperText && !error && <p className="text-caption text-ink-500">{helperText}</p>}
    </div>
  )
}
