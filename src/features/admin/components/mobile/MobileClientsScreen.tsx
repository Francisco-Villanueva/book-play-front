import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CalendarCheck, Clock, Mail, MessageCircle, Phone, Search, SearchX } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useBookings } from '@/features/bookings/hooks/useBookings'
import { addDaysISO, formatMoneyARS, todayISO } from '@/shared/utils/date'
import { initials } from '../reservationTypes'
import { buildClients, sportColor, CLIENT_HISTORY_DAYS, type Client } from '../clientTypes'
import { telHref, whatsappHref } from './mobileTypes'
import { MobileSubScreen } from './MobileSubScreen'
import { Sheet } from './Sheet'

type SortKey = 'total' | 'name' | 'totalSpent'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'total', label: 'Más turnos' },
  { key: 'totalSpent', label: 'Más gastaron' },
  { key: 'name', label: 'A–Z' },
]

export function MobileClientsScreen() {
  const { businessId } = useParams<{ businessId: string }>()
  const { data: bookings, isLoading, isError } = useBookings(businessId, {
    dateFrom: addDaysISO(todayISO(), -CLIENT_HISTORY_DAYS),
  })
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [selected, setSelected] = useState<string | null>(null)

  const clients = useMemo(() => buildClients(bookings ?? []), [bookings])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortKey === 'name') return a.name.localeCompare(b.name)
        if (sortKey === 'totalSpent') return b.totalSpent - a.totalSpent
        return b.total - a.total
      })
  }, [clients, search, sortKey])

  const selectedClient = selected != null ? clients.find((c) => c.key === selected) : undefined

  return (
    <>
      <MobileSubScreen
        title="Clientes"
        subtitle={clients.length === 1 ? '1 jugador' : `${clients.length} jugadores`}
        toolbar={
          <div className="px-4 pt-2.5 pb-2">
            <div className="relative mb-2.5">
              <Search size={18} className="absolute left-3 top-3.5 text-ink-400 pointer-events-none" aria-hidden />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o teléfono"
                aria-label="Buscar clientes"
                className="w-full h-11 pl-10 pr-3.5 rounded-md border-[1.5px] border-ink-200 bg-white font-body text-[16px] text-ink-900 outline-none focus:border-green-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-0.5">
              {SORTS.map((s) => {
                const on = sortKey === s.key
                return (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSortKey(s.key)}
                    className={cn(
                      'flex-none px-3.5 py-2 rounded-full border-[1.5px] cursor-pointer font-body font-bold text-[13px] min-h-[36px]',
                      on ? 'border-green-500 bg-green-500 text-white' : 'border-ink-200 bg-white text-ink-700',
                    )}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>
        }
      >
        {isLoading ? (
          <p className="py-12 text-center text-body-sm text-ink-400">Cargando clientes…</p>
        ) : isError ? (
          <p className="py-12 text-center text-body-sm text-red-600">No pudimos cargar los clientes.</p>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <span className="w-14 h-14 rounded-full bg-ink-50 flex items-center justify-center mx-auto mb-3.5">
              <SearchX size={26} className="text-ink-400" aria-hidden />
            </span>
            <p className="font-bold text-[16px] text-ink-900">Sin clientes</p>
            <p className="text-body-sm text-ink-500 mt-1">
              {search ? 'Probá con otra búsqueda.' : 'Van a aparecer cuando cargues reservas.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((client) => (
              <ClientCard key={client.key} client={client} onOpen={() => setSelected(client.key)} />
            ))}
          </div>
        )}
      </MobileSubScreen>

      {selectedClient && (
        <ClientDetailSheet client={selectedClient} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

function ClientCard({ client, onOpen }: { client: Client; onOpen: () => void }) {
  const hasPhone = client.phone !== '—'

  return (
    <div className="flex items-center gap-3 px-3.5 py-3 bg-white rounded-lg border border-ink-100 shadow-xs">
      <button
        type="button"
        onClick={onOpen}
        className="flex items-center gap-3 flex-1 min-w-0 bg-transparent border-none cursor-pointer text-left min-h-[52px]"
      >
        <span
          className="w-11 h-11 flex-none rounded-full text-white flex items-center justify-center font-display font-bold text-[15px]"
          style={{ background: sportColor(client.sport) }}
        >
          {initials(client.name)}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-bold text-body-sm text-ink-900 truncate">{client.name}</span>
          <span className="block tnum font-mono text-[12.5px] text-ink-500 truncate">
            {client.total} {client.total === 1 ? 'turno' : 'turnos'} · {formatMoneyARS(client.totalSpent)}
          </span>
        </span>
      </button>

      {hasPhone && (
        <div className="flex gap-1.5 flex-none">
          <a
            href={telHref(client.phone)}
            aria-label={`Llamar a ${client.name}`}
            className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center"
          >
            <Phone size={17} className="text-green-700" aria-hidden />
          </a>
          <a
            href={whatsappHref(client.phone)}
            target="_blank"
            rel="noreferrer"
            aria-label={`WhatsApp a ${client.name}`}
            className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center"
          >
            <MessageCircle size={17} className="text-green-700" aria-hidden />
          </a>
        </div>
      )}
    </div>
  )
}

function ClientDetailSheet({ client, onClose }: { client: Client; onClose: () => void }) {
  const hasPhone = client.phone !== '—'

  return (
    <Sheet onClose={onClose} snap="mid" ariaLabel={`Cliente ${client.name}`}>
      <div className="flex items-center gap-3.5 mb-4">
        <span
          className="w-[52px] h-[52px] flex-none rounded-full text-white flex items-center justify-center font-display font-bold text-[18px]"
          style={{ background: sportColor(client.sport) }}
        >
          {initials(client.name)}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-[22px] tracking-tight text-ink-900 truncate">
            {client.name}
          </h2>
          <p className="tnum font-mono text-caption text-ink-500 truncate">{client.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat value={String(client.total)} label="turnos" />
        <Stat value={String(client.cancelled)} label="cancelados" />
        <Stat value={formatMoneyARS(client.totalSpent)} label="gastado" />
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <Row icon={Clock} label="Último turno" value={client.lastDate} />
        {client.nextDate && <Row icon={CalendarCheck} label="Próximo" value={client.nextDate} />}
        {client.email !== '—' && <Row icon={Mail} label="Email" value={client.email} />}
      </div>

      {hasPhone && (
        <div className="flex gap-2 mb-4">
          <a
            href={telHref(client.phone)}
            className="flex-1 h-12 rounded-md bg-green-50 text-green-700 font-body font-bold text-body-sm flex items-center justify-center gap-2 no-underline"
          >
            <Phone size={18} aria-hidden />
            Llamar
          </a>
          <a
            href={whatsappHref(client.phone)}
            target="_blank"
            rel="noreferrer"
            className="flex-1 h-12 rounded-md bg-green-50 text-green-700 font-body font-bold text-body-sm flex items-center justify-center gap-2 no-underline"
          >
            <MessageCircle size={18} aria-hidden />
            WhatsApp
          </a>
        </div>
      )}

      {client.history.length > 0 && (
        <>
          <p className="text-overline text-ink-400 mb-2">Últimos turnos</p>
          <div className="flex flex-col gap-1.5">
            {client.history.map((h, i) => (
              <div
                key={`${h.date}-${i}`}
                className="flex items-center justify-between px-3 py-2.5 bg-ink-50 rounded-md"
              >
                <span className="text-caption font-semibold text-ink-700 truncate">{h.court}</span>
                <span
                  className={cn(
                    'tnum font-mono text-[12.5px] flex-none',
                    h.st === 'cancelled' ? 'text-red-600 line-through' : 'text-ink-500',
                  )}
                >
                  {h.date}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Sheet>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2 py-2.5 bg-ink-50 rounded-md text-center">
      <p className="tnum font-mono font-bold text-body-sm text-ink-900 truncate">{value}</p>
      <p className="text-[11px] text-ink-500 mt-px">{label}</p>
    </div>
  )
}

interface RowProps {
  icon: typeof Clock
  label: string
  value: string
}

function Row({ icon: Icon, label, value }: RowProps) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-ink-50 rounded-md">
      <Icon size={16} className="text-ink-400 flex-none" aria-hidden />
      <span className="flex-1 text-caption text-ink-500">{label}</span>
      <span className="text-caption font-semibold text-ink-900 truncate">{value}</span>
    </div>
  )
}
