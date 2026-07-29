import { useParams } from 'react-router-dom'
import { TeamPanel } from '@/features/members/components/TeamPanel'
import { MobileSubScreen } from './MobileSubScreen'

export function MobileTeamScreen() {
  const { businessId } = useParams<{ businessId: string }>()

  return (
    <MobileSubScreen title="Equipo y usuarios" subtitle="Invitá staff y asigná roles">
      <TeamPanel businessId={businessId ?? ''} />
    </MobileSubScreen>
  )
}
