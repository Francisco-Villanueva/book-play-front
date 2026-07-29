import { useNavigate, useParams } from 'react-router-dom'
import { BillingSettingsPanel } from '@/features/billing/components/BillingSettingsPanel'
import { MobileSubScreen } from './MobileSubScreen'

export function MobileBillingScreen() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()

  return (
    <MobileSubScreen title="Plan y facturación" subtitle="Tu plan, pagos y comprobantes">
      <BillingSettingsPanel
        businessId={businessId ?? ''}
        onUpgrade={() => navigate(`/admin/${businessId}/upgrade`)}
      />
    </MobileSubScreen>
  )
}
