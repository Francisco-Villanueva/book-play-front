import { useAuthStore } from '../store/authStore'
import { useAdminStore } from '@/features/admin/store/adminStore'
import type { User, UserBusinessMembership } from '@/shared/types/domain'

/**
 * Un usuario con membresías puede estar en dos contextos: su complejo o la app
 * de jugador. El contexto no es un rol global — se deriva de `user.businesses`,
 * que es la única fuente de verdad sobre a qué complejos pertenece.
 */

// `lastId` puede venir de una sesión anterior o de un complejo del que lo
// sacaron: sólo vale si sigue estando entre sus membresías.
export function resolveBusiness(
  memberships: UserBusinessMembership[] | undefined,
  lastId: string | null,
): UserBusinessMembership | null {
  const list = memberships ?? []
  return list.find((b) => b.id === lastId) ?? list[0] ?? null
}

export function homePathFor(user: User | null, lastBusinessId: string | null): string {
  if (!user) return '/login'
  if (user.globalRole === 'MASTER') return '/master/businesses'
  const business = resolveBusiness(user.businesses, lastBusinessId)
  return business ? `/admin/${business.id}` : '/dashboard'
}

export function useCurrentBusiness(): UserBusinessMembership | null {
  const memberships = useAuthStore((s) => s.user?.businesses)
  const lastId = useAdminStore((s) => s.activeBusinessId)
  return resolveBusiness(memberships, lastId)
}

/** Destino de todo botón "volver al inicio", respetando el contexto activo. */
export function useHomePath(): string {
  const user = useAuthStore((s) => s.user)
  const lastId = useAdminStore((s) => s.activeBusinessId)
  return homePathFor(user, lastId)
}
