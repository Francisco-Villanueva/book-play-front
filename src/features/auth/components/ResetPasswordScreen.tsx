import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, TriangleAlert } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/authSchemas'
import { useResetPassword } from '../hooks/useAuth'
import { getApiErrorMessage } from '@/shared/utils/apiError'

interface ResetPasswordScreenProps {
  /** Token del link del email (?token=...). Vacío si el link vino mal armado. */
  token: string
  onGoToLogin: () => void
  onRequestNewLink: () => void
}

const headerStyle = {
  background: 'linear-gradient(160deg, var(--green-50) 0%, var(--surface-page) 100%)',
}

export function ResetPasswordScreen({
  token,
  onGoToLogin,
  onRequestNewLink,
}: ResetPasswordScreenProps) {
  const resetPassword = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) })

  if (!token) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        <div className="flex-none px-6 pt-10 pb-6 text-center" style={headerStyle}>
          <img src="/logo-wordmark.svg" height="38" alt="Book & Play" className="mx-auto mb-5" />
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <TriangleAlert size={26} className="text-red-500" aria-hidden />
          </div>
          <h1 className="font-display font-bold text-h2 text-ink-900 tracking-tight mb-1">
            Enlace inválido
          </h1>
          <p className="text-body-sm text-ink-500">
            Este enlace está incompleto o mal copiado. Pedí uno nuevo para continuar.
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-3.5 px-5 py-5">
          <Button type="button" full size="lg" onClick={onRequestNewLink}>
            Pedir un enlace nuevo
          </Button>
        </div>
      </div>
    )
  }

  if (resetPassword.isSuccess) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        <div className="flex-none px-6 pt-10 pb-6 text-center" style={headerStyle}>
          <img src="/logo-wordmark.svg" height="38" alt="Book & Play" className="mx-auto mb-5" />
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={26} className="text-green-600" aria-hidden />
          </div>
          <h1 className="font-display font-bold text-h2 text-ink-900 tracking-tight mb-1">
            ¡Contraseña actualizada!
          </h1>
          <p className="text-body-sm text-ink-500">
            Ya podés ingresar con tu contraseña nueva.
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-3.5 px-5 py-5">
          <Button type="button" full size="lg" onClick={onGoToLogin}>
            Ingresar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
      <div className="flex-none px-6 pt-10 pb-6 text-center" style={headerStyle}>
        <img src="/logo-wordmark.svg" height="38" alt="Book & Play" className="mx-auto mb-5" />
        <h1 className="font-display font-bold text-h2 text-ink-900 tracking-tight mb-1">
          Creá tu nueva contraseña
        </h1>
        <p className="text-body-sm text-ink-500">Elegí una contraseña de al menos 8 caracteres</p>
      </div>

      <form
        onSubmit={handleSubmit((data) =>
          resetPassword.mutate({ token, newPassword: data.newPassword }),
        )}
        className="flex-1 flex flex-col gap-3.5 px-5 py-5"
      >
        <Input
          label="Nueva contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="Repetí la contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {resetPassword.isError && (
          <div className="-mt-1 flex flex-col gap-2">
            <p className="text-body-sm text-red-600 text-center">
              {getApiErrorMessage(resetPassword.error)}
            </p>
            <button
              type="button"
              onClick={onRequestNewLink}
              className="text-caption font-semibold text-green-600 bg-transparent border-none cursor-pointer"
            >
              Pedir un enlace nuevo
            </button>
          </div>
        )}

        <Button type="submit" full size="lg" disabled={resetPassword.isPending}>
          {resetPassword.isPending ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
      </form>
    </div>
  )
}
