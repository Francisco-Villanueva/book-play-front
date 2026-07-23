import { useNavigate, useSearchParams } from 'react-router-dom'
import { ResetPasswordScreen } from '@/features/auth/components/ResetPasswordScreen'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  return (
    <div className="min-h-screen bg-ink-25 flex items-center justify-center p-4">
      <div
        className="w-full max-w-[420px] min-h-[600px] bg-ink-25 rounded-2xl shadow-xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        <ResetPasswordScreen
          token={searchParams.get('token') ?? ''}
          onGoToLogin={() => navigate('/login', { replace: true })}
          onRequestNewLink={() => navigate('/forgot-password')}
        />
      </div>
    </div>
  )
}
