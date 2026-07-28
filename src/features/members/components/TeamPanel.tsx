import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck, Trash2, UserPlus, Users } from 'lucide-react'
import { Avatar } from '@/shared/components/Avatar'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import {
  useInviteMember, useMembers, useRemoveMember, useUpdateMemberRole,
} from '../hooks/useMembers'
import { inviteMemberSchema, type InviteMemberFormData } from '../schemas/inviteMemberSchema'
import type { BusinessMember, BusinessRole } from '@/shared/types/domain'

const ROLE_LABELS: Record<BusinessRole, string> = {
  OWNER: 'Dueño',
  ADMIN: 'Administrador',
  STAFF: 'Staff',
}

const ROLE_TONES: Record<BusinessRole, 'success' | 'info' | 'default'> = {
  OWNER: 'success',
  ADMIN: 'info',
  STAFF: 'default',
}

const ROLE_RANK: Record<BusinessRole, number> = { OWNER: 3, ADMIN: 2, STAFF: 1 }

// Espeja las reglas del backend (BusinessUsersService.assertCanManage /
// assertCanAssignRole) para no ofrecer acciones que el servidor va a rechazar.
function canManage(myRole: BusinessRole | undefined, targetRole: BusinessRole): boolean {
  if (!myRole || targetRole === 'OWNER') return false
  return ROLE_RANK[myRole] > ROLE_RANK[targetRole]
}

function assignableRoles(myRole: BusinessRole | undefined): BusinessRole[] {
  if (!myRole) return []
  return (['ADMIN', 'STAFF'] as const).filter((r) => ROLE_RANK[myRole] > ROLE_RANK[r])
}

function InviteForm({ businessId, myRole, onDone }: { businessId: string; myRole: BusinessRole; onDone: () => void }) {
  const inviteMember = useInviteMember(businessId)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const roles = assignableRoles(myRole)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { role: roles.includes('STAFF') ? 'STAFF' : 'ADMIN' },
  })

  const submit = handleSubmit((data) =>
    inviteMember.mutate(data, {
      onSuccess: () => {
        setSentTo(data.email)
        reset({ email: '', role: roles.includes('STAFF') ? 'STAFF' : 'ADMIN' })
      },
    }),
  )

  return (
    <form
      onSubmit={submit}
      style={{ padding: 16, marginBottom: 14, background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1.5px solid var(--action-primary)' }}
    >
      <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)', marginTop: 0, marginBottom: 12 }}>
        Invitar a alguien al equipo
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, alignItems: 'start' }}>
        <Input
          label="Email"
          type="email"
          placeholder="persona@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Select
          label="Rol"
          options={roles.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
          error={errors.role?.message}
          {...register('role')}
        />
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-subtle)', margin: '8px 0 0' }}>
        Le mandamos un mail con un link para aceptar la invitación. Vence a los 7 días.
      </p>
      {inviteMember.isError && (
        <p style={{ fontSize: 12, color: '#B91C1C', margin: '10px 0 0' }}>{getApiErrorMessage(inviteMember.error)}</p>
      )}
      {sentTo && !inviteMember.isError && (
        <p style={{ fontSize: 12, color: 'var(--green-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, margin: '10px 0 0' }}>
          <MailCheck size={14} color="var(--green-600)" aria-hidden /> Invitación enviada a {sentTo}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <Button type="submit" size="sm" disabled={inviteMember.isPending}>
          {inviteMember.isPending ? 'Enviando…' : 'Enviar invitación'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cerrar
        </Button>
      </div>
    </form>
  )
}

function MemberRow({ member, businessId, myRole }: { member: BusinessMember; businessId: string; myRole: BusinessRole | undefined }) {
  const updateRole = useUpdateMemberRole(businessId)
  const removeMember = useRemoveMember(businessId)
  const [confirming, setConfirming] = useState(false)

  const manageable = canManage(myRole, member.role)
  const roles = assignableRoles(myRole)
  const name = member.user?.name ?? 'Miembro'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
      <Avatar name={name} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)' }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {member.user?.email ?? '—'}
        </div>
      </div>

      {manageable ? (
        <select
          value={member.role}
          disabled={updateRole.isPending}
          onChange={(e) => updateRole.mutate({ userId: member.userId, role: e.target.value as BusinessRole })}
          aria-label={`Rol de ${name}`}
          data-testid={`member-role-${member.userId}`}
          style={{ padding: '5px 9px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border-default)', background: 'var(--surface-card)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text-strong)', cursor: 'pointer' }}
        >
          {roles.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      ) : (
        <Badge tone={ROLE_TONES[member.role]}>{ROLE_LABELS[member.role]}</Badge>
      )}

      {manageable && (
        confirming ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>¿Quitar?</span>
            <button
              type="button"
              onClick={() => removeMember.mutate(member.userId)}
              disabled={removeMember.isPending}
              style={{ padding: '4px 10px', borderRadius: 'var(--r-md)', border: 'none', background: '#B91C1C', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              style={{ padding: '4px 10px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'transparent', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Quitar a ${name} del complejo`}
            data-testid={`member-remove-${member.userId}`}
            style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-subtle)', padding: 4, flexShrink: 0 }}
          >
            <Trash2 size={15} aria-hidden />
          </button>
        )
      )}
    </div>
  )
}

export function TeamPanel({ businessId }: { businessId: string }) {
  const { data: members, isLoading, isError } = useMembers(businessId)
  const user = useAuthStore((s) => s.user)
  const myRole = user?.businesses?.find((b) => b.id === businessId)?.role
  const [inviting, setInviting] = useState(false)

  const canInvite = assignableRoles(myRole).length > 0
  const list = [...(members ?? [])].sort((a, b) => ROLE_RANK[b.role] - ROLE_RANK[a.role])

  if (isLoading) return <p className="text-body-sm text-ink-400">Cargando…</p>
  if (isError) return <p className="text-body-sm text-red-600">No pudimos cargar el equipo.</p>

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-strong)' }}>Equipo</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>
            Quiénes pueden entrar al panel de este complejo y con qué permisos.
          </p>
        </div>
        {canInvite && !inviting && (
          <Button size="sm" leftIcon={<UserPlus size={14} aria-hidden />} onClick={() => setInviting(true)} data-testid="team-invite-button">
            Invitar miembro
          </Button>
        )}
      </div>

      {inviting && myRole && (
        <InviteForm businessId={businessId} myRole={myRole} onDone={() => setInviting(false)} />
      )}

      {list.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', background: 'var(--surface-sunken)', borderRadius: 'var(--r-lg)', border: '1px dashed var(--border-default)', color: 'var(--text-subtle)' }}>
          <Users size={28} color="var(--ink-300)" aria-hidden />
          <p style={{ margin: '8px 0 0', fontSize: 13 }}>Todavía no hay nadie más en el equipo</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((m) => (
            <MemberRow key={m.id} member={m} businessId={businessId} myRole={myRole} />
          ))}
        </div>
      )}

      {!canInvite && (
        <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 14 }}>
          Tu rol te deja ver el equipo, pero no invitar ni cambiar permisos.
        </p>
      )}
    </div>
  )
}
