import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'outline' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variantStyles = {
  ghost: 'bg-transparent hover:bg-ink-50 border-transparent',
  outline: 'bg-white hover:bg-ink-50 border-ink-200 shadow-xs',
  soft: 'bg-green-50 hover:bg-green-100 border-transparent text-green-700',
}

const sizeStyles = {
  sm: 'w-8 h-8 rounded-sm',
  md: 'w-10 h-10 rounded-md',
  lg: 'w-12 h-12 rounded-lg',
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  children,
  className,
  disabled,
  ...rest
}: IconButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center border text-ink-700',
        'transition-all duration-[120ms] cursor-pointer',
        'active:scale-[0.92] disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
