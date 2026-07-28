import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { usersApi } from '@/features/users/api/usersApi'
import { useAuthStore } from '../store/authStore'
import type { User } from '@/shared/types/domain'
import type {
  ForgotPasswordFormData,
  LoginFormData,
  RegisterFormData,
} from '../schemas/authSchemas'

// A user can be PLAYER globally and still own/manage a business (BusinessUser role).
// Business administration takes priority over the player app as the landing view.
export function getPostLoginPath(user: User): string {
  if (user.globalRole === 'MASTER') return '/master/businesses'
  if (user.businesses && user.businesses.length > 0) return `/admin/${user.businesses[0]!.id}`
  return '/dashboard'
}

// Sólo rutas internas: un ?next= absoluto convertiría el login en un redirect abierto.
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  return value
}

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data.email, data.password),
    onSuccess: async ({ data }) => {
      setAuth(data.user, data.accessToken)
      // The login response doesn't include business memberships — fetch the
      // enriched profile so the redirect can tell player vs business admin apart.
      const { data: fullUser } = await usersApi.me()
      setAuth(fullUser, data.accessToken)
      navigate(safeNext(params.get('next')) ?? getPostLoginPath(fullUser), { replace: true })
    },
  })
}

interface RegisterMutationInput extends RegisterFormData {
  /** true when the user chose "crear cuenta de negocio" during registration */
  asBusiness?: boolean
}

export function useRegister() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  return useMutation({
    mutationFn: (data: RegisterMutationInput) =>
      authApi.register(data.name, data.userName, data.email, data.password),
    onSuccess: ({ data }, variables) => {
      setAuth(data.user, data.accessToken)
      const target = variables.asBusiness
        ? '/onboarding'
        : (safeNext(params.get('next')) ?? getPostLoginPath(data.user))
      navigate(target, { replace: true })
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordFormData) => authApi.forgotPassword(data.email),
  })
}

// El endpoint no devuelve sesión: tras el reset el usuario ingresa con la
// contraseña nueva, así que la pantalla confirma y ofrece ir al login.
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  return () => {
    logout()
    navigate('/login')
  }
}
