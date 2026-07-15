import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles = {
  primary: 'bg-green-500 text-white border border-transparent shadow-brand hover:bg-green-600 active:scale-[0.97]',
  secondary: 'bg-white text-ink-900 border border-ink-200 shadow-xs hover:bg-ink-50 active:scale-[0.97]',
  ghost: 'bg-transparent text-ink-700 border border-transparent hover:bg-ink-50 active:scale-[0.97]',
  soft: 'bg-green-50 text-green-700 border border-transparent hover:bg-green-100 active:scale-[0.97]',
  danger: 'bg-red-500 text-white border border-transparent hover:bg-red-600 active:scale-[0.97]',
  outline: 'bg-white text-ink-700 border border-ink-200 shadow-xs hover:bg-ink-50 active:scale-[0.97]',
}

const sizeStyles = {
  sm: 'h-9 px-3.5 text-body-sm gap-1.5 rounded-sm',
  md: 'h-11 px-[18px] text-body gap-2 rounded-md',
  lg: 'h-[52px] px-6 text-body-lg gap-2.5 rounded-md',
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-semibold font-body leading-none tracking-tight',
        'transition-all duration-[120ms] cursor-pointer select-none whitespace-nowrap',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variantStyles[variant],
        sizeStyles[size],
        full && 'w-full',
        className,
      )}
      {...rest}
    >
      {leftIcon && <span className="inline-flex flex-none">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="inline-flex flex-none">{rightIcon}</span>}
    </button>
  )
}
