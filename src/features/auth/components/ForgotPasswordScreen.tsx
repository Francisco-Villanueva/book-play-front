import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas/authSchemas'
import { useForgotPassword } from '../hooks/useAuth'
import { getApiErrorMessage } from '@/shared/utils/apiError'

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void
}

export function ForgotPasswordScreen({ onBackToLogin }: ForgotPasswordScreenProps) {
  const forgotPassword = useForgotPassword()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

  // El backend responde 200 genérico exista o no la cuenta, así que la pantalla
  // de éxito no confirma ni desmiente que el email esté registrado.
  if (forgotPassword.isSuccess) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        <div
          className="flex-none px-6 pt-10 pb-6 text-center"
          style={{ background: 'linear-gradient(160deg, var(--green-50) 0%, var(--surface-page) 100%)' }}
        >
          <img src="/logo-wordmark.svg" height="38" alt="Book & Play" className="mx-auto mb-5" />
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <MailCheck size={26} className="text-green-600" aria-hidden />
          </div>
          <h1 className="font-display font-bold text-h2 text-ink-900 tracking-tight mb-1">
            Revisá tu correo
          </h1>
          <p className="text-body-sm text-ink-500">
            Si existe una cuenta con <span className="font-semibold text-ink-700">{getValues('email')}</span>,
            te enviamos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-3.5 px-5 py-5">
          <p className="text-body-sm text-ink-500 text-center">
            El enlace vence en 60 minutos. Si no lo ves, revisá la carpeta de spam.
          </p>
          <Button type="button" full size="lg" onClick={onBackToLogin}>
            Volver al inicio de sesión
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
      <div
        className="flex-none px-6 pt-10 pb-6 text-center"
        style={{ background: 'linear-gradient(160deg, var(--green-50) 0%, var(--surface-page) 100%)' }}
      >
        <img src="/logo-wordmark.svg" height="38" alt="Book & Play" className="mx-auto mb-5" />
        <h1 className="font-display font-bold text-h2 text-ink-900 tracking-tight mb-1">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-body-sm text-ink-500">
          Ingresá tu email y te mandamos un enlace para crear una nueva
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => forgotPassword.mutate(data))}
        className="flex-1 flex flex-col gap-3.5 px-5 py-5"
      >
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        {forgotPassword.isError && (
          <p className="text-body-sm text-red-600 text-center -mt-1">
            {getApiErrorMessage(forgotPassword.error)}
          </p>
        )}

        <Button type="submit" full size="lg" disabled={forgotPassword.isPending}>
          {forgotPassword.isPending ? 'Enviando…' : 'Enviar enlace'}
        </Button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center justify-center gap-1.5 text-body-sm text-ink-500 bg-transparent border-none cursor-pointer mt-1"
        >
          <ArrowLeft size={16} aria-hidden />
          Volver al inicio de sesión
        </button>
      </form>
    </div>
  )
}
