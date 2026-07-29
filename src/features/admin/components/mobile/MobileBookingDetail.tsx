import { Banknote, CheckCircle2, Clock, MapPin, MessageCircle, Phone, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatMoneyARS } from '@/shared/utils/date'
import { durationLabel, hFmt, initials, PAYMENT_META } from '../reservationTypes'
import type { AgendaCourt } from '../agendaTypes'
import { Sheet } from './Sheet'
import { cellStateOf, telHref, whatsappHref, type MobileBooking } from './mobileTypes'

interface MobileBookingDetailProps {
  booking: MobileBooking
  court: AgendaCourt | undefined
  onClose: () => void
  onCancel: () => void
  onCollect: () => void
  onUnblock: () => void
}

export function MobileBookingDetail({
  booking, court, onClose, onCancel, onCollect, onUnblock,
}: MobileBookingDetailProps) {
  const state = cellStateOf(booking)
  const isBlocked = booking.st === 'blocked'
  const payment = booking.paymentStatus ? PAYMENT_META[booking.paymentStatus] : null
  const isPaid = booking.paymentStatus === 'PAID'

  return (
    <Sheet onClose={onClose} snap="mid" ariaLabel={`Reserva de ${booking.name}`}>
      <div className="flex items-center gap-3.5 mb-4">
        <span
          className="w-[52px] h-[52px] flex-none rounded-lg text-white flex items-center justify-center font-display font-bold text-[18px]"
          style={{ background: isBlocked ? 'var(--ink-300)' : court?.color ?? 'var(--ink-400)' }}
        >
          {initials(booking.name)}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-[22px] tracking-tight text-ink-900 truncate">
            {booking.name}
          </h2>
          {booking.ph && (
            <p className="tnum font-mono text-caption text-ink-500 mt-0.5">{booking.ph}</p>
          )}
        </div>
        <span
          className="flex-none inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
          style={{ background: state.bg, borderColor: state.bd }}
        >
          <span className="w-[7px] h-[7px] rounded-full" style={{ background: state.dot }} />
          <span className="text-[12px] font-bold" style={{ color: state.fg }}>{state.label}</span>
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        <Tile
          icon={Clock}
          value={`${hFmt(booking.s)}–${hFmt(booking.e)}`}
          hint={durationLabel(booking.s, booking.e)}
          mono
        />
        <Tile icon={MapPin} value={court?.name ?? 'Cancha'} hint={court?.sport ?? '—'} />
        {booking.price != null && (
          <Tile
            icon={Banknote}
            value={formatMoneyARS(booking.price)}
            hint={payment?.short ?? 'A cobrar'}
            hintColor={isPaid ? 'var(--green-600)' : undefined}
            mono
          />
        )}
      </div>

      {booking.playersPaid != null && booking.totalPlayers != null && (
        <p className="text-caption text-ink-500 mb-4">
          Pagaron {booking.playersPaid} de {booking.totalPlayers} jugadores.
        </p>
      )}

      {booking.note && (
        <p className="px-3 py-2.5 bg-ink-50 rounded-md mb-4 text-caption text-ink-700">
          <span className="font-bold text-ink-400">Nota · </span>
          {booking.note}
        </p>
      )}

      {!isBlocked && (
        <div className="flex border-y border-ink-100 py-1.5 mb-3.5">
          <ActionLink
            icon={Phone}
            label="Llamar"
            href={booking.ph ? telHref(booking.ph) : null}
          />
          <ActionLink
            icon={MessageCircle}
            label="WhatsApp"
            href={booking.ph ? whatsappHref(booking.ph) : null}
          />
          {isPaid ? (
            <ActionButton icon={CheckCircle2} label="Cobrado" muted onClick={onCollect} />
          ) : (
            <ActionButton icon={Wallet} label="Cobrar" onClick={onCollect} />
          )}
        </div>
      )}

      <button
        type="button"
        onClick={isBlocked ? onUnblock : onCancel}
        data-testid="mobile-booking-destructive"
        className="w-full h-12 rounded-md border-[1.5px] border-ink-200 bg-white cursor-pointer font-body font-bold text-body-sm"
        style={{ color: isBlocked ? 'var(--text-body)' : 'var(--red-600)' }}
      >
        {isBlocked ? 'Quitar bloqueo' : 'Cancelar reserva'}
      </button>
    </Sheet>
  )
}

interface TileProps {
  icon: LucideIcon
  value: string
  hint: string
  hintColor?: string | undefined
  mono?: boolean
}

function Tile({ icon: Icon, value, hint, hintColor, mono = false }: TileProps) {
  return (
    <div className="flex-1 min-w-0 px-2 py-2.5 bg-ink-50 rounded-md">
      <Icon size={15} className="text-ink-400" aria-hidden />
      <div
        className={`${mono ? 'tnum font-mono text-[12.5px] tracking-tight' : 'font-body text-caption'} font-bold text-ink-900 mt-1.5 truncate`}
      >
        {value}
      </div>
      <div className="text-[11px] mt-px truncate" style={{ color: hintColor ?? 'var(--text-muted)' }}>
        {hint}
      </div>
    </div>
  )
}

const actionClass =
  'flex-1 flex flex-col items-center gap-1.5 py-1 border-none bg-transparent cursor-pointer no-underline min-h-[44px]'

function ActionLink({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string | null }) {
  if (!href) {
    return (
      <span className={`${actionClass} opacity-40`} aria-disabled>
        <span className="w-11 h-11 rounded-full bg-ink-50 flex items-center justify-center">
          <Icon size={21} className="text-ink-400" aria-hidden />
        </span>
        <span className="text-[12px] font-bold text-ink-700">{label}</span>
      </span>
    )
  }
  return (
    <a href={href} className={actionClass}>
      <span className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center">
        <Icon size={21} className="text-green-700" aria-hidden />
      </span>
      <span className="text-[12px] font-bold text-ink-700">{label}</span>
    </a>
  )
}

interface ActionButtonProps {
  icon: LucideIcon
  label: string
  onClick: () => void
  muted?: boolean
}

function ActionButton({ icon: Icon, label, onClick, muted = false }: ActionButtonProps) {
  return (
    <button type="button" onClick={onClick} className={actionClass}>
      <span
        className={`w-11 h-11 rounded-full flex items-center justify-center ${muted ? 'bg-ink-50' : 'bg-green-50'}`}
      >
        <Icon size={21} className={muted ? 'text-ink-400' : 'text-green-700'} aria-hidden />
      </span>
      <span className="text-[12px] font-bold text-ink-700">{label}</span>
    </button>
  )
}
