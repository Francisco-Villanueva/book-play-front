import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, MapPin, Search, SearchX } from 'lucide-react'
import { PlayerAppShell } from '@/features/bookings/components/PlayerAppShell'
import { AppHeader } from '@/features/bookings/components/AppHeader'
import { EmptyState } from '@/shared/components/EmptyState'
import { Input } from '@/shared/components/Input'
import { Badge } from '@/shared/components/Badge'
import { useBusinessSearch } from '@/features/businesses/hooks/useBusinesses'
import type { BusinessSearchResult } from '@/shared/types/domain'

function BusinessCard({ business, onClick }: { business: BusinessSearchResult; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="bg-white border-[1.5px] border-ink-100 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-[180ms]"
      data-testid={`business-search-${business.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="font-display font-bold text-[16px] text-ink-900">{business.name}</span>
          {business.address && (
            <p className="flex items-center gap-1 text-[12px] text-ink-500 mt-0.5">
              <MapPin size={11} className="flex-none" aria-hidden />
              <span className="truncate">{business.address}</span>
            </p>
          )}
        </div>
        {business.courtsCount > 0 && (
          <Badge tone="success" className="flex-none">{business.courtsCount} cancha{business.courtsCount === 1 ? '' : 's'}</Badge>
        )}
      </div>
      {business.sports.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-2.5">
          {business.sports.map((s) => (
            <Badge key={s} tone="default">{s}</Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const { data: businesses, isLoading, isError } = useBusinessSearch(debounced)
  const results = businesses ?? []

  return (
    <PlayerAppShell>
      <AppHeader title="Reservar cancha" left={<img src="/logo-mark.svg" width="34" height="34" alt="Book & Play" />} />
      <div className="flex-none px-4 pt-3.5 pb-1 bg-white border-b border-ink-100">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar complejo por nombre…"
          aria-label="Buscar complejo"
          data-testid="business-search-input"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {isLoading ? (
          <p className="text-center text-body-sm text-ink-400 py-12">Buscando complejos…</p>
        ) : isError ? (
          <p className="text-center text-body-sm text-red-600 py-12">No pudimos cargar los complejos. Intentá de nuevo.</p>
        ) : results.length === 0 ? (
          <EmptyState
            icon={query ? SearchX : Search}
            variant="dashed"
            title={query ? 'Sin resultados' : 'Buscá un complejo para reservar'}
            description={
              query
                ? `No encontramos ningún complejo que coincida con "${query}".`
                : 'Escribí el nombre del complejo donde querés jugar para ver sus canchas disponibles.'
            }
            primaryAction={{ label: 'Ver mis turnos', icon: CalendarCheck, onClick: () => navigate('/my-bookings') }}
          />
        ) : (
          results.map((b) => (
            <BusinessCard key={b.id} business={b} onClick={() => navigate(`/businesses/${b.id}/book`)} />
          ))
        )}
      </div>
    </PlayerAppShell>
  )
}
