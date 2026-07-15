import { useNavigate, useParams } from 'react-router-dom'
import { PaymentConfirmationPanel } from '@/features/billing/components/PaymentConfirmationPanel'

/**
 * Reached via Mercado Pago's back_url after the payer authorizes the
 * subscription — the actual status update arrives asynchronously via webhook,
 * this screen just reads whatever the subscription looks like on return.
 */
export default function UpgradeConfirmationPage() {
  const navigate = useNavigate()
  const { businessId } = useParams<{ businessId: string }>()

  if (!businessId) return null

  return (
    <div className="min-h-screen flex flex-col">
      <PaymentConfirmationPanel businessId={businessId} onContinue={() => navigate(`/admin/${businessId}`)} />
    </div>
  )
}
