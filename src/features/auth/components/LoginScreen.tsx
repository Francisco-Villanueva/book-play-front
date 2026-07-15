import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Phone } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { loginSchema, type LoginFormData } from '../schemas/authSchemas'
import { useLogin } from '../hooks/useAuth'
import { getApiErrorMessage } from '@/shared/utils/apiError'

interface LoginScreenProps {
  onRegister: () => void
}

export function LoginScreen({ onRegister }: LoginScreenProps) {
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  return (
    <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
      <div
        className="flex-none px-6 pt-10 pb-6 text-center"
        style={{ background: 'linear-gradient(160deg, var(--green-50) 0%, var(--surface-page) 100%)' }}
      >
        <img src="/logo-wordmark.svg" height="38" alt="Book & Play" className="mx-auto mb-5" />
        <h1 className="font-display font-bold text-h2 text-ink-900 tracking-tight mb-1">
          ¡Bienvenido de vuelta!
        </h1>
        <p className="text-body-sm text-ink-500">Ingresá para ver tus turnos</p>
      </div>

      <form onSubmit={handleSubmit((data) => login.mutate(data))} className="flex-1 flex flex-col gap-3.5 px-5 py-5">
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
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="text-right">
          <button type="button" className="text-caption font-semibold text-green-600 bg-transparent border-none cursor-pointer">
            Olvidé mi contraseña
          </button>
        </div>

        {login.isError && (
          <p className="text-body-sm text-red-600 text-center -mt-1">
            {getApiErrorMessage(login.error)}
          </p>
        )}

        <Button type="submit" full size="lg" disabled={login.isPending}>
          {login.isPending ? 'Ingresando…' : 'Ingresar'}
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

        <p className="text-center text-body-sm text-ink-500 mt-2">
          ¿No tenés cuenta?{' '}
          <button
            type="button"
            onClick={onRegister}
            className="text-green-600 font-bold bg-transparent border-none cursor-pointer"
          >
            Registrate
          </button>
        </p>
      </form>
    </div>
  )
}
