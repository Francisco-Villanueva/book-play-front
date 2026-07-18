import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { HelpCircle } from 'lucide-react'
import { courtsApi } from '@/features/courts/api/courtsApi'
import { courtsKeys } from '@/features/courts/api/courtsKeys'
import type { Court } from '@/shared/types/domain'
import { usePublicBusiness } from '@/features/public-booking/hooks'
import { ComplexHeader } from '@/features/public-booking/components/ComplexHeader'
import { CourtList } from '@/features/public-booking/components/CourtList'
import { SlotPicker } from '@/features/public-booking/components/SlotPicker'
import { GuestForm } from '@/features/public-booking/components/GuestForm'
import { SuccessView } from '@/features/public-booking/components/SuccessView'
import { SummarySidebar } from '@/features/public-booking/components/SummarySidebar'
import { StepProgressBar, StepWizard } from '@/features/public-booking/components/StepProgress'
import type { PublicStep, Player } from '@/features/public-booking/types'

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return desktop
}

export default function PublicBookingPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const isDesktop = useIsDesktop()

  const [step, setStep] = useState<PublicStep>('court')
  const [court, setCourt] = useState<Court | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const business = usePublicBusiness(businessId)
  const courtsQuery = useQuery({
    queryKey: courtsKeys.all(businessId ?? ''),
    queryFn: () => courtsApi.listByBusiness(businessId!).then((res) => res.data),
    enabled: !!businessId,
  })
  const activeCourts = (courtsQuery.data ?? []).filter((c) => c.isActive)

  if (!businessId) return null

  const businessName = business.data?.name ?? 'Complejo'
  const address = business.data?.address

  const resetToStart = () => {
    setCourt(null)
    setDate(null)
    setStartTime(null)
    setEndTime(null)
    setPlayer(null)
    setBookingId(null)
    setStep('court')
  }

  let content: React.ReactNode = null
  if (step === 'court') {
    content = (
      <>
        <ComplexHeader name={businessName} address={address} isLoading={business.isLoading} />
        {!isDesktop && <StepProgressBar step={step} />}
        <div className="flex-1 overflow-y-auto">
          <CourtList
            businessId={businessId}
            courts={activeCourts}
            isLoading={courtsQuery.isLoading}
            isError={courtsQuery.isError}
            onPick={(c) => { setCourt(c); setStep('slots') }}
          />
        </div>
      </>
    )
  } else if (step === 'slots' && court) {
    content = (
      <>
        {!isDesktop && <StepProgressBar step={step} />}
        <SlotPicker
          businessId={businessId}
          court={court}
          initialDate={date ?? ''}
          onBack={() => setStep('court')}
          onPick={(d, s, e) => { setDate(d); setStartTime(s); setEndTime(e); setStep('data') }}
        />
      </>
    )
  } else if (step === 'data' && court && date && startTime && endTime) {
    content = (
      <>
        {!isDesktop && <StepProgressBar step={step} />}
        <GuestForm
          businessId={businessId}
          court={court}
          date={date}
          startTime={startTime}
          endTime={endTime}
          onBack={() => setStep('slots')}
          onConfirm={(p, id) => { setPlayer(p); setBookingId(id); setStep('success') }}
        />
      </>
    )
  } else if (step === 'success' && court && date && startTime && endTime && player && bookingId) {
    content = (
      <SuccessView
        court={court}
        businessName={businessName}
        address={address}
        date={date}
        startTime={startTime}
        endTime={endTime}
        player={player}
        bookingId={bookingId}
        onRebook={resetToStart}
      />
    )
  }

  if (isDesktop) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-page)' }}>
        <div className="sticky top-0 z-50 h-16 px-12 flex items-center justify-between bg-white border-b border-ink-100">
          <img src="/logo-wordmark.svg" height={26} alt="Book & Play" className="h-[26px]" />
          <StepWizard step={step} />
          <div className="w-[140px] flex justify-end">
            <span className="flex items-center gap-1.5 text-[13px] text-ink-500">
              <HelpCircle size={14} className="text-ink-400" aria-hidden /> Ayuda
            </span>
          </div>
        </div>
        <div className="flex-1 flex gap-10 items-start w-full max-w-[1100px] mx-auto px-12 py-9 pb-16">
          <div className="flex-1 min-w-0 bg-white border border-ink-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {content}
          </div>
          <div className="w-[300px] flex-none sticky top-[88px]">
            <SummarySidebar
              businessName={businessName}
              address={address}
              step={step}
              court={court}
              startTime={startTime}
              endTime={endTime}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center" style={{ background: 'var(--surface-sunken)', minHeight: '100dvh' }}>
      <div className="w-full max-w-[480px] flex flex-col" style={{ background: 'var(--surface-page)', minHeight: '100dvh' }}>
        {content}
      </div>
    </div>
  )
}
