import { useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft, MessageCircle, type LucideIcon } from 'lucide-react'
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

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-25 px-6 py-10 text-center">
      <IconRings icon={Lock} iconColor="text-amber-600" bgClass="bg-amber-50" ringClass="bg-amber-200" />
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-amber-600">Sin acceso</p>
      <h1 className="mb-2.5 font-display text-[28px] font-bold tracking-[-0.02em] text-ink-900">
        No tenés permiso para ver esto
      </h1>
      <p className="mb-8 max-w-[400px] text-[15px] leading-[1.65] text-ink-500">
        Esta sección es solo para encargados y propietarios del complejo. Si creés que es un error, contactá al administrador.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <Button variant="outline" leftIcon={<ArrowLeft size={15} aria-hidden />} onClick={() => navigate(-1)}>
          Volver atrás
        </Button>
        <Button leftIcon={<MessageCircle size={15} aria-hidden />}>
          Contactar soporte
        </Button>
      </div>
    </div>
  )
}
