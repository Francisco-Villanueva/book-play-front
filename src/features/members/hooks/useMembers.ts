import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { membersApi, type InviteByEmailPayload } from '../api/membersApi'
import { membersKeys } from '../api/membersKeys'
import type { BusinessRole } from '@/shared/types/domain'

export function useMembers(businessId: string | undefined) {
  return useQuery({
    queryKey: membersKeys.all(businessId ?? ''),
    queryFn: () => membersApi.listByBusiness(businessId!).then((res) => res.data),
    enabled: !!businessId,
  })
}

export function useInviteMember(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { inlineError: true },
    mutationFn: (data: InviteByEmailPayload) => membersApi.inviteByEmail(businessId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKeys.all(businessId) }),
  })
}

export function useUpdateMemberRole(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: BusinessRole }) =>
      membersApi.updateRole(businessId, userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKeys.all(businessId) }),
  })
}

export function useRemoveMember(businessId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => membersApi.remove(businessId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKeys.all(businessId) }),
  })
}

export function useInvitation(token: string | null) {
  return useQuery({
    queryKey: membersKeys.invitation(token ?? ''),
    queryFn: () => membersApi.getInvitation(token!).then((res) => res.data),
    enabled: !!token,
    retry: false,
  })
}

export function useAcceptInvitation() {
  return useMutation({
    meta: { inlineError: true },
    mutationFn: (token: string) => membersApi.acceptInvitation(token),
  })
}
