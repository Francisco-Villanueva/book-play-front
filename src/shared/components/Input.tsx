import { type InputHTMLAttributes, useId } from 'react'
import { cn } from '@/shared/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string | undefined
  error?: string | undefined
}

export function Input({ label, helperText, error, className, id: propId, ...rest }: InputProps) {
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
      <input
        id={id}
        className={cn(
          'w-full px-3.5 py-3 rounded-md font-body text-body-sm text-ink-900',
          'bg-white border border-ink-200 outline-none',
          'transition-colors duration-[120ms] placeholder:text-ink-400',
          'focus:border-green-500 focus:ring-2 focus:ring-[rgba(31,194,116,0.2)]',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
          rest.disabled && 'opacity-50 cursor-not-allowed bg-ink-50',
          className,
        )}
        {...rest}
      />
      {error && <p className="text-caption text-red-500">{error}</p>}
      {helperText && !error && <p className="text-caption text-ink-500">{helperText}</p>}
    </div>
  )
}
