import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, MailX, CheckCircle2, LogIn, type LucideIcon } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { useAuthStore } from '@/features/auth/store/authStore'
import { usersApi } from '@/features/users/api/usersApi'
import { useAcceptInvitation, useInvitation } from '@/features/members/hooks/useMembers'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import type { BusinessRole } from '@/shared/types/domain'

const ROLE_LABELS: Record<BusinessRole, string> = {
  OWNER: 'Dueño',
  ADMIN: 'Administrador',
  STAFF: 'Staff',
}

function Layout({ icon: Icon, tone, eyebrow, title, children }: {
  icon: LucideIcon
  tone: 'green' | 'amber' | 'ink'
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  const tones = {
    green: { ring: 'bg-green-200', bg: 'bg-green-50', fg: 'text-green-600' },
    amber: { ring: 'bg-amber-200', bg: 'bg-amber-50', fg: 'text-amber-600' },
    ink: { ring: 'bg-ink-200', bg: 'bg-ink-50', fg: 'text-ink-500' },
  }[tone]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-25 px-6 py-10 text-center">
      <div className="relative mx-auto mb-7 flex h-[108px] w-[108px] items-center justify-center">
        <div className={`absolute inset-0 rounded-full ${tones.ring} opacity-25`} />
        <div className={`absolute inset-3.5 rounded-full ${tones.ring} opacity-40`} />
        <div className={`absolute inset-6 flex items-center justify-center rounded-full ${tones.bg}`}>
          <Icon size={36} className={tones.fg} aria-hidden />
        </div>
      </div>
      <p className={`mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] ${tones.fg}`}>{eyebrow}</p>
      <h1 className="mb-2.5 max-w-[440px] font-display text-[28px] font-bold tracking-[-0.02em] text-ink-900">{title}</h1>
      {children}
    </div>
  )
}

export default function AcceptInvitationPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const { token: authToken, user, setAuth } = useAuthStore()
  const { data: invitation, isLoading, isError, error } = useInvitation(token)
  const acceptInvitation = useAcceptInvitation()

  if (!token) {
    return (
      <Layout icon={MailX} tone="amber" eyebrow="Link inválido" title="Este link de invitación está incompleto">
        <p className="mb-8 max-w-[400px] text-[15px] leading-[1.65] text-ink-500">
          Volvé a abrir el link tal como te llegó por mail, sin recortarlo.
        </p>
        <Button onClick={() => navigate('/login')}>Ir a Book &amp; Play</Button>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout icon={Mail} tone="ink" eyebrow="Invitación" title="Buscando tu invitación…">
        <span className="sr-only">Cargando</span>
      </Layout>
    )
  }

  if (isError || !invitation) {
    return (
      <Layout icon={MailX} tone="amber" eyebrow="No encontrada" title="No pudimos encontrar esta invitación">
        <p className="mb-8 max-w-[400px] text-[15px] leading-[1.65] text-ink-500">
          {getApiErrorMessage(error)} Pedile al complejo que te la mande de nuevo.
        </p>
        <Button onClick={() => navigate('/login')}>Ir a Book &amp; Play</Button>
      </Layout>
    )
  }

  const complexName = invitation.businessName ?? 'un complejo'

  if (invitation.status === 'ACCEPTED') {
    return (
      <Layout icon={CheckCircle2} tone="green" eyebrow="Ya aceptada" title={`Ya formás parte de ${complexName}`}>
        <p className="mb-8 max-w-[400px] text-[15px] leading-[1.65] text-ink-500">
          Esta invitación ya fue usada. Ingresá con tu cuenta para entrar al panel.
        </p>
        <Button onClick={() => navigate('/login')}>Ingresar</Button>
      </Layout>
    )
  }

  if (invitation.status === 'EXPIRED') {
    return (
      <Layout icon={MailX} tone="amber" eyebrow="Vencida" title="Esta invitación venció">
        <p className="mb-8 max-w-[400px] text-[15px] leading-[1.65] text-ink-500">
          Las invitaciones duran 7 días. Pedile a {complexName} que te mande una nueva.
        </p>
        <Button onClick={() => navigate('/login')}>Ir a Book &amp; Play</Button>
      </Layout>
    )
  }

  const roleLabel = ROLE_LABELS[invitation.role]

  if (!authToken) {
    const next = encodeURIComponent(`/invitations/accept?token=${token}`)
    return (
      <Layout icon={Mail} tone="green" eyebrow="Te invitaron" title={`Sumate a ${complexName} como ${roleLabel}`}>
        <p className="mb-8 max-w-[400px] text-[15px] leading-[1.65] text-ink-500">
          La invitación es para <strong className="text-ink-800">{invitation.email}</strong>. Ingresá o creá tu cuenta
          con ese mail y te traemos de vuelta acá.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Button leftIcon={<LogIn size={15} aria-hidden />} onClick={() => navigate(`/login?next=${next}`)}>
            Ingresar
          </Button>
          <Button variant="outline" onClick={() => navigate(`/register?next=${next}`)}>
            Crear cuenta
          </Button>
        </div>
      </Layout>
    )
  }

  const wrongAccount = !!user && user.email.toLowerCase() !== invitation.email.toLowerCase()

  const accept = () =>
    acceptInvitation.mutate(token, {
      onSuccess: async ({ data }) => {
        // La membresía nueva tiene que entrar al store para que el panel y el
        // selector de complejo la vean sin re-loguear.
        if (authToken) {
          try {
            const { data: fullUser } = await usersApi.me()
            setAuth(fullUser, authToken)
          } catch {
            // No es fatal: la membresía ya existe y se sincroniza en el próximo inicio.
          }
        }
        navigate(`/admin/${data.businessId}`, { replace: true })
      },
    })

  return (
    <Layout icon={Mail} tone="green" eyebrow="Te invitaron" title={`Sumate a ${complexName} como ${roleLabel}`}>
      <p className="mb-8 max-w-[400px] text-[15px] leading-[1.65] text-ink-500">
        {wrongAccount ? (
          <>
            La invitación es para <strong className="text-ink-800">{invitation.email}</strong>, pero entraste como{' '}
            <strong className="text-ink-800">{user?.email}</strong>. Cerrá sesión y volvé a ingresar con la cuenta invitada.
          </>
        ) : (
          <>Vas a poder gestionar las reservas y la agenda del complejo desde el panel.</>
        )}
      </p>
      {acceptInvitation.isError && (
        <p className="mb-5 max-w-[400px] text-[14px] text-red-600">{getApiErrorMessage(acceptInvitation.error)}</p>
      )}
      <div className="flex flex-wrap justify-center gap-2.5">
        <Button onClick={accept} disabled={wrongAccount || acceptInvitation.isPending} data-testid="invitation-accept">
          {acceptInvitation.isPending ? 'Aceptando…' : 'Aceptar invitación'}
        </Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Ahora no
        </Button>
      </div>
    </Layout>
  )
}
