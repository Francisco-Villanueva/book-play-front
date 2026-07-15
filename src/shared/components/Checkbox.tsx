import { type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn('flex items-center gap-2.5 cursor-pointer', rest.disabled && 'opacity-50 cursor-not-allowed', className)}>
      <div className="relative flex-none w-5 h-5">
        <input type="checkbox" className="sr-only peer" {...rest} />
        <div className="w-5 h-5 rounded-xs border-[1.5px] border-ink-300 bg-white peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors duration-[120ms]" />
        <Check
          size={13}
          strokeWidth={2.5}
          className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-[120ms] pointer-events-none"
        />
      </div>
      {label && <span className="text-body-sm text-ink-700">{label}</span>}
    </label>
  )
}
