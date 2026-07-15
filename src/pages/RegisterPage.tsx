import { useNavigate } from 'react-router-dom'
import { RegisterScreen } from '@/features/auth/components/RegisterScreen'

export default function RegisterPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-ink-25 flex items-center justify-center p-4">
      <div
        className="w-full max-w-[420px] min-h-[600px] bg-ink-25 rounded-2xl shadow-xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        <RegisterScreen onLogin={() => navigate('/login')} />
      </div>
    </div>
  )
}
