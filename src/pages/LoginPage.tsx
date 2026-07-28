import { useNavigate, useLocation } from 'react-router-dom'
import { LoginScreen } from '@/features/auth/components/LoginScreen'

export default function LoginPage() {
  const navigate = useNavigate()
  // Conserva el ?next= al saltar a registro, para no perder el destino de una invitación.
  const { search } = useLocation()
  return (
    <div className="min-h-screen bg-ink-25 flex items-center justify-center p-4">
      <div
        className="w-full max-w-[420px] min-h-[600px] bg-ink-25 rounded-2xl shadow-xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        <LoginScreen
          onRegister={() => navigate(`/register${search}`)}
          onForgotPassword={() => navigate('/forgot-password')}
        />
      </div>
    </div>
  )
}
