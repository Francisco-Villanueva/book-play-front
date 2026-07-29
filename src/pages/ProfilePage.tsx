import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronRight, Bell, Building2 } from 'lucide-react'
import { PlayerAppShell } from '@/features/bookings/components/PlayerAppShell'
import { AppHeader } from '@/features/bookings/components/AppHeader'
import { Switch } from '@/shared/components/Switch'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useMyBookings } from '@/features/bookings/hooks/useBookings'
import { useCurrentBusiness } from '@/features/auth/hooks/useAppContext'
import { ProfileIdentityCard } from '@/features/users/components/ProfileIdentityCard'
import { usePreferences, useUpdatePreferences } from '@/features/users/hooks/useUsers'
import { todayISO } from '@/shared/utils/date'

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="flex-1 bg-white border border-ink-100 rounded-md px-2.5 py-3 text-center shadow-xs">
      <div className="font-display font-bold text-h3 text-ink-900 leading-none">{n}</div>
      <div className="text-overline text-ink-500 mt-1">{l}</div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { data: preferences, isLoading: preferencesLoading } = usePreferences()
  const updatePreferences = useUpdatePreferences()
  const business = useCurrentBusiness()
  const hasBusiness = (user?.businesses?.length ?? 0) > 0
  const { data: bookings } = useMyBookings()

  const today = todayISO()
  const thisMonth = today.slice(0, 7)
  const stats = [
    { n: String(bookings?.length ?? 0), l: 'Turnos totales' },
    { n: String((bookings ?? []).filter((b) => b.date.startsWith(thisMonth)).length), l: 'Este mes' },
    { n: String((bookings ?? []).filter((b) => b.status === 'ACTIVE' && b.date >= today).length), l: 'Próximos' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <PlayerAppShell>
      <AppHeader title="Perfil" left={<img src="/logo-mark.svg" width="34" height="34" alt="Book & Play" />} />
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <ProfileIdentityCard />

        <div className="flex gap-2.5 mb-5">
          {stats.map((s) => (
            <Stat key={s.l} n={s.n} l={s.l} />
          ))}
        </div>

        <div className="bg-white border border-ink-100 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-[34px] h-[34px] rounded-sm bg-ink-50 flex items-center justify-center text-ink-700 flex-none">
              <Bell size={18} aria-hidden />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-body-sm font-semibold text-ink-900">Avisos de turnos</span>
              <span className="block text-caption text-ink-500">
                Correos al reservar y al cancelar
              </span>
            </span>
            <Switch
              checked={preferences?.notifyBookings ?? true}
              disabled={preferencesLoading || updatePreferences.isPending}
              onChange={(e) => updatePreferences.mutate({ notifyBookings: e.target.checked })}
              aria-label="Avisos de turnos"
              data-testid="profile-notify-bookings"
            />
          </div>
        </div>

        {business && (
          <button
            type="button"
            onClick={() => navigate(`/admin/${business.id}`)}
            data-testid="profile-back-to-business"
            className="w-full flex items-center gap-3 px-4 py-3.5 mt-4 bg-green-50 border border-green-100 rounded-lg cursor-pointer text-left"
          >
            <span className="w-[34px] h-[34px] rounded-sm bg-white flex items-center justify-center text-green-600 flex-none">
              <Building2 size={18} aria-hidden />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-body-sm font-bold text-green-700 truncate">Ir a {business.name}</span>
              <span className="block text-caption text-green-600">Administrar mi complejo</span>
            </span>
            <ChevronRight size={16} className="text-green-400 flex-none" aria-hidden />
          </button>
        )}

        {!hasBusiness && (
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="w-full flex items-center gap-3 px-4 py-3.5 mt-4 bg-green-50 border border-green-100 rounded-lg cursor-pointer text-left"
          >
            <span className="w-[34px] h-[34px] rounded-sm bg-white flex items-center justify-center text-green-600 flex-none">
              <Building2 size={18} aria-hidden />
            </span>
            <span className="flex-1">
              <span className="block text-body-sm font-bold text-green-700">Registrar mi complejo deportivo</span>
              <span className="block text-caption text-green-600">Empezá a recibir reservas con tu cuenta</span>
            </span>
            <ChevronRight size={16} className="text-green-400 flex-none" aria-hidden />
          </button>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 mt-4 bg-red-50 border border-red-100 rounded-lg cursor-pointer text-red-600"
        >
          <LogOut size={18} className="flex-none" aria-hidden />
          <span className="text-body-sm font-semibold">Cerrar sesión</span>
        </button>
      </div>
    </PlayerAppShell>
  )
}

