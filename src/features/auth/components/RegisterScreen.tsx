import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Phone } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { SegmentedControl } from '@/shared/components/SegmentedControl'
import { registerSchema, type RegisterFormData } from '../schemas/authSchemas'
import { useRegister } from '../hooks/useAuth'
import { getApiErrorMessage } from '@/shared/utils/apiError'

interface RegisterScreenProps {
  onLogin: () => void
}

const ACCOUNT_TYPES = {
  Jugador: 'player',
  'Complejo deportivo': 'business',
} as const
type AccountTypeLabel = keyof typeof ACCOUNT_TYPES

export function RegisterScreen({ onLogin }: RegisterScreenProps) {
  const registerMutation = useRegister()
  const [accountType, setAccountType] = useState<AccountTypeLabel>('Jugador')
  const isBusiness = ACCOUNT_TYPES[accountType] === 'business'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  return (
    <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
      <div className="flex-none flex items-center gap-2.5 px-5 py-4 bg-white border-b border-ink-100">
        <button
          type="button"
          onClick={onLogin}
          className="flex p-1 bg-transparent border-none cursor-pointer"
          aria-label="Volver"
        >
          <ArrowLeft size={22} className="text-ink-700" />
        </button>
        <div>
          <h1 className="font-display font-bold text-h3 text-ink-900 tracking-tight leading-none">
            Crear cuenta
          </h1>
          <p className="text-caption text-ink-500 mt-0.5">Reservás más rápido con una cuenta</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => registerMutation.mutate({ ...data, asBusiness: isBusiness }))}
        className="flex-1 flex flex-col gap-3.5 px-5 py-5"
      >
        <div>
          <p className="text-[13px] font-semibold text-ink-700 mb-2">¿Qué querés hacer?</p>
          <SegmentedControl
            full
            options={Object.keys(ACCOUNT_TYPES)}
            value={accountType}
            onChange={(v) => setAccountType(v as AccountTypeLabel)}
          />
          <p className="text-caption text-ink-500 mt-1.5">
            {isBusiness
              ? 'Vas a poder configurar tu complejo, canchas y horarios apenas termines.'
              : 'Vas a poder reservar canchas en los complejos que se sumen a Book & Play.'}
          </p>
        </div>

        <Input
          label="Nombre completo"
          placeholder="Ej: Martín Gómez"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Nombre de usuario"
          placeholder="Ej: martin_gomez"
          autoComplete="username"
          error={errors.userName?.message}
          {...register('userName')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Repetir contraseña"
          type="password"
          placeholder="Repetí tu contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <p className="text-[11px] text-ink-400 leading-relaxed">
          Al crear tu cuenta aceptás los{' '}
          <span className="text-green-600 font-semibold">Términos y condiciones</span> y la{' '}
          <span className="text-green-600 font-semibold">Política de privacidad</span>.
        </p>

        {registerMutation.isError && (
          <p className="text-body-sm text-red-600 text-center -mt-1">
            {getApiErrorMessage(registerMutation.error)}
          </p>
        )}

        <Button type="submit" full size="lg" disabled={registerMutation.isPending}>
          {registerMutation.isPending
            ? 'Creando cuenta…'
            : isBusiness
              ? 'Crear cuenta y configurar mi complejo'
              : 'Crear cuenta'}
        </Button>

        <div className="flex items-center gap-2.5 my-1">
          <div className="flex-1 h-px bg-ink-100" />
          <span className="text-caption text-ink-400 font-semibold">o continuá con</span>
          <div className="flex-1 h-px bg-ink-100" />
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-md border-[1.5px] border-ink-200 bg-white font-body text-body-sm font-semibold text-ink-700 cursor-pointer"
        >
          <Phone size={18} aria-hidden />
          Continuar con teléfono
        </button>

        <p className="text-center text-body-sm text-ink-500">
          ¿Ya tenés cuenta?{' '}
          <button
            type="button"
            onClick={onLogin}
            className="text-green-600 font-bold bg-transparent border-none cursor-pointer"
          >
            Ingresá
          </button>
        </p>
      </form>
    </div>
  )
}
