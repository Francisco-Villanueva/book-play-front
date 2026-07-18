import { useMemo, useState } from 'react'
import { CalendarPlus, Check, Share2 } from 'lucide-react'
import { formatLongDateEs } from '@/shared/utils/date'
import type { Court } from '@/shared/types/domain'
import { buildIcsUrl, humanizeSport, shareBooking } from '../lib'
import type { Player } from '../types'

interface SuccessViewProps {
  court: Court
  businessName: string
  address?: string | null | undefined
  date: string
  startTime: string
  endTime: string
  player: Player
  bookingId: string
  onRebook: () => void
}

export function SuccessView({
  court,
  businessName,
  address,
  date,
  startTime,
  endTime,
  player,
  bookingId,
  onRebook,
}: SuccessViewProps) {
  const ref = `#${bookingId.slice(0, 8).toUpperCase()}`
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared'>('idle')

  const icsUrl = useMemo(
    () =>
      buildIcsUrl({
        courtName: court.name,
        businessName,
        address,
        date,
        startTime,
        endTime,
        ref: bookingId,
      }),
    [court.name, businessName, address, date, startTime, endTime, bookingId],
  )

  const handleShare = async () => {
    const result = await shareBooking({ courtName: court.name, businessName, date, startTime, endTime })
    if (result === 'copied') setShareState('copied')
    else if (result === 'shared') setShareState('shared')
  }

  const rows = [
    { label: 'Jugador', value: player.name },
    { label: 'Teléfono', value: player.phone, mono: true },
    { label: 'Cancha', value: court.name },
    { label: 'Complejo', value: businessName },
    { label: 'Fecha', value: formatLongDateEs(date) },
    { label: 'Horario', value: `${startTime} – ${endTime} hs`, mono: true },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <div
        className="px-7 py-8 text-center"
        style={{ background: 'linear-gradient(160deg, var(--green-50) 0%, var(--surface-page) 100%)' }}
      >
        <div
          className="w-[76px] h-[76px] rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center"
          style={{ boxShadow: '0 0 0 10px var(--green-100)' }}
        >
          <Check size={40} strokeWidth={3} className="text-white" />
        </div>
        <h1 className="font-display font-bold text-[26px] text-ink-900 tracking-tight mb-1.5">¡Turno confirmado!</h1>
        <p className="text-[14px] text-ink-500 mb-0.5">{court.name} · {humanizeSport(court.sportType)}</p>
        <p className="font-mono font-bold text-[16px] text-ink-900 mb-1.5">
          {formatLongDateEs(date)} · {startTime} – {endTime} hs
        </p>
        <span className="text-[11px] text-ink-400 font-mono tracking-wide">{ref}</span>
      </div>

      <div className="px-4">
        <div className="bg-white border border-ink-100 rounded-lg shadow-sm overflow-hidden">
          {rows.map((r, i) => (
            <div
              key={r.label}
              className="flex items-center gap-2.5 px-3.5 py-2.5"
              style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}
            >
              <span className="text-[12px] text-ink-500 w-[70px] flex-none">{r.label}</span>
              <span
                className="text-[13px] font-semibold text-ink-900 flex-1"
                style={{ fontFamily: r.mono ? 'var(--font-mono)' : undefined }}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2.5 mt-3.5">
          <a
            href={icsUrl}
            download={`reserva-${bookingId.slice(0, 8)}.ics`}
            className="flex-1 py-2.5 rounded-md border-[1.5px] border-ink-200 bg-white flex flex-col items-center gap-1 no-underline"
          >
            <CalendarPlus size={20} className="text-ink-700" aria-hidden />
            <span className="text-[11px] font-semibold text-ink-700 text-center">Agregar al calendario</span>
          </a>
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-md border-[1.5px] border-green-200 bg-green-50 cursor-pointer flex flex-col items-center gap-1"
          >
            <Share2 size={20} className="text-green-700" aria-hidden />
            <span className="text-[11px] font-semibold text-green-700 text-center">
              {shareState === 'copied' ? '¡Copiado!' : shareState === 'shared' ? '¡Compartido!' : 'Compartir turno'}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onRebook}
          className="w-full mt-3.5 py-3 border-none bg-transparent cursor-pointer text-[13px] text-ink-500 underline"
        >
          Reservar otra cancha
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-1.5 pb-8">
          <img src="/logo-mark.svg" width="13" height="13" alt="" />
          <span className="text-[11px] text-ink-400">Reserva gestionada con Book &amp; Play</span>
        </div>
      </div>
    </div>
  )
}
