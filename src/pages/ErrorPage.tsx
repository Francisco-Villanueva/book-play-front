import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RefreshCw, ArrowLeft, type LucideIcon } from 'lucide-react'
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

export default function ErrorPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-25 px-6 py-10 text-center">
      <IconRings icon={AlertTriangle} iconColor="text-red-600" bgClass="bg-red-50" ringClass="bg-red-100" />
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-red-600">Algo salió mal</p>
      <h1 className="mb-2.5 font-display text-[26px] font-bold tracking-[-0.02em] text-ink-900">
        Ocurrió un error inesperado
      </h1>
      <p className="mb-8 max-w-[380px] text-[15px] leading-[1.65] text-ink-500">
        No pudimos procesar tu solicitud. Ya lo registramos y estamos trabajando en solucionarlo. Por favor, intentá de nuevo en unos minutos.
      </p>
      <div className="flex justify-center gap-2.5">
        <Button variant="outline" leftIcon={<RefreshCw size={15} aria-hidden />} onClick={() => window.location.reload()}>
          Reintentar
        </Button>
        <Button leftIcon={<ArrowLeft size={15} aria-hidden />} onClick={() => navigate('/dashboard')}>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
