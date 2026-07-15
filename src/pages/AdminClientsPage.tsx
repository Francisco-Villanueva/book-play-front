import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search, X, Phone, Mail, CalendarCheck, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { useBookings } from '@/features/bookings/hooks/useBookings'
import { formatMoneyARS, relativeDayLabel, todayISO } from '@/shared/utils/date'
import type { Booking } from '@/shared/types/domain'

interface Client {
  key: string
  name: string
  phone: string
  email: string
  total: number
  cancelled: number
  lastDate: string
  nextDate: string | null
  sport: string
  totalSpent: number
  history: { court: string; date: string; st: 'booked' | 'cancelled' }[]
}

const SPORT_COLORS: Record<string, string> = {
  futbol5: 'var(--green-500)',
  padel: 'var(--blue-500)',
  tenis: 'var(--amber-500)',
  basquet: '#e05e3d',
}

function sportColor(sport: string): string {
  const key = sport.toLowerCase().replace(/[^a-z0-9]/g, '')
  return SPORT_COLORS[key] ?? 'var(--green-500)'
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
}

function buildClients(bookings: Booking[]): Client[] {
  const groups = new Map<string, Booking[]>()
  for (const b of bookings) {
    const key = b.userId ?? b.guestPhone ?? b.guestEmail ?? b.guestName ?? b.id
    const arr = groups.get(key)
    if (arr) arr.push(b)
    else groups.set(key, [b])
  }

  const today = todayISO()

  return [...groups.entries()].map(([key, list]) => {
    const sorted = [...list].sort((a, b) => (a.date + a.startTime < b.date + b.startTime ? 1 : -1))
    const latest = sorted[0]!
    const upcoming = list
      .filter((b) => b.status === 'ACTIVE' && b.date >= today)
      .sort((a, b) => (a.date + a.startTime < b.date + b.startTime ? -1 : 1))[0]
    const sportCounts = new Map<string, number>()
    for (const b of list) {
      const s = b.court?.sportType ?? 'otro'
      sportCounts.set(s, (sportCounts.get(s) ?? 0) + 1)
    }
    const topSport = [...sportCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

    return {
      key,
      name: latest.guestName ?? latest.user?.name ?? 'Jugador',
      phone: latest.guestPhone ?? '—',
      email: latest.guestEmail ?? latest.user?.email ?? '—',
      total: list.length,
      cancelled: list.filter((b) => b.status === 'CANCELLED').length,
      lastDate: relativeDayLabel(latest.date),
      nextDate: upcoming ? `${relativeDayLabel(upcoming.date)} ${upcoming.startTime.slice(0, 5)}` : null,
      sport: topSport,
      totalSpent: list.filter((b) => b.status === 'ACTIVE').reduce((acc, b) => acc + (b.totalPrice ?? 0), 0),
      history: sorted.slice(0, 5).map((b) => ({
        court: b.court?.name ?? 'Cancha',
        date: `${relativeDayLabel(b.date)} ${b.startTime.slice(0, 5)}`,
        st: b.status === 'CANCELLED' ? 'cancelled' as const : 'booked' as const,
      })),
    }
  })
}

function DetailPanel({ client, onClose }: { client: Client; onClose: () => void }) {
  const color = sportColor(client.sport)

  return (
    <div className="w-[290px] flex-none h-full flex flex-col bg-white border-l border-ink-100">
      <div className="flex-none p-4 pb-3 border-b border-ink-100">
        <div className="flex justify-between items-start mb-3.5">
          <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wide">Jugador</span>
          <button type="button" onClick={onClose} className="border-none bg-transparent cursor-pointer text-ink-400 p-0.5" aria-label="Cerrar panel">
            <X size={15} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-[46px] h-[46px] rounded-full flex-none flex items-center justify-center text-white text-[17px] font-bold font-display"
            style={{ background: color }}
          >
            {initials(client.name)}
          </div>
          <div>
            <p className="font-display font-bold text-[16px] text-ink-900">{client.name}</p>
            <p className="text-[12px] text-ink-500 mt-0.5">{client.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-none grid grid-cols-3 border-b border-ink-100">
        {[
          { label: 'Reservas',   value: String(client.total),      mono: false },
          { label: 'Canceladas', value: String(client.cancelled),  mono: false },
          { label: 'Gastado',    value: formatMoneyARS(client.totalSpent), mono: true },
        ].map((s, i) => (
          <div key={s.label} className="py-2.5 px-3 text-center" style={{ borderLeft: i ? '1px solid var(--border-subtle)' : 'none' }}>
            <p className="font-bold text-[17px] text-ink-900 leading-none tracking-tight" style={{ fontFamily: s.mono ? 'var(--font-mono)' : 'var(--font-display)' }}>{s.value}</p>
            <p className="text-[10px] text-ink-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex-none p-4 border-b border-ink-100 flex flex-col gap-2">
        {[
          { icon: Phone,         value: client.phone,                            mono: true  },
          { icon: Mail,          value: client.email,                            mono: false },
          { icon: CalendarCheck, value: `Próxima: ${client.nextDate ?? 'No hay'}`, mono: false },
          { icon: Clock,         value: `Última: ${client.lastDate}`,             mono: false },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <r.icon size={13} className="text-ink-400 flex-none" aria-hidden />
            <span className="text-[12px] text-ink-700" style={{ fontFamily: r.mono ? 'var(--font-mono)' : undefined }}>{r.value}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-2.5">Últimas reservas</p>
        {client.history.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {client.history.map((h, i) => (
              <div key={i} className="flex items-center gap-2.5 px-2.5 py-2 bg-ink-50 rounded-md border border-ink-100">
                <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: h.st === 'cancelled' ? '#DC2626' : 'var(--green-600)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-ink-900">{h.court}</p>
                  <p className="text-[11px] text-ink-500 font-mono">{h.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-ink-400 text-center py-4">Sin historial guardado</p>
        )}
      </div>
    </div>
  )
}

type SortKey = 'name' | 'total' | 'cancelled' | 'totalSpent'

export default function AdminClientsPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { data: bookings, isLoading, isError } = useBookings(businessId)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [sortDesc, setSortDesc] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  const clients = useMemo(() => buildClients(bookings ?? []), [bookings])

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) { setSortDesc((d) => !d); return prev }
      setSortDesc(true)
      return key
    })
  }, [])

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q)
  }).sort((a, b) => {
    let v = 0
    if (sortKey === 'name')       v = a.name.localeCompare(b.name)
    if (sortKey === 'total')      v = a.total - b.total
    if (sortKey === 'totalSpent') v = a.totalSpent - b.totalSpent
    if (sortKey === 'cancelled')  v = a.cancelled - b.cancelled
    return sortDesc ? -v : v
  })

  const selClient = selected !== null ? clients.find((c) => c.key === selected) : undefined
  const totalRev = clients.reduce((acc, c) => acc + c.totalSpent, 0)
  const activeToday = clients.filter((c) => c.lastDate === 'Hoy').length

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => {
    const on = sortKey === k
    return (
      <button
        type="button"
        onClick={() => handleSort(k)}
        className="flex items-center gap-0.5 bg-transparent border-none cursor-pointer text-[11px] font-bold uppercase tracking-wide"
        style={{ color: on ? 'var(--text-body)' : 'var(--text-subtle)' }}
      >
        {label}
        {on && (sortDesc ? <ChevronDown size={11} aria-hidden /> : <ChevronUp size={11} aria-hidden />)}
      </button>
    )
  }

  const COLS = '2fr 1.5fr 90px 80px 90px 100px 110px'

  return (
    <AdminShell
      title="Clientes"
      subtitle={`${clients.length} jugadores · ${activeToday} activos hoy`}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* KPI strip */}
        <div className="flex-none flex bg-white border-b border-ink-100">
          {[
            { label: 'Jugadores',         value: String(clients.length),                              unit: 'registrados en tu complejo', mono: false },
            { label: 'Activos hoy',       value: String(activeToday),                                 unit: 'con reserva hoy',            mono: false },
            { label: 'Con cancelaciones', value: String(clients.filter((c) => c.cancelled > 0).length), unit: 'jugadores',                 mono: false, red: true },
            { label: 'Ingresos total',    value: `$${(totalRev / 1000).toFixed(0)}K`,                 unit: 'facturado histórico',        mono: true, green: true },
          ].map((k, i) => (
            <div key={k.label} className="flex-1 px-5 py-3" style={{ borderLeft: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <p className="text-[11px] font-semibold text-ink-500 mb-1">{k.label}</p>
              <p
                className="font-bold text-[22px] tracking-tight leading-none"
                style={{
                  fontFamily: k.mono ? 'var(--font-mono)' : 'var(--font-display)',
                  color: k.red ? '#B91C1C' : k.green ? 'var(--green-700)' : 'var(--text-strong)',
                }}
              >
                {k.value}
              </p>
              <p className="text-[11px] text-ink-400 mt-0.5">{k.unit}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex-none px-5 py-2.5 bg-white border-b border-ink-100 flex items-center gap-2.5">
          <div className="flex items-center gap-2 h-[36px] px-3 bg-ink-50 border border-ink-200 rounded-md max-w-[320px] flex-1">
            <Search size={14} className="text-ink-400 flex-none" aria-hidden />
            <input
              type="search"
              placeholder="Buscar por nombre, teléfono o email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-ink-900 placeholder:text-ink-400 outline-none font-body"
              aria-label="Buscar clientes"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Limpiar">
                <X size={13} className="text-ink-400" />
              </button>
            )}
          </div>
          <div className="flex-1" />
          <span className="text-[12px] text-ink-500 font-mono">{filtered.length} / {clients.length} jugadores</span>
        </div>

        {/* Table header */}
        <div
          className="flex-none grid gap-3 px-5 py-2 bg-ink-50 border-b-2 border-ink-200"
          style={{ gridTemplateColumns: COLS }}
        >
          <SortBtn k="name" label="Jugador" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Contacto</span>
          <SortBtn k="total" label="Reservas" />
          <SortBtn k="cancelled" label="Cancels." />
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Próxima</span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Deporte</span>
          <SortBtn k="totalSpent" label="Total gastado" />
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-body-sm text-ink-400 py-12">Cargando clientes…</p>
            ) : isError ? (
              <p className="text-center text-body-sm text-red-600 py-12">No pudimos cargar los clientes.</p>
            ) : filtered.map((c) => {
              const on = selected === c.key
              const color = sportColor(c.sport)
              const pct = c.total > 0 ? Math.round((c.cancelled / c.total) * 100) : 0
              const cancelColor = pct > 20 ? '#DC2626' : pct > 10 ? 'var(--amber-600)' : 'var(--text-subtle)'
              return (
                <div
                  key={c.key}
                  onClick={() => setSelected((s) => (s === c.key ? null : c.key))}
                  className="grid gap-3 px-5 py-3 items-center border-b border-ink-100 cursor-pointer transition-colors"
                  style={{ gridTemplateColumns: COLS, background: on ? 'var(--green-50)' : 'var(--surface-card)' }}
                  data-testid={`client-row-${c.key}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex-none flex items-center justify-center text-white text-[11px] font-bold"
                      style={{ background: color }}
                    >
                      {initials(c.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-ink-900 truncate">{c.name}</p>
                      <p className="text-[11px] text-ink-500 truncate">{c.email}</p>
                    </div>
                  </div>

                  <span className="text-[12px] text-ink-500 font-mono truncate">{c.phone}</span>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[14px] text-ink-900">{c.total}</span>
                  </div>

                  <span className="font-mono font-bold text-[13px]" style={{ color: cancelColor }}>
                    {c.cancelled > 0 ? `${c.cancelled} (${pct}%)` : '—'}
                  </span>

                  <span className="text-[12px]" style={{ color: c.nextDate ? 'var(--text-body)' : 'var(--text-subtle)' }}>
                    {c.nextDate ?? 'Sin próximas'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: color }} />
                    <span className="text-[12px] text-ink-700">{c.sport}</span>
                  </div>

                  <span className="font-mono font-bold text-[13px] text-ink-900">{formatMoneyARS(c.totalSpent)}</span>
                </div>
              )
            })}
            {!isLoading && !isError && filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="font-display font-bold text-h4 text-ink-900 mb-2">Sin resultados</p>
                <p className="text-body-sm text-ink-500">Intentá con otro nombre, teléfono o email.</p>
              </div>
            )}
          </div>

          {selClient && (
            <DetailPanel client={selClient} onClose={() => setSelected(null)} />
          )}
        </div>
      </div>
    </AdminShell>
  )
}
