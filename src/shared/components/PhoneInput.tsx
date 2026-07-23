import { useId } from 'react'
import BasePhoneInput from 'react-phone-number-input/input'
import { cn } from '@/shared/utils/cn'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: (() => void) | undefined
  label?: string | undefined
  helperText?: string | undefined
  error?: string | undefined
  required?: boolean | undefined
  id?: string | undefined
}

export function PhoneInput({
  value, onChange, onBlur, label, helperText, error, required, id: propId,
}: PhoneInputProps) {
  const generatedId = useId()
  const id = propId ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-caption font-bold text-ink-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <BasePhoneInput
        id={id}
        country="AR"
        international
        withCountryCallingCode
        placeholder="+54 9 11 1234-5678"
        autoComplete="tel"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onBlur={onBlur}
        aria-required={required}
        className={cn(
          'w-full px-3.5 py-3 rounded-md font-body text-body-sm text-ink-900',
          'bg-white border border-ink-200 outline-none',
          'transition-colors duration-[120ms] placeholder:text-ink-400',
          'focus:border-green-500 focus:ring-2 focus:ring-[rgba(31,194,116,0.2)]',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
        )}
      />
      {error && <p className="text-caption text-red-500">{error}</p>}
      {helperText && !error && <p className="text-caption text-ink-500">{helperText}</p>}
    </div>
  )
}
