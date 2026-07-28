import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogOut, ChevronRight, Bell, Repeat, Shield, HelpCircle, Building2, Pencil } from 'lucide-react'
import { PlayerAppShell } from '@/features/bookings/components/PlayerAppShell'
import { AppHeader } from '@/features/bookings/components/AppHeader'
import { Avatar } from '@/shared/components/Avatar'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { PhoneInput } from '@/shared/components/PhoneInput'
import { Switch } from '@/shared/components/Switch'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useMyBookings } from '@/features/bookings/hooks/useBookings'
import { useUpdateProfile } from '@/features/users/hooks/useUsers'
import { updateProfileSchema, type UpdateProfileFormData } from '@/features/users/schemas/updateProfileSchema'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { cn } from '@/shared/utils/cn'
import { todayISO } from '@/shared/utils/date'

const MENU = [
  { icon: Shield, label: 'Privacidad' },
  { icon: HelpCircle, label: 'Ayuda y soporte' },
]

function EditProfileForm({
  defaults,
  onDone,
}: {
  defaults: UpdateProfileFormData
  onDone: () => void
}) {
  const updateProfile = useUpdateProfile()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: defaults,
  })

  const submit = handleSubmit((data) =>
    updateProfile.mutate(
      { name: data.name, ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}) },
      { onSuccess: onDone },
    ),
  )

  return (
    <form onSubmit={submit} className="bg-white border border-ink-100 rounded-lg shadow-sm p-4 mb-5 flex flex-col gap-3.5">
      <Input label="Nombre completo" autoComplete="name" error={errors.name?.message} {...register('name')} />
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <PhoneInput
            label="Teléfono"
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.phone?.message}
          />
        )}
      />
      {updateProfile.isError && (
        <p className="text-caption text-red-600">{getApiErrorMessage(updateProfile.error)}</p>
      )}
      <div className="flex gap-2.5">
        <Button type="submit" full disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button type="button" variant="ghost" full onClick={onDone} disabled={updateProfile.isPending}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

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
  const [notif, setNotif] = useState(true)
  const [recurring, setRecurring] = useState(false)
  const [editing, setEditing] = useState(false)
  const name = user?.name ?? 'Jugador'
  const email = user?.email ?? ''
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
        <div className="flex items-center gap-3.5 mb-5">
          <Avatar name={name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-h4 text-ink-900 truncate">{name}</p>
            <p className="text-caption text-ink-500 mt-0.5 truncate">{email}</p>
            {user?.phone && <p className="text-caption text-ink-400 mt-0.5 truncate">{user.phone}</p>}
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Editar perfil"
              data-testid="profile-edit-button"
              className="flex-none w-9 h-9 rounded-sm border border-ink-100 bg-white flex items-center justify-center text-ink-500 cursor-pointer"
            >
              <Pencil size={16} aria-hidden />
            </button>
          )}
        </div>

        {editing && (
          <EditProfileForm
            defaults={{ name: user?.name ?? '', phone: user?.phone ?? '' }}
            onDone={() => setEditing(false)}
          />
        )}

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
            <span className="flex-1 text-body-sm font-semibold text-ink-900">Avisos de turnos</span>
            <Switch checked={notif} onChange={(e) => setNotif(e.target.checked)} aria-label="Avisos de turnos" />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 border-t border-ink-100">
            <span className="w-[34px] h-[34px] rounded-sm bg-ink-50 flex items-center justify-center text-ink-700 flex-none">
              <Repeat size={18} aria-hidden />
            </span>
            <span className="flex-1 text-body-sm font-semibold text-ink-900">Turno fijo semanal</span>
            <Switch checked={recurring} onChange={(e) => setRecurring(e.target.checked)} aria-label="Turno fijo semanal" />
          </div>
        </div>

        <div className="bg-white border border-ink-100 rounded-lg shadow-sm overflow-hidden mt-4">
          {MENU.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              type="button"
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer bg-transparent border-none',
                i > 0 && 'border-t border-ink-100',
              )}
            >
              <Icon size={18} className="text-ink-400 flex-none" aria-hidden />
              <span className="flex-1 text-body-sm font-semibold text-ink-800 text-left">{label}</span>
              <ChevronRight size={16} className="text-ink-300 flex-none" aria-hidden />
            </button>
          ))}
        </div>

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

