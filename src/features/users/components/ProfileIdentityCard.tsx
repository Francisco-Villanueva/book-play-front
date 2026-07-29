import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil } from 'lucide-react'
import { Avatar } from '@/shared/components/Avatar'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { PhoneInput } from '@/shared/components/PhoneInput'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useUpdateProfile } from '../hooks/useUsers'
import { updateProfileSchema, type UpdateProfileFormData } from '../schemas/updateProfileSchema'
import { getApiErrorMessage } from '@/shared/utils/apiError'

interface EditProfileFormProps {
  defaults: UpdateProfileFormData
  onDone: () => void
}

function EditProfileForm({ defaults, onDone }: EditProfileFormProps) {
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
    <form
      onSubmit={submit}
      className="bg-white border border-ink-100 rounded-lg shadow-sm p-4 mb-5 flex flex-col gap-3.5"
    >
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

// Identidad de la cuenta: es lo único del perfil que es igual para el jugador y
// para el administrador. Todo lo demás (stats de turnos, avisos, complejo) es
// propio de cada contexto y vive en su pantalla.
export function ProfileIdentityCard() {
  const user = useAuthStore((s) => s.user)
  const [editing, setEditing] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3.5 mb-5">
        <Avatar name={user?.name ?? 'Usuario'} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-h4 text-ink-900 truncate">{user?.name ?? 'Usuario'}</p>
          <p className="text-caption text-ink-500 mt-0.5 truncate">{user?.email ?? ''}</p>
          {user?.phone && <p className="text-caption text-ink-400 mt-0.5 truncate">{user.phone}</p>}
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Editar perfil"
            data-testid="profile-edit-button"
            className="flex-none w-11 h-11 rounded-sm border border-ink-100 bg-white flex items-center justify-center text-ink-500 cursor-pointer"
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
    </>
  )
}
