import { useNavigate } from 'react-router-dom'
import { ForgotPasswordScreen } from '@/features/auth/components/ForgotPasswordScreen'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-ink-25 flex items-center justify-center p-4">
      <div
        className="w-full max-w-[420px] min-h-[600px] bg-ink-25 rounded-2xl shadow-xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        <ForgotPasswordScreen onBackToLogin={() => navigate('/login')} />
      </div>
    </div>
  )
}
