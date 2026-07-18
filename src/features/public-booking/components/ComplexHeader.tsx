import { ChevronLeft, MapPin } from 'lucide-react'
import { initials } from '../lib'

interface ComplexHeaderProps {
  name: string
  address?: string | null | undefined
  isLoading?: boolean
  onBack?: () => void
}

export function ComplexHeader({ name, address, isLoading, onBack }: ComplexHeaderProps) {
  return (
    <div className="flex-none px-4 pt-3 pb-3 bg-white border-b border-ink-100">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="border-none bg-transparent cursor-pointer p-1 -ml-1 flex-none"
            aria-label="Volver"
          >
            <ChevronLeft size={20} className="text-ink-700" />
          </button>
        )}
        <div
          className="w-[46px] h-[46px] rounded-lg flex-none bg-green-500 text-white flex items-center justify-center font-display font-extrabold text-[17px]"
          aria-hidden
        >
          {isLoading ? '·' : initials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-[19px] text-ink-900 tracking-tight truncate">
            {isLoading ? 'Cargando…' : name}
          </div>
          {address && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-ink-400 flex-none" aria-hidden />
              <span className="text-[12px] text-ink-500 truncate">{address}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink-50 border border-ink-100 flex-none">
          <img src="/logo-mark.svg" width="13" height="13" alt="" />
          <span className="text-[10px] font-bold text-ink-400 tracking-wide">BOOK &amp; PLAY</span>
        </div>
      </div>
    </div>
  )
}

interface StepHeaderProps {
  title: string
  subtitle?: string
  onBack: () => void
}

export function StepHeader({ title, subtitle, onBack }: StepHeaderProps) {
  return (
    <div className="flex-none flex items-center gap-2.5 px-4 py-2.5 bg-white">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center w-9 h-9 rounded-md flex-none border-[1.5px] border-ink-200 bg-ink-50 cursor-pointer text-ink-700"
        aria-label="Volver"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-bold text-[20px] text-ink-900 tracking-tight truncate m-0">{title}</h1>
        {subtitle && <p className="text-[12px] text-ink-500 truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
