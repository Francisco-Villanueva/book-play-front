export const FEATURE_LABELS: Record<string, string> = {
  agenda_basic: 'Agenda y reservas básicas',
  schedule_management: 'Gestión de horarios',
  manual_bookings: 'Reservas manuales por admin',
  slot_blocking: 'Bloqueo de horarios',
  up_to_5_courts: 'Hasta 5 canchas',
  up_to_300_bookings: 'Hasta 300 reservas/mes',
  up_to_3_staff: 'Hasta 3 empleados',
  basic_reports: 'Reportes básicos',
  unlimited_courts: 'Canchas ilimitadas',
  unlimited_bookings: 'Reservas ilimitadas',
  unlimited_staff: 'Empleados ilimitados',
  advanced_reports: 'Reportes avanzados',
  beta_features: 'Features beta (por acuerdo)',
}

export function featureLabel(key: string): string {
  return FEATURE_LABELS[key] ?? key
}

export const ALL_FEATURE_KEYS = Object.keys(FEATURE_LABELS)
