export type GlobalRole = 'MASTER' | 'PLAYER'
export type BusinessRole = 'OWNER' | 'ADMIN' | 'STAFF'
export type BookingStatus = 'ACTIVE' | 'CANCELLED'
export type BookingPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED'
// The backend's availability endpoint only returns open windows (no per-slot
// booked/pending/blocked breakdown) — every slot rendered from real data is
// 'available'. The other states remain for SlotChip's generic API but aren't
// produced by real data anymore.
export type SlotState = 'available' | 'pending' | 'booked' | 'blocked'

export interface UserBusinessMembership {
  id: string
  name: string
  role: BusinessRole
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  globalRole: GlobalRole
  businesses?: UserBusinessMembership[]
  createdAt?: string
}

export interface Business {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  description?: string
  timezone: string
  // Plantillas para canchas nuevas — la duración y el precio que rigen son los de cada cancha.
  defaultSlotDuration: number
  defaultPricePerSlot?: number | null
  createdAt: string
}

export interface PublicBusiness {
  id: string
  name: string
  address?: string | null
  description?: string | null
}

export interface BusinessSearchResult {
  id: string
  name: string
  address?: string | null
  description?: string | null
  courtsCount: number
  sports: string[]
}

export interface BusinessUser {
  id: string
  userId: string
  businessId: string
  role: BusinessRole
  user?: User
}

export interface Court {
  id: string
  businessId: string
  name: string
  sportType?: string | undefined
  surface?: string | undefined
  capacity?: number | undefined
  isIndoor?: boolean | undefined
  hasLighting?: boolean | undefined
  slotDuration: number
  pricePerSlot?: number | undefined
  description?: string | undefined
  isActive: boolean
  createdAt: string
}

export interface Booking {
  id: string
  businessId: string
  courtId: string
  userId?: string | null
  guestName?: string | null
  guestPhone?: string | null
  guestEmail?: string | null
  date: string
  startTime: string
  endTime: string
  status: BookingStatus
  totalPrice?: number | null
  paymentStatus: BookingPaymentStatus
  amountPaid?: number | null
  totalPlayers?: number | null
  playersPaid?: number | null
  paymentNotes?: string | null
  notes?: string | null
  court?: Court
  business?: Business
  user?: User
  createdAt: string
}

export interface GuestCancellationInfo {
  id: string
  status: BookingStatus
  businessName: string
  courtName: string
  date: string
  startTime: string
  endTime: string
}

export interface AvailabilityRule {
  id: string
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  courts?: { id: string; name: string }[]
}

export interface ExceptionRule {
  id: string
  date: string
  isAvailable: boolean
  startTime?: string | null
  endTime?: string | null
  reason?: string | null
  courts?: { id: string; name: string }[]
}

export interface AvailableSlots {
  date: string
  courtId: string
  slotDuration: number
  availableSlots: { startTime: string; endTime: string }[]
}

export interface CourtAvailabilitySummary {
  courtId: string
  name: string
  sportType: string | null
  surface: string | null
  slotDuration: number
  pricePerSlot: number | null
  availableSlots: { startTime: string; endTime: string }[]
  nextAvailable: string | null
  isFull: boolean
}

export interface BusinessAvailability {
  date: string
  courts: CourtAvailabilitySummary[]
}

export interface Plan {
  id: string
  name: string
  code: string
  description?: string | null
  priceArs: number
  courtsLimit: number | null
  staffLimit: number | null
  featureKeys: string[]
  isPubliclyVisible: boolean
  isArchived: boolean
  sortOrder: number
  mpPreapprovalPlanId?: string | null
  subscribersCount?: number
  createdAt?: string
}
