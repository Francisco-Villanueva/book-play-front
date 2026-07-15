import { useNavigate } from 'react-router-dom'
import { SearchX, Home, type LucideIcon } from 'lucide-react'
import { Button } from '@/shared/components/Button'

function IconRings({ icon: Icon, iconColor, bgClass, ringClass }: { icon: LucideIcon; iconColor: string; bgClass: string; ringClass: string }) {
  return (
    <div className="relative mx-auto mb-7 flex h-[108px] w-[108px] items-center justify-center">
      <div className={`absolute inset-0 rounded-full ${ringClass} opacity-25`} />
      <div className={`absolute inset-3.5 rounded-full ${ringClass} opacity-40`} />
      <div className={`absolute inset-6 flex items-center justify-center rounded-full ${bgClass}`}>
        <Icon size={36} className={iconColor} aria-hidden />
      </div>
    </div>
  )
}

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-25 px-6 py-10 text-center">
      <IconRings icon={SearchX} iconColor="text-blue-600" bgClass="bg-blue-50" ringClass="bg-blue-200" />
      <p className="mb-2 font-mono text-[52px] font-extrabold tracking-[-0.04em] text-ink-200">404</p>
      <h1 className="mb-2.5 font-display text-[26px] font-bold tracking-[-0.02em] text-ink-900">
        Página no encontrada
      </h1>
      <p className="mb-8 max-w-[380px] text-[15px] leading-[1.65] text-ink-500">
        El enlace puede estar roto o la página fue movida. Revisá la URL o volvé al inicio.
      </p>
      <Button leftIcon={<Home size={15} aria-hidden />} onClick={() => navigate('/dashboard')}>
        Ir al inicio
      </Button>
    </div>
  )
}
