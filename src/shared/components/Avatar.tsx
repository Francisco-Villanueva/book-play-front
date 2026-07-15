import { cn } from '@/shared/utils/cn'

interface AvatarProps {
  name: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-caption',
  md: 'w-10 h-10 text-body-sm',
  lg: 'w-12 h-12 text-body',
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

function colorFromName(name: string) {
  const colors = [
    'bg-green-500', 'bg-blue-500', 'bg-amber-500',
    'bg-red-500', 'bg-ink-500', 'bg-green-700',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx] ?? 'bg-green-500'
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover flex-none', sizeStyles[size], className)}
      />
    )
  }

  return (
    <span
      className={cn(
        'rounded-full flex-none flex items-center justify-center text-white font-bold font-body select-none',
        colorFromName(name),
        sizeStyles[size],
        className,
      )}
      aria-label={name}
    >
      {initials(name)}
    </span>
  )
}
